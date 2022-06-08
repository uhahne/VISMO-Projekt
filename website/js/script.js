import * as THREE from "../threejs/ThreeModule.js";
import { OrbitControls } from "../threejs/OrbitControls.js";
import Point from "../js/classes/Point.js";
import Line from "../js/classes/Line.js";
import DefaultModel from "./classes/DefaultModel.js";
import Beam from "./classes/Beam.js";
import Grid from "./classes/Grid.js";
import Camera from "./classes/Camera.js";

let renderer, scene, controls;

let cameras, cameraScene, cameraLeft, cameraRight;
let cameraHelperLeft, cameraHelperRight;

let selectables;
let points, lines;
let beams, toggleBeams;

let selectedPoint, selectedLine;
let lineStartPoint, lineEndPoint; // for line creation

// get canvas and define canvas size
let canvasScene = document.getElementById("vismoViewport");
let canvasWidth, canvasHeight, canvasAspect;

canvasWidth = window.innerWidth;
canvasHeight = window.innerHeight;
canvasAspect = canvasWidth / canvasHeight;

init();
animate();

function init() {
    window.addEventListener("resize", onWindowResize);

    // define renderer for the scene and add setPixelRatio
    renderer = new THREE.WebGLRenderer({ canvas: canvasScene, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x3f3f3f, 1);
    renderer.autoClear = false;

    // scene
    scene = new THREE.Scene();

    // cameras group
    cameras = new THREE.Group();
    cameras.name = "Cameras";
    scene.add(cameras);

    // cameraScene
    cameraScene = new THREE.PerspectiveCamera(75, canvasAspect * 2, 0.1, 1000);
    cameraScene.position.z = 12;
    cameraScene.lookAt(0, 0, 0);
    scene.add(cameraScene);

    // cameraScene controls
    controls = new OrbitControls(cameraScene, renderer.domElement);

    // cameraLeft

    // Camera 2 Test from the exercise
    cameraLeft = new Camera(new THREE.Vector3(5, 0, 2), 1, canvasAspect);
    cameraLeft.rotateY(Math.PI);
    cameraLeft.rotateY(-Math.PI / 4);
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    cameras.add(cameraLeft);
    // console.log("Bildpunkt Ab' auf Kamera 2: ");
    // console.log(cameraLeft.getImageCoord(new THREE.Vector3(3, -2, 3))); // CORRECT

    cameraHelperLeft = new THREE.CameraHelper(cameraLeft);
    scene.add(cameraHelperLeft);

    // Camera 1 Test from the exercise
    cameraRight = new Camera(new THREE.Vector3(0, 0, 0), 1, canvasAspect);
    cameraRight.rotateY(Math.PI);
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    cameras.add(cameraRight);
    // console.log("Bildpunkt Ab' auf Kamera 1: ");
    // console.log(cameraRight.getImageCoord(new THREE.Vector3(3, -2, 3))); // CORRECT

    cameraHelperRight = new THREE.CameraHelper(cameraRight);
    scene.add(cameraHelperRight);

    // points group
    points = new THREE.Group();
    points.name = "Points";
    // lines group
    lines = new THREE.Group();
    lines.name = "Lines";

    // default model
    let defaultModel = new DefaultModel(new THREE.Vector3(0, 0, 0));

    // get the amount of children the default model has
    let childrenAmount = defaultModel.children.length;

    // add the points & lines of default model separately to the scene to make them selectable & editable
    for (let i = childrenAmount - 1; i >= 0; i--) {
        switch (defaultModel.children[i].children[0].type) {
            case "Mesh":
                points.add(defaultModel.children[i]);
                break;
            case "Line":
                lines.add(defaultModel.children[i]);
                break;
        }
    }

    selectables = new THREE.Group();
    selectables.name = "Selectables";
    selectables.add(points);
    selectables.add(lines);
    scene.add(selectables);

    // beams group
    beams = new THREE.Group();
    toggleBeams = "none";

    // grid
    scene.add(new Grid());

    document.getElementById("camUI").setAttribute("style", "display: none");
    document.getElementById("settingsUI").setAttribute("style", "display: none");

    document.getElementById("imagePlaneCamLeftAKG").innerHTML = cameraLeft.getAKG();
    document.getElementById("imagePlaneCamRightAKG").innerHTML = cameraRight.getAKG();
}

$(".buttonactive").click(function () {
    $(".buttonactive").removeClass("active");
    $(this).addClass("active");
});

function animate() {
    requestAnimationFrame(animate);

    // render scene
    renderer.clear();
    controls.update();

    //set viewport for 3D viewer
    renderer.setViewport(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);

    cameraHelperLeft.visible = true;
    cameraHelperRight.visible = true;

    renderer.render(scene, cameraScene);

    //set viewport for left 2D viewer
    renderer.setViewport(0, 0, canvasWidth / 2, canvasHeight / 2);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;

    renderer.render(scene, cameraLeft);

    //set viewport for right 2D viewer
    renderer.setViewport(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight / 2);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;

    renderer.render(scene, cameraRight);
}

// get tab buttons by id and add click event listener
document
    .getElementById("building")
    .addEventListener("click", handleBuildingTab);
document.getElementById("camera").addEventListener("click", handleCamTab);
document
    .getElementById("settings")
    .addEventListener("click", handleSettingsTab);

// display input fields for point selection and manipulation
function handleBuildingTab(_event) {
    document.getElementById("camUI").setAttribute("style", "display: none");
    document
        .getElementById("pointUI")
        .setAttribute("style", "visibility: visible");
    document
        .getElementById("lineUI")
        .setAttribute("style", "visibility: visible");
    document.getElementById("settingsUI").setAttribute("style", "display: none");
}

// display input fields for camera
function handleCamTab(_event) {
    document.getElementById("pointUI").setAttribute("style", "display: none");
    document.getElementById("lineUI").setAttribute("style", "display: none");
    document.getElementById("settingsUI").setAttribute("style", "display: none");
    document.getElementById("camUI").setAttribute("style", "visibility: visible");
}


function handleSettingsTab(_event) {
    document.getElementById("pointUI").setAttribute("style", "display: none");
    document.getElementById("lineUI").setAttribute("style", "display: none");
    document.getElementById("camUI").setAttribute("style", "display: none");
    document
        .getElementById("settingsUI")
        .setAttribute("style", "visibility: visible");
}

document
    .getElementById("createPoint")
    .addEventListener("click", handleCreatePoint);

function handleCreatePoint(_event) {
    let pointName = document.getElementById("newPointName").value;
    document.getElementById("pointNameFeedback").innerHTML = ""; // reset feedback field

    // check if user put in a name
    if (document.getElementById("newPointName").value == "") {
        document.getElementById("pointNameFeedback").innerHTML = "Name eingeben!";
        return;
    }
    // check if the name already exists
    if (points.getObjectByName(pointName) != undefined) {
        document.getElementById("pointNameFeedback").innerHTML =
            "Bereits vergeben!";
        return;
    }
    let newPoint = new Point(pointName, new THREE.Vector3(0, 0, 0), 0.25); // create new point
    points.add(newPoint); // add new point to the scene
    unmarkObject(selectedPoint); // unmark previous point
    markObject(newPoint); // mark new point
    resetDomElementForPoint(newPoint); // reset the dom element where a point can be manipulated
    selectedPoint = newPoint; // save the point for manipulation
    handleResetBeams();
}

document
    .getElementById("setStartPoint")
    .addEventListener("click", handleSetStartPoint);
function handleSetStartPoint(_event) {
    lineStartPoint = selectedPoint;
    document.getElementById("startPointName").innerText = selectedPoint.name;
}

document
    .getElementById("setEndPoint")
    .addEventListener("click", handleSetEndPoint);
function handleSetEndPoint(_event) {
    lineEndPoint = selectedPoint;
    document.getElementById("endPointName").innerText = selectedPoint.name;
}

document
    .getElementById("createLine")
    .addEventListener("click", handleCreateLine);

function handleCreateLine(_event) {
    document.getElementById("lineFeedback").innerHTML = ""; // reset feedback field

    // check if the start & end point are undefined
    if (lineStartPoint == undefined || lineEndPoint == undefined) {
        document.getElementById("lineFeedback").innerHTML = "Punkte auswählen!";
        return;
    }
    // check if the start & end point are identical
    if (lineStartPoint == lineEndPoint) {
        document.getElementById("lineFeedback").innerHTML = "Punkte identisch!";
        return;
    }
    // check if an identical line already exists (by name)
    if (
        lines.getObjectByName(lineStartPoint.name + "-" + lineEndPoint.name) !=
        undefined ||
        lines.getObjectByName(lineEndPoint.name + "-" + lineStartPoint.name) !=
        undefined
    ) {
        document.getElementById("lineFeedback").innerHTML = "Existiert bereits!";
        return;
    }
    let newLine = new Line(lineStartPoint, lineEndPoint); // create new line
    lines.add(newLine); // add new line to the scene
    unmarkObject(selectedLine); // unmark previous line
    markObject(newLine); // mark new line
    resetDomElementForLine(newLine); // reset the dom element where a line can be manipulated
}

function showLeftCameraParameters(_point) {
    document.getElementById("leftCamCoordX").value = cameraLeft.position.x;
    document.getElementById("leftcamCoordY").value = cameraLeft.position.y;
    document.getElementById("leftCamCoordZ").value = cameraLeft.position.z;

    document.getElementById("leftCamPrincipalPointX").value = cameraLeft.principalPoint.x;
    document.getElementById("leftCamPrincipalPointY").value = cameraLeft.principalPoint.y;
    document.getElementById("leftCamPrincipalPointZ").value = cameraLeft.principalPoint.z;

    document.getElementById("leftCamDistance").value = cameraLeft.near;
    document.getElementById("leftFieldOfView").value = cameraLeft.fov;
    document.getElementById("leftAspectRatio").innerHTML = cameraLeft.aspect.toFixed(3);
}

function showRightCameraParameters(_point) {
    document.getElementById("rightCamCoordX").value = cameraRight.position.x;
    document.getElementById("rightCamCoordY").value = cameraRight.position.y;
    document.getElementById("rightCamCoordZ").value = cameraRight.position.z;

    document.getElementById("rightCamPrincipalPointX").value =
        cameraRight.principalPoint.x;
    // document.getElementById("rightCamPrincipalPointy").value = cameraRight.principalPoint.y;
    document.getElementById("rightCamPrincipalPointZ").value =
        cameraRight.principalPoint.z;

    document.getElementById("rightCamDistance").value = cameraLeft.near;
    document.getElementById("rightFieldOfView").value = cameraRight.fov;
    document.getElementById("rightAspectRatio").innerHTML = cameraRight.aspect.toFixed(3);
}

showLeftCameraParameters();
showRightCameraParameters();

// Update Camera Parameters and make the camera adjust properly

// create EventListener for the changing of the x-y-z-coordinate value for the left Camera & Camera Parameters
document.getElementById("leftCamCoordX").addEventListener("change", handleChangeCameraLeftPositionX);
function handleChangeCameraLeftPositionX(_event) {
    // move the camera in the scene
    cameraLeft.position.x = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamLeftAKG").innerHTML = cameraLeft.getAKG();
}

document.getElementById("leftcamCoordY").addEventListener("change", handleChangeCameraLeftPositionY);
function handleChangeCameraLeftPositionY(_event) {
    // move the camera in the scene
    cameraLeft.position.y = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamLeftAKG").innerHTML = cameraLeft.getAKG();
}

document.getElementById("leftCamCoordZ").addEventListener("change", handleChangeCameraLeftPositionZ);
function handleChangeCameraLeftPositionZ(_event) {
    // move the camera in the scene
    cameraLeft.position.z = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamLeftAKG").innerHTML = cameraLeft.getAKG();
}

// Make the left Camera Parameters adjustable
document.getElementById("leftFieldOfView").addEventListener("change", handleChangeCameraLeftFOV);
function handleChangeCameraLeftFOV(_event) {
    // adjust the FOV
    cameraLeft.fov = parseFloat(_event.target.value);
    cameraLeft.updateProjectionMatrix();
    cameraHelperLeft.update();
}


document.getElementById("leftCamDistance").addEventListener("change", handleChangeCameraLeftCamDistance);
function handleChangeCameraLeftCamDistance(_event) {
    // adjust the NearPlane
    cameraLeft.near = parseFloat(_event.target.value);
    cameraLeft.updateProjectionMatrix();
    cameraHelperLeft.update();
}


// create EventListener for the changing of the x-y-z-coordinate value for the right Camera & Camera Parameters

document.getElementById("rightCamCoordX").addEventListener("change", handleChangeCameraRightPositionX);
function handleChangeCameraRightPositionX(_event) {
    // move the camera in the scene
    cameraRight.position.x = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamRightAKG").innerHTML = cameraRight.getAKG();
}

document.getElementById("rightCamCoordY").addEventListener("change", handleChangeCameraRightPositionY);
function handleChangeCameraRightPositionY(_event) {
    // move the camera in the scene
    cameraRight.position.y = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamRightAKG").innerHTML = cameraRight.getAKG();
}

document.getElementById("rightCamCoordZ").addEventListener("change", handleChangeCameraRightPositionZ);
function handleChangeCameraRightPositionZ(_event) {
    // move the camera in the scene
    cameraRight.position.z = Number(_event.target.value);

    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);

    handleResetBeams();

    document.getElementById("imagePlaneCamRightAKG").innerHTML = cameraRight.getAKG();
}

