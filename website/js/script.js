import * as THREE from "../threejs/ThreeModule.js";
import { OrbitControls } from "../threejs/OrbitControls.js";
import { GLTFLoader } from '../threejs/GLTFLoader.js';
import Point from "../js/classes/Point.js";
import Line from "../js/classes/Line.js";
import DefaultModel from "./classes/DefaultModel.js";
import Beam from "./classes/Beam.js";
import Grid from "./classes/Grid.js";
import CameraGrid from "./classes/CameraGrid.js";
import Camera from "./classes/Camera.js";
import CameraCoordinateSystem from "./classes/CameraCoordinateSystem.js";
import CoordinateSystem from "./classes/CoordinateSystem.js";
import { TransformControls } from "../threejs/TransformControls.js";
import Epipole from "./classes/Epipole.js";
import UI from "./classes/Ui.js";

let renderer, scene;
let controls, cameraLeftControls, cameraRightControls;

let cameras, cameraScene, cameraLeft, cameraRight;
let cameraHelperLeft, cameraHelperRight;

let selectables;
let points, lines;
let beams, toggleBeams;
let epipoleLeft, epipoleRight;

let worldGrid, worldCoordinateSystem;

let cameraLeftGrid, cameraRightGrid;
let cameraLeftCoordinateSystem, cameraRightCoordinateSystem;

let selectedPoint, selectedLine;
let lineStartPoint, lineEndPoint; // for line creation

let canvasScene = document.getElementById("vismoViewport"); // get canvas
let canvasWidth, canvasHeight, canvasAspect; // define canvas size

canvasWidth = window.innerWidth;
canvasHeight = window.innerHeight;
canvasAspect = canvasWidth / canvasHeight;

let raycaster, mouse;

init();
animate();