// Make the Right Camera Parameters adjustable
document.getElementById("rightFieldOfView").addEventListener("change", handleChangeCameraRightFOV);
function handleChangeCameraRightFOV(_event) {
    // adjust the FOV
    cameraRight.fov = parseFloat(_event.target.value);
    cameraRight.updateProjectionMatrix();
    cameraHelperRight.update();
}

document.getElementById("rightCamDistance").addEventListener("change", handleChangeCameraRightCamDistance);
function handleChangeCameraRightCamDistance(_event) {
    // adjust the NearPlane
    cameraRight.near = parseFloat(_event.target.value);
    cameraRight.updateProjectionMatrix();
    cameraHelperRight.update();
}

function resetDomElementForPoint(_point) {
    // input the name of the point
    document.getElementById("pointName").innerText = _point.name;
    // input the x-/y-/z-coordinate on the page to be the same as the actual object's x-coordinate
    document.getElementById("pointCoordX").value = _point.position.x;
    document.getElementById("pointCoordY").value = _point.position.y;
    document.getElementById("pointCoordZ").value = _point.position.z;
    /* picture plane coordinates */ //TODO: round coordinate values in function
    // camera left
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    let pointLeftImgCoord = cameraLeft.getImageCoord(_point.position);
    document.getElementById("pointCoordXLeft").innerHTML = pointLeftImgCoord.x;
    document.getElementById("pointCoordYLeft").innerHTML = pointLeftImgCoord.y;
    // camera right
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    let pointRightImgCoord = cameraRight.getImageCoord(_point.position);
    document.getElementById("pointCoordXRight").innerHTML = pointRightImgCoord.x;
    document.getElementById("pointCoordYRight").innerHTML = pointRightImgCoord.y;
}

function resetDomElementForLine(_line) {
    // save the point for deletion
    selectedLine = _line;
    // input the name of the line
    document.getElementById("lineName").innerText = _line.name;
}

function emptyDomElementForPoint(_point) {
    document.getElementById("pointName").innerText = "";
    // world coordinates
    document.getElementById("pointCoordX").value = 0;
    document.getElementById("pointCoordY").value = 0;
    document.getElementById("pointCoordZ").value = 0;
    // picture plane coordinates
    document.getElementById("pointCoordXLeft").innerHTML = 0;
    document.getElementById("pointCoordYLeft").innerHTML = 0;
    document.getElementById("pointCoordXRight").innerHTML = 0;
    document.getElementById("pointCoordYRight").innerHTML = 0;
}

function emptyDomElementForLine(_line) {
    document.getElementById("lineName").innerText = "";
}

function markObject(_object) {
    _object.material.color.set(0xff802a);
}

// give the object its default color
function unmarkObject(_object) {
    if (_object != null) _object.material.color.set(_object.color);
}

// create an EventListener for clicking the "delete point"-button
document
    .getElementById("deletePoint")
    .addEventListener("click", handleDeletePoint);
// create a function to handle the clicking of the button
function handleDeletePoint(_event) {
    // loop through all points of the scene
    for (let i = 0; i < points.children.length; i++) {
        // find the object that matches the object id
        if (points.children[i].uuid == selectedPoint.uuid) {
            // remove the object
            points.remove(points.children[i]);

            handleResetBeams();
        }
    }
    // remove all lines connected to the point
    updateLinesConnectedToPoint("remove");

    emptyDomElementForPoint();
}

document.getElementById("deleteLine").addEventListener("click", handleDeleteLine);
function handleDeleteLine(_event) {
    for (let i = 0; i < lines.children.length; i++)
        if (lines.children[i].uuid == selectedLine.uuid)
            lines.remove(lines.children[i]);
    emptyDomElementForLine();
}

// create EventListener for the changing of the x-coordinate value for a point
document.getElementById("pointCoordX").addEventListener("change", handleChangePointPositionX);
// handle the changing of the x-coordinate value
function handleChangePointPositionX(_event) {
    // move the point in the scene
    selectedPoint.position.x = _event.target.value;
    // update connected lines
    updateLinesConnectedToPoint("change");

    resetDomElementForPoint(selectedPoint);
    handleResetBeams();
}

document.getElementById("pointCoordY").addEventListener("change", handleChangePointPositionY);
function handleChangePointPositionY(_event) {
    selectedPoint.position.y = _event.target.value;
    updateLinesConnectedToPoint("change");

    resetDomElementForPoint(selectedPoint);
    handleResetBeams();
}
document.getElementById("pointCoordZ").addEventListener("change", handleChangePointPositionZ);
function handleChangePointPositionZ(_event) {
    selectedPoint.position.z = _event.target.value;
    updateLinesConnectedToPoint("change");

    resetDomElementForPoint(selectedPoint);
    handleResetBeams();
}

function updateLinesConnectedToPoint(_operation) {
    // get the amount of children the lines group
    let childrenAmount = lines.children.length;

    // loop through all lines of the scene
    for (let i = childrenAmount - 1; i >= 0; i--) {
        // check if there's a line object
        if (
            lines.children[i].children[0] != undefined &&
            lines.children[i].children[0].type == "Line"
        ) {
            // check if the line is connected to the point
            if (lines.children[i].isConnectedToPoint(selectedPoint)) {
                switch (_operation) {
                    case "change":
                        lines.children[i].update();
                        break;
                    case "remove":
                        lines.remove(lines.children[i]);
                        emptyDomElementForLine();
                        break;
                }
            }
        }
    }
}

function onWindowResize() {
    // recompute the aspect ratio from new window size
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasAspect = canvasWidth / canvasHeight;

    renderer.setSize(canvasWidth, canvasHeight);

    cameraScene.aspect = canvasAspect * 2;
    cameraScene.updateProjectionMatrix();

    cameraLeft.aspect = canvasAspect;
    cameraLeft.updateProjectionMatrix();

    cameraRight.aspect = canvasAspect;
    cameraRight.updateProjectionMatrix();
}

/* BEAMS */

// draw beams from Camera-Projection-Center to Points
function createBeams(_cameras, _objects) {
    // _cameras: THREE.Object3D[] | _objects: THREE.Object3D[]
    beams.clear();
    for (let i = 0; i < _cameras.children.length; i++) {
        for (let j = 0; j < _objects.children.length; j++) {
            beams.add(new Beam(_cameras.children[i], _objects.children[j]));
        }
    }
}

function createBeam(_cameras, _object) {
    // _cameras: THREE.Object3D[] | _objects: THREE.Object3D
    if (selectedPoint != null) {
        beams.clear();
        for (let i = 0; i < _cameras.children.length; i++) {
            beams.add(new Beam(_cameras.children[i], _object));
        }
    }
}