function init() {
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
    let trackPad = document.getElementById("trackPad");
    controls = new OrbitControls(cameraScene, trackPad);

    // cameraLeft = Camera 2 from the exercise
    cameraLeft = new Camera(new THREE.Vector3(5, 0, 2), 1, canvasAspect);
    cameraLeft.name = "leftCam";
    cameraLeft.rotateY(Math.PI);
    cameraLeft.rotateY(-Math.PI / 4);
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    cameras.add(cameraLeft);
    cameraHelperLeft = new THREE.CameraHelper(cameraLeft);
    scene.add(cameraHelperLeft);
    cameraLeftControls = new TransformControls(cameraScene, document.getElementById("transformControlsCanvas"));
    cameraLeftControls.size = 1.5;
    cameraLeftControls.mode = "rotate";
    cameraLeftControls.space = "local";
    cameraLeftControls.attach(cameraLeft);
    scene.add(cameraLeftControls);

    // cameraRight = Camera 1 from the exercise
    cameraRight = new Camera(new THREE.Vector3(0, 0, 0), 1, canvasAspect);
    cameraRight.name = "rightCam";
    cameraRight.rotateY(Math.PI);
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    cameras.add(cameraRight);
    cameraHelperRight = new THREE.CameraHelper(cameraRight);
    scene.add(cameraHelperRight);
    cameraRightControls = new TransformControls(cameraScene, document.getElementById("transformControlsCanvas"));
    cameraRightControls.size = 1.5;
    cameraRightControls.mode = "rotate";
    cameraRightControls.space = "local";
    cameraRightControls.attach(cameraRight);
    scene.add(cameraRightControls);

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

    // selectable objects in the scene
    selectables = new THREE.Group();
    selectables.name = "Selectables";
    selectables.add(points);
    selectables.add(lines);
    scene.add(selectables);

    document.getElementById("giraffenButton").addEventListener("click", handleLoadGigiModel);

    // beams group
    beams = new THREE.Group();
    toggleBeams = "none";

    // epipoles
    epipoleLeft = new Epipole("Epipol", new THREE.Vector3(0, 0, 0), 0.05);
    epipoleRight = new Epipole("Epipol", new THREE.Vector3(0, 0, 0), 0.05);

    // #region (GRID)
    // world grid
    worldGrid = new Grid();
    scene.add(worldGrid);
    // left camera grid
    cameraLeftGrid = new CameraGrid();
    cameraLeft.add(cameraLeftGrid);
    cameraLeftGrid.rotateX(Math.PI / 2); // parallel to camera
    cameraLeftGrid.update(); // adjust position
    // right camera grid
    cameraRightGrid = new CameraGrid();
    cameraRight.add(cameraRightGrid);
    cameraRightGrid.rotateX(Math.PI / 2);
    cameraRightGrid.update();
    // #endregion (GRID)

    // #region (COORDINATE SYSTEMS)
    // wold coordinate system
    worldCoordinateSystem = new CoordinateSystem();
    scene.add(worldCoordinateSystem);
    // left camera coordinate system
    cameraLeftCoordinateSystem = new CameraCoordinateSystem();
    cameraLeft.add(cameraLeftCoordinateSystem);
    cameraLeftCoordinateSystem.rotateY(Math.PI);
    cameraLeftCoordinateSystem.update();
    // right camera coordinate system
    cameraRightCoordinateSystem = new CameraCoordinateSystem();
    cameraRight.add(cameraRightCoordinateSystem);
    cameraRightCoordinateSystem.rotateY(Math.PI);
    cameraRightCoordinateSystem.update();
    // #endregion (COORDINATE SYSTEMS)

    // canvas to use transformControls
    let canvasViewer3D = document.getElementById("transformControlsCanvas")
    canvasViewer3D.width = canvasWidth;
    canvasViewer3D.height = canvasHeight / 2;

    // needed for raycasting
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(); // create vector the save the coordinates of where the user clicked on the page

    // UI
    document.getElementById("leftCamAKG").innerHTML = cameraLeft.getAKG();
    document.getElementById("rightCamAKG").innerHTML = cameraRight.getAKG();
    updateCameraTab(cameraLeft);
    updateCameraTab(cameraRight);

    UI.init();

    // #region (EVENT LISTENERS)
    // Window Resize
    window.addEventListener("resize", onWindowResize);
    // Points
    document.getElementById("createPoint").addEventListener("click", handleCreatePoint);
    document.getElementById("pointCoordX").addEventListener("change", handleChangePointPosition);
    document.getElementById("pointCoordY").addEventListener("change", handleChangePointPosition);
    document.getElementById("pointCoordZ").addEventListener("change", handleChangePointPosition);
    document.getElementById("deletePoint").addEventListener("click", handleDeletePoint);
    // Lines
    document.getElementById("setStartPoint").addEventListener("click", handleSetStartPoint);
    document.getElementById("setEndPoint").addEventListener("click", handleSetEndPoint);
    document.getElementById("createLine").addEventListener("click", handleCreateLine);
    document.getElementById("deleteLine").addEventListener("click", handleDeleteLine);
    // Beams
    document.getElementById("beams").addEventListener("change", handleBeams);
    document.getElementById("cameraRotation").addEventListener("change", handleToggleCameraRotation);
    document.getElementById("worldCoordSystem").addEventListener("change", handleToggleWorldCoordSystem);
    // Cameras
    // left
    document.getElementById("leftCamCoordX").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamCoordY").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamCoordZ").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamFOV").addEventListener("change", handleChangeCameraFOV);
    document.getElementById("leftCamDistance").addEventListener("change", handleChangeCameraDistance);
    // right
    document.getElementById("rightCamCoordX").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamCoordY").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamCoordZ").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamFOV").addEventListener("change", handleChangeCameraFOV);
    document.getElementById("rightCamDistance").addEventListener("change", handleChangeCameraDistance);
    // Rays
    document.addEventListener("mousedown", onDocumentMouseDown);
    // Camera TransformControls
    cameraLeftControls.addEventListener("change", onCameraControlsChange);
    cameraRightControls.addEventListener("change", onCameraControlsChange);
    // #endregion (EVENT LISTENERS)
}

$(".buttonactive").click(function () {
    $(".buttonactive").removeClass("active");
    $(this).addClass("active");
});

function handleLoadGigiModel() {
    deleteAllPointsAndLines();
    loadModel("giraffe.gltf");
}

function deleteAllPointsAndLines() {
    for (let i = points.children.length; i >= 0; i--) {
        points.remove(points.children[i]);
    }
    for (let i = lines.children.length; i >= 0; i--) {
        lines.remove(lines.children[i]);
    }
}