function handleResetBeams() {
    switch (toggleBeams) {
        case "none":
            break;
        case "all":
            resetBeams(cameras, points);
            break;
        case "one":
            resetBeam(cameras, selectedPoint);
            break;
    }
}

function resetBeam(_cameras, _object) {
    beams.clear();
    createBeam(_cameras, _object);
}

function resetBeams(_cameras, _objects) {
    beams.clear();
    createBeams(_cameras, _objects);
}

document.getElementById("beams").addEventListener("change", handleBeams);

function handleBeams(_event) {
    switch (_event.target.value) {
        case "none":
            toggleBeams = "none";
            beams.removeFromParent();
            break;
        case "all":
            toggleBeams = "all";
            createBeams(cameras, points);
            scene.add(beams);
            break;
        case "one":
            toggleBeams = "one";
            createBeam(cameras, selectedPoint);
            scene.add(beams);
            break;
    }
}

/* RAYCASTING 3D-VIEWER + 2D-VIEWERS (left & right camera) */

let raycaster = new THREE.Raycaster(); // create a raycaster
let mouse = new THREE.Vector2(); // create vector the save the coordinates of where the user clicked on the page
document.addEventListener("mousedown", onDocumentMouseDown); // create an EventListener to react on a mouse-click

function onDocumentMouseDown(_event) {
    // handle the user clicking somewhere
    if (_event.which == 1) {
        // check if user clicked with the left mouse button
        castRay(
            _event,
            renderer,
            cameraScene,
            scene.getObjectByName("Selectables").children
        );
        castRay(
            _event,
            renderer,
            cameraLeft,
            scene.getObjectByName("Points").children
        );
        castRay(
            _event,
            renderer,
            cameraRight,
            scene.getObjectByName("Points").children
        );
    }
}

function castRay(_event, _renderer, _camera, _selectableObjects) {
    // TODO: these bounds do not reflect the new viewports (*4 in line 584 fixes it for now)
    let canvasBounds = _renderer.getContext().canvas.getBoundingClientRect();

    // save the coordinates of the point on which the user clicked
    switch (_camera) {
        case cameraScene:
            mouse.x =
                ((_event.clientX - canvasBounds.left) /
                    (canvasBounds.right - canvasBounds.left)) *
                2 -
                1;
            mouse.y =
                -(
                    (_event.clientY - canvasBounds.top) /
                    (canvasBounds.bottom - canvasBounds.top)
                ) *
                4 +
                1;
            break;
        case cameraLeft:
            mouse.x =
                ((_event.clientX - canvasBounds.left) /
                    (canvasBounds.right - canvasBounds.left)) *
                4 -
                1;
            mouse.y =
                -(
                    (_event.clientY - canvasBounds.top) /
                    (canvasBounds.bottom - canvasBounds.top)
                ) *
                4 +
                3;
            break;
        case cameraRight:
            mouse.x =
                ((_event.clientX - canvasBounds.left) /
                    (canvasBounds.right - canvasBounds.left)) *
                4 -
                3;
            mouse.y =
                -(
                    (_event.clientY - canvasBounds.top) /
                    (canvasBounds.bottom - canvasBounds.top)
                ) *
                4 +
                3;
            break;
    }

    raycaster.setFromCamera(mouse, _camera); // update the picking ray with the camera and mouse position

    let recursiveFlag = true; // true = it also checks all descendants of the objects || false = it only checks intersection with the objects
    let intersects = raycaster.intersectObjects(
        _selectableObjects,
        recursiveFlag
    ); // get the objects that intersected with the ray

    if (intersects[0] != undefined) {
        // check if a object intersected with the ray
        switch (intersects[0].object.type) {
            case "Mesh": // = Point
                unmarkObject(selectedPoint); // un-mark the previously selected object
                markObject(intersects[0].object); // mark/color the new object
                resetDomElementForPoint(intersects[0].object.parent); // reset the dom element to show its values
                selectedPoint = intersects[0].object.parent; // save the point for manipulation
                handleResetBeams();
                break;
            case "Line": // = Line
                unmarkObject(selectedLine);
                markObject(intersects[0].object);
                resetDomElementForLine(intersects[0].object.parent);
                break;
        }
    }
}