// loader function
function loadModel(_model) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.x = 4;
    spotLight.position.y = 4;
    scene.add(spotLight);

    // gltf
    const loader = new GLTFLoader().setPath('model/');

    loader.load(_model, function (gltf) {
        gltf.scene.position.set(0, 0, 4.5)
        scene.add(gltf.scene);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // render scene
    renderer.clear();
    controls.update();

    //set viewport for 3D viewer
    renderer.setViewport(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);

    cameraHelperLeft.visible = true;
    cameraHelperRight.visible = true;
    worldCoordinateSystem.visible = true;
    cameraLeftGrid.visible = false;
    cameraRightGrid.visible = false;
    cameraLeftCoordinateSystem.visible = false;
    cameraRightCoordinateSystem.visible = false;
    epipoleLeft.visible = false;
    epipoleRight.visible = false;
    cameraLeftControls.visible = true;
    cameraRightControls.visible = true;
    worldGrid.visible = true;

    renderer.render(scene, cameraScene);

    //set viewport for left 2D viewer
    renderer.setViewport(0, 0, canvasWidth / 2, canvasHeight / 2);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;
    worldCoordinateSystem.visible = false;
    cameraLeftGrid.visible = true;
    cameraRightGrid.visible = false;
    cameraLeftCoordinateSystem.visible = true;
    cameraRightCoordinateSystem.visible = false;
    epipoleLeft.visible = true;
    epipoleRight.visible = true;
    cameraLeftControls.visible = false;
    cameraRightControls.visible = false;
    worldGrid.visible = false;

    renderer.render(scene, cameraLeft);

    //set viewport for right 2D viewer
    renderer.setViewport(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight / 2);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;
    worldCoordinateSystem.visible = false;
    cameraLeftGrid.visible = false;
    cameraRightGrid.visible = true;
    cameraLeftCoordinateSystem.visible = false;
    cameraRightCoordinateSystem.visible = true;
    epipoleLeft.visible = true;
    epipoleRight.visible = true;
    cameraLeftControls.visible = false;
    cameraRightControls.visible = false;
    worldGrid.visible = false;

    renderer.render(scene, cameraRight);
}

// #region (POINTS)
function handleCreatePoint() {
    let pointName = document.getElementById("newPointName").value;
    document.getElementById("pointNameFeedback").innerHTML = ""; // reset feedback field

    // check if user put in a name
    if (document.getElementById("newPointName").value == "") {
        document.getElementById("pointNameFeedback").innerHTML = "Bitte Name eingeben";
        return;
    }
    // check if the name already exists
    if (points.getObjectByName(pointName) != undefined) {
        document.getElementById("pointNameFeedback").innerHTML =
            "Dieser Name ist bereits vergeben";
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

function handleChangePointPosition() {
    if (selectedPoint != undefined) {
        selectedPoint.position.set(
            Number(document.getElementById("pointCoordX").value),
            Number(document.getElementById("pointCoordY").value),
            Number(document.getElementById("pointCoordZ").value)
        );
        updateLinesConnectedToPoint("change");
        resetDomElementForPoint(selectedPoint);
        handleResetBeams();
    }
}

function handleDeletePoint() {
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

function resetDomElementForPoint(_point) {
    // input the name of the point
    document.getElementById("pointName").innerText = _point.name;
    // input the x-/y-/z-coordinate on the page to be the same as the actual object's x-coordinate
    document.getElementById("pointCoordX").value = _point.position.x;
    document.getElementById("pointCoordY").value = _point.position.y;
    document.getElementById("pointCoordZ").value = _point.position.z;

    // #region (picture coordinates)
    // CAMERA LEFT
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    // world coordinate system
    let pointLeftImgCoordWorld = cameraLeft.getImageCoordWorld(_point.position);
    document.getElementById("pointCoordXLeftWorld").innerHTML = pointLeftImgCoordWorld.x.toFixed(3);
    document.getElementById("pointCoordYLeftWorld").innerHTML = pointLeftImgCoordWorld.y.toFixed(3);
    document.getElementById("pointCoordZLeftWorld").innerHTML = pointLeftImgCoordWorld.z.toFixed(3);
    // camera coordinate system
    let pointLeftImgCoordCamera = cameraLeft.getImageCoordCamera(_point.position);
    document.getElementById("pointCoordXLeft").innerHTML = pointLeftImgCoordCamera.x.toFixed(3);
    document.getElementById("pointCoordYLeft").innerHTML = pointLeftImgCoordCamera.y.toFixed(3);

    // CAMERA RIGHT
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    // world coordinate system
    let pointRightImgCoordWorld = cameraRight.getImageCoordWorld(_point.position);
    document.getElementById("pointCoordXRightWorld").innerHTML = pointRightImgCoordWorld.x.toFixed(3);
    document.getElementById("pointCoordYRightWorld").innerHTML = pointRightImgCoordWorld.y.toFixed(3);
    document.getElementById("pointCoordZRightWorld").innerHTML = pointRightImgCoordWorld.z.toFixed(3);
    // camera coordinate system
    let pointRightImgCoordCamera = cameraRight.getImageCoordCamera(_point.position);
    document.getElementById("pointCoordXRight").innerHTML = pointRightImgCoordCamera.x.toFixed(3);
    document.getElementById("pointCoordYRight").innerHTML = pointRightImgCoordCamera.y.toFixed(3);
    // #endregion (picture coordinates)
}

function emptyDomElementForPoint() {
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
    // picture plane coordinates in world coordinate system
    document.getElementById("pointCoordXLeftWorld").innerHTML = 0;
    document.getElementById("pointCoordYLeftWorld").innerHTML = 0;
    document.getElementById("pointCoordZLeftWorld").innerHTML = 0;
    document.getElementById("pointCoordXRightWorld").innerHTML = 0;
    document.getElementById("pointCoordYRightWorld").innerHTML = 0;
    document.getElementById("pointCoordZRightWorld").innerHTML = 0;
}
// #endregion (POINTS)

// #region (LINES)
function handleSetStartPoint() {
    lineStartPoint = selectedPoint;
    document.getElementById("startPointName").innerText = selectedPoint.name;
}

function handleSetEndPoint() {
    lineEndPoint = selectedPoint;
    document.getElementById("endPointName").innerText = selectedPoint.name;
}

function handleCreateLine() {
    document.getElementById("lineFeedback").innerHTML = ""; // reset feedback field

    // check if the start & end point are undefined
    if (lineStartPoint == undefined || lineEndPoint == undefined) {
        document.getElementById("lineFeedback").innerHTML = "Bitte Punkte auswählen";
        return;
    }
    // check if the start & end point are identical
    if (lineStartPoint == lineEndPoint) {
        document.getElementById("lineFeedback").innerHTML = "Punkte sind identisch";
        return;
    }
    // check if an identical line already exists (by name)
    if (
        lines.getObjectByName(lineStartPoint.name + "-" + lineEndPoint.name) !=
        undefined ||
        lines.getObjectByName(lineEndPoint.name + "-" + lineStartPoint.name) !=
        undefined
    ) {
        document.getElementById("lineFeedback").innerHTML = "Diese Linie existiert bereits";
        return;
    }
    let newLine = new Line(lineStartPoint, lineEndPoint); // create new line
    lines.add(newLine); // add new line to the scene
    unmarkObject(selectedLine); // unmark previous line
    markObject(newLine); // mark new line
    resetDomElementForLine(newLine); // reset the dom element where a line can be manipulated
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

function handleDeleteLine() {
    for (let i = 0; i < lines.children.length; i++)
        if (lines.children[i].uuid == selectedLine.uuid)
            lines.remove(lines.children[i]);
    emptyDomElementForLine();
}

function resetDomElementForLine(_line) {
    // save the point for deletion
    selectedLine = _line;
    // input the name of the line
    document.getElementById("lineName").innerText = _line.name;
}

function emptyDomElementForLine(_line) {
    document.getElementById("lineName").innerText = "";
}
// #endregion (LINES)

// #region (CAMERAS)
function updateCameraTab(_camera) {
    document.getElementById(_camera.name + "CoordX").value = _camera.position.x;
    document.getElementById(_camera.name + "CoordY").value = _camera.position.y;
    document.getElementById(_camera.name + "CoordZ").value = _camera.position.z;

    _camera.updatePrincipalPoint();
    document.getElementById(_camera.name + "PrincipalPointX").innerHTML = _camera.principalPoint.x.toFixed(3);
    document.getElementById(_camera.name + "PrincipalPointY").innerHTML = _camera.principalPoint.y.toFixed(3);
    document.getElementById(_camera.name + "PrincipalPointZ").innerHTML = _camera.principalPoint.z.toFixed(3);

    document.getElementById(_camera.name + "Distance").value = _camera.near;
    document.getElementById(_camera.name + "FOV").value = _camera.fov;
    document.getElementById(_camera.name + "AspectRatio").innerHTML = _camera.aspect.toFixed(3);
}

function handleChangeCameraPosition(_event) {
    // get camera
    let camera = cameras.getObjectByName(_event.target.name);
    // change camera's position
    camera.position.set(
        Number(document.getElementById(camera.name + "CoordX").value),
        Number(document.getElementById(camera.name + "CoordY").value),
        Number(document.getElementById(camera.name + "CoordZ").value)
    );
    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);
    handleResetBeams();
    updateCameraTab(camera);
    // update the camera's AKG in the HTML Element
    document.getElementById(camera.name + "AKG").innerHTML = camera.getAKG();
}

function handleChangeCameraFOV(_event) {
    // get camera
    let camera = cameras.getObjectByName(_event.target.name);
    // change the camera's field of view
    camera.fov = Number(_event.target.value);
    // update stuff
    camera.updateProjectionMatrix();
    cameraHelperLeft.update();
    cameraHelperRight.update();
}

function handleChangeCameraDistance(_event) {
    // get camera
    let camera = cameras.getObjectByName(_event.target.name);
    // change the camera's distance (between projection center and image plane)
    camera.near = Number(_event.target.value);
    // update stuff
    camera.updateProjectionMatrix();
    cameraHelperLeft.update();
    cameraHelperRight.update();
    for (let i = 0; i < camera.children.length; i++) {
        camera.children[i].update();
    }
    updateCameraTab(camera);
    document.getElementById(camera.name + "AKG").innerHTML = camera.getAKG();
}
// #endregion (CAMERAS)

function markObject(_object) {
    _object.material.color.set(0xff802a);
}

// give the object its default color
function unmarkObject(_object) {
    if (_object != null) _object.material.color.set(_object.color);
}

// #region (RESPONSIVE DESIGN)
function onWindowResize() {
    // recompute the aspect ratio from new window size
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasAspect = canvasWidth / canvasHeight;

    renderer.setSize(canvasWidth, canvasHeight);

    cameraScene.aspect = canvasAspect * 2;
    cameraScene.updateProjectionMatrix();

    /* cameraScene canvas (for using transformControls) */
    let canvasViewer3D = document.getElementById("transformControlsCanvas")
    canvasViewer3D.width = canvasWidth;
    canvasViewer3D.height = canvasHeight / 2;
    /* end */

    cameraLeft.aspect = canvasAspect;
    cameraLeft.updateProjectionMatrix();
    document.getElementById("leftCamAspectRatio").innerHTML = cameraLeft.aspect.toFixed(3);

    cameraRight.aspect = canvasAspect;
    cameraRight.updateProjectionMatrix();
    document.getElementById("rightCamAspectRatio").innerHTML = cameraRight.aspect.toFixed(3);
}
// #endregion (RESPONSIVE DESIGN)

// #region (BEAMS)
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

function handleBeams(_event) {
    switch (_event.target.value) {
        case "none":
            toggleBeams = "none";
            beams.removeFromParent();
            epipoleLeft.removeFromParent();
            epipoleRight.removeFromParent();
            break;
        case "all":
            toggleBeams = "all";
            createBeams(cameras, points);
            scene.add(beams);
            cameraLeft.add(epipoleLeft);
            cameraRight.add(epipoleRight);
            break;
        case "one":
            toggleBeams = "one";
            createBeam(cameras, selectedPoint);
            scene.add(beams);
            cameraLeft.add(epipoleLeft);
            cameraRight.add(epipoleRight);
            break;
    }
}
// #endregion (BEAMS)

function handleToggleCameraRotation(_event) {
    switch (_event.target.value) {
        case "on":
            scene.add(cameraLeftControls);
            cameraLeftControls.attach(cameraLeft);
            scene.add(cameraRightControls);
            cameraRightControls.attach(cameraRight);
            break;
        case "leftCamera":
            scene.add(cameraLeftControls);
            cameraLeftControls.attach(cameraLeft);
            cameraRightControls.removeFromParent();
            cameraRightControls.detach(cameraRight);
            break;
        case "rightCamera":
            scene.add(cameraRightControls);
            cameraRightControls.attach(cameraRight);
            cameraLeftControls.removeFromParent();
            cameraLeftControls.detach(cameraLeft);
            break;
        case "off":
            cameraLeftControls.removeFromParent();
            cameraLeftControls.detach(cameraLeft);
            cameraRightControls.removeFromParent();
            cameraRightControls.detach(cameraRight);
            break;
    }
}

function handleToggleWorldCoordSystem(_event) {
    switch (_event.target.value) {
        case "show":
            scene.add(worldCoordinateSystem);
            break;
        case "hide":
            worldCoordinateSystem.removeFromParent();
            break;
    }
}

function onCameraControlsChange() {
    updateCameraTab(cameraLeft);
    updateCameraTab(cameraRight);
    document.getElementById("leftCamAKG").innerHTML = cameraLeft.getAKG();
    document.getElementById("rightCamAKG").innerHTML = cameraRight.getAKG();
    if (selectedPoint != undefined)
        resetDomElementForPoint(selectedPoint);
}

// #region (RAYCASTING)
function onDocumentMouseDown(_event) { // handle the user clicking somewhere
    if (_event.which == 1) { // check if user clicked with the left mouse button
        castRay(_event, renderer, cameraScene, scene.getObjectByName("Selectables").children);
        castRay(_event, renderer, cameraLeft, scene.getObjectByName("Points").children);
        castRay(_event, renderer, cameraRight, scene.getObjectByName("Points").children);
    }
}

function castRay(_event, _renderer, _camera, _selectableObjects) {
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
// #endregion (RAYCASTING)