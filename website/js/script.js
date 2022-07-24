import * as THREE from "../threejs/ThreeModule.js";
import { GLTFLoader } from '../threejs/GLTFLoader.js';
import { OrbitControls } from "../threejs/OrbitControls.js";
import { TransformControls } from "../threejs/TransformControls.js";
import Beam from "./classes/Beam.js";
import Camera from "./classes/Camera.js";
import CameraGrid from "./classes/CameraGrid.js";
import CameraCoordinateSystem from "./classes/CameraCoordinateSystem.js";
import CoordinateSystem from "./classes/CoordinateSystem.js";
import DefaultModel from "./classes/DefaultModel.js";
import Epipole from "./classes/Epipole.js";
import Grid from "./classes/Grid.js";
import Line from "../js/classes/Line.js";
import Point from "../js/classes/Point.js";
import UI from "./classes/Ui.js";

/* GLOBAL VARIABLES */

// scene:
let scene, cameraScene, controls, renderer, worldGrid, worldCoordinateSystem;
// canvas:
let canvas, canvasWidth, canvasHeight, canvasAspect;
// cameras:
let cameras;
// left camera:
let cameraLeft, cameraLeftControls, cameraHelperLeft, cameraLeftGrid, cameraLeftCoordinateSystem;
// right camera:
let cameraRight, cameraRightControls, cameraHelperRight, cameraRightGrid, cameraRightCoordinateSystem;
// selectable objects:
let selectables;
// points:
let points, selectedPoint;
// lines:
let lines, selectedLine, lineStartPoint, lineEndPoint;
// beams:
let beams, toggleBeams;
// epipoles:
let epipoleLeft, epipoleRight;
// raycasting:
let raycaster, mouse;

init();
animate();

function init() {
    // get canvas and its measurements
    canvas = document.getElementById("vismoViewport");
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasAspect = canvasWidth / canvasHeight;

    // initialize and define renderer for the scene
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x3f3f3f, 1);
    renderer.autoClear = false;

    // initialize scene
    scene = new THREE.Scene();

    // initialize and define scene camera
    cameraScene = new THREE.PerspectiveCamera(75, canvasAspect * 2, 0.1, 1000);
    cameraScene.position.z = 12;
    cameraScene.lookAt(0, 0, 0);
    scene.add(cameraScene);

    // get trackpad and initialize cameraScene controls
    let trackPad = document.getElementById("trackPad");
    controls = new OrbitControls(cameraScene, trackPad);

    // initialize world grid
    worldGrid = new Grid();
    scene.add(worldGrid);

    // initialize wold coordinate system
    worldCoordinateSystem = new CoordinateSystem();
    scene.add(worldCoordinateSystem);

    // initialize camera group
    cameras = new THREE.Group();
    cameras.name = "Cameras";
    scene.add(cameras);

    // initialize and define left camera
    cameraLeft = new Camera(new THREE.Vector3(5, 0, 2), 1, canvasAspect);
    cameraLeft.name = "leftCam";
    cameraLeft.rotateY(Math.PI);
    cameraLeft.rotateY(-Math.PI / 4);
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    cameras.add(cameraLeft);
    // initialize and define left camera controls
    cameraLeftControls = new TransformControls(cameraScene, document.getElementById("transformControlsCanvas"));
    cameraLeftControls.size = 1.5;
    cameraLeftControls.mode = "rotate";
    cameraLeftControls.space = "local";
    cameraLeftControls.attach(cameraLeft);
    scene.add(cameraLeftControls);
    // initialize left camera helper
    cameraHelperLeft = new THREE.CameraHelper(cameraLeft);
    scene.add(cameraHelperLeft);
    // initialize and define left camera grid
    cameraLeftGrid = new CameraGrid();
    cameraLeft.add(cameraLeftGrid);
    cameraLeftGrid.rotateX(Math.PI / 2);
    cameraLeftGrid.update();
    // initialize left camera coordinate system
    cameraLeftCoordinateSystem = new CameraCoordinateSystem();
    cameraLeft.add(cameraLeftCoordinateSystem);
    cameraLeftCoordinateSystem.rotateY(Math.PI);
    cameraLeftCoordinateSystem.update();

    // initialize and define right camera
    cameraRight = new Camera(new THREE.Vector3(0, 0, 0), 1, canvasAspect);
    cameraRight.name = "rightCam";
    cameraRight.rotateY(Math.PI);
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    cameras.add(cameraRight);
    // initialize and define right camera controls
    cameraRightControls = new TransformControls(cameraScene, document.getElementById("transformControlsCanvas"));
    cameraRightControls.size = 1.5;
    cameraRightControls.mode = "rotate";
    cameraRightControls.space = "local";
    cameraRightControls.attach(cameraRight);
    scene.add(cameraRightControls);
    // initialize right camera helper
    cameraHelperRight = new THREE.CameraHelper(cameraRight);
    scene.add(cameraHelperRight);
    // initialize right camera grid
    cameraRightGrid = new CameraGrid();
    cameraRight.add(cameraRightGrid);
    cameraRightGrid.rotateX(Math.PI / 2);
    cameraRightGrid.update();
    // initialize right camera coordinate system
    cameraRightCoordinateSystem = new CameraCoordinateSystem();
    cameraRight.add(cameraRightCoordinateSystem);
    cameraRightCoordinateSystem.rotateY(Math.PI);
    cameraRightCoordinateSystem.update();

    // get canvas to use for left and right camera controls
    let canvasViewer3D = document.getElementById("transformControlsCanvas")
    canvasViewer3D.width = canvasWidth;
    canvasViewer3D.height = canvasHeight / 2;

    // initialize selectable objects group
    selectables = new THREE.Group();
    selectables.name = "Selectables";
    scene.add(selectables);

    // initialize point group
    points = new THREE.Group();
    points.name = "Points";
    selectables.add(points);

    // initialize line group
    lines = new THREE.Group();
    lines.name = "Lines";
    selectables.add(lines);

    // initialize beam group
    beams = new THREE.Group();
    toggleBeams = "none";

    // initialize epipoles
    epipoleLeft = new Epipole("Epipol", new THREE.Vector3(0, 0, 0), 0.05);
    epipoleRight = new Epipole("Epipol", new THREE.Vector3(0, 0, 0), 0.05);

    // initialize raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // declare and initialize default model
    let defaultModel = new DefaultModel(new THREE.Vector3(0, 0, 0));
    // add points and lines of default model separately
    let childrenAmount = defaultModel.children.length;
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

    // initialize UI
    UI.init();
    updateCameraTab(cameraLeft);
    updateCameraTab(cameraRight);

    /* EVENT LISTENERS */
    // window Resize
    window.addEventListener("resize", onWindowResize);
    // points
    document.getElementById("createPoint").addEventListener("click", handleCreatePoint);
    document.getElementById("pointCoordX").addEventListener("change", handleChangePointPosition);
    document.getElementById("pointCoordY").addEventListener("change", handleChangePointPosition);
    document.getElementById("pointCoordZ").addEventListener("change", handleChangePointPosition);
    document.getElementById("deletePoint").addEventListener("click", handleDeletePoint);
    // lines
    document.getElementById("setStartPoint").addEventListener("click", handleSetStartPoint);
    document.getElementById("setEndPoint").addEventListener("click", handleSetEndPoint);
    document.getElementById("createLine").addEventListener("click", handleCreateLine);
    document.getElementById("deleteLine").addEventListener("click", handleDeleteLine);
    // beams
    document.getElementById("beams").addEventListener("change", handleBeams);
    document.getElementById("cameraRotation").addEventListener("change", handleToggleCameraRotation);
    document.getElementById("worldCoordSystem").addEventListener("change", handleToggleWorldCoordSystem);
    // left camera
    document.getElementById("leftCamCoordX").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamCoordY").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamCoordZ").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("leftCamFOV").addEventListener("change", handleChangeCameraFOV);
    document.getElementById("leftCamDistance").addEventListener("change", handleChangeCameraDistance);
    cameraLeftControls.addEventListener("change", onCameraControlsChange);
    // right camera
    document.getElementById("rightCamCoordX").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamCoordY").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamCoordZ").addEventListener("change", handleChangeCameraPosition);
    document.getElementById("rightCamFOV").addEventListener("change", handleChangeCameraFOV);
    document.getElementById("rightCamDistance").addEventListener("change", handleChangeCameraDistance);
    cameraRightControls.addEventListener("change", onCameraControlsChange);
    // raycast
    document.addEventListener("mousedown", onDocumentMouseDown);
    // Gigi giraffe Model
    document.getElementById("giraffeButton").addEventListener("click", handleLoadGigiModel);
}

// per frame called function
function animate() {
    requestAnimationFrame(animate);
    renderer.clear();

    // update scene controls
    controls.update();

    // set viewport for 3D viewer
    renderer.setViewport(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    // turn objects in-/visible
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
    // render scene camera's view
    renderer.render(scene, cameraScene);

    //set viewport for left 2D viewer
    renderer.setViewport(0, 0, canvasWidth / 2, canvasHeight / 2);
    // turn objects in-/visible
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
    // render left camera's view
    renderer.render(scene, cameraLeft);

    //set viewport for right 2D viewer
    renderer.setViewport(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight / 2);
    // turn objects in-/visible
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
    // render right camera's view
    renderer.render(scene, cameraRight);
}

// needed for arrow button rotation
$(".buttonactive").click(function () {
    $(".buttonactive").removeClass("active");
    $(this).addClass("active");
});

function deleteAllPointsAndLines() {
    for (let i = points.children.length; i >= 0; i--) {
        points.remove(points.children[i]);
    }
    for (let i = lines.children.length; i >= 0; i--) {
        lines.remove(lines.children[i]);
    }
}

function handleLoadGigiModel() {
    deleteAllPointsAndLines();
    loadModel("giraffe.gltf");
}

function loadModel(_model) {
    // create lights
    let ambientLight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(ambientLight);
    let spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.x = 4;
    spotLight.position.y = 4;
    scene.add(spotLight);
    // create model loader
    let loader = new GLTFLoader().setPath('model/');
    // load model
    loader.load(_model, function (gltf) {
        gltf.scene.position.set(0, 0, 4.5)
        scene.add(gltf.scene);
    });
}

function markObject(_object) {
    _object.material.color.set(0xff802a);
}

function unmarkObject(_object) {
    // give the object its default color
    if (_object != null)
        _object.material.color.set(_object.color);
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

// #region (POINTS)
function handleCreatePoint() {
    // get point name
    let pointName = document.getElementById("newPointName").value;
    document.getElementById("pointNameFeedback").innerHTML = "";
    // check if user put in a name
    if (document.getElementById("newPointName").value == "") {
        document.getElementById("pointNameFeedback").innerHTML = "Bitte Name eingeben";
        return;
        // check if the name already exists
    } else if (points.getObjectByName(pointName) != undefined) {
        document.getElementById("pointNameFeedback").innerHTML = "Dieser Name ist bereits vergeben";
        return;
    }
    // declare and initialize new point
    let newPoint = new Point(pointName, new THREE.Vector3(0, 0, 0), 0.25);
    points.add(newPoint);
    // make new point the selected point
    unmarkObject(selectedPoint);
    markObject(newPoint);
    selectedPoint = newPoint;
    // update stuff
    updatePointTab();
    handleResetBeams();
}

function handleChangePointPosition() {
    // change position
    if (selectedPoint != undefined) {
        selectedPoint.position.set(
            Number(document.getElementById("pointCoordX").value),
            Number(document.getElementById("pointCoordY").value),
            Number(document.getElementById("pointCoordZ").value)
        );
        // update stuff
        updateLinesConnectedToPoint("change");
        updatePointTab();
        handleResetBeams();
    }
}

function handleDeletePoint() {
    if (selectedPoint != undefined) {
        // delete point
        points.getObjectByName(selectedPoint.name).removeFromParent();
        // update stuff
        handleResetBeams();
        updateLinesConnectedToPoint("remove");
        selectedPoint = null;
        resetPointTab();
    }
}

function updatePointTab() {
    // input the name
    document.getElementById("pointName").innerText = selectedPoint.name;
    // input the x-/y-/z-coordinate
    document.getElementById("pointCoordX").value = selectedPoint.position.x;
    document.getElementById("pointCoordY").value = selectedPoint.position.y;
    document.getElementById("pointCoordZ").value = selectedPoint.position.z;

    // update left camera attributes
    cameraLeft.updatePrincipalPoint();
    cameraLeft.updateProjectionMatrixArray();
    // input coordinate of the point in the left camera's image plane (world coordinate system)
    let pointLeftImgCoordWorld = cameraLeft.getImageCoordWorld(selectedPoint.position);
    document.getElementById("pointCoordXLeftWorld").innerHTML = pointLeftImgCoordWorld.x.toFixed(3);
    document.getElementById("pointCoordYLeftWorld").innerHTML = pointLeftImgCoordWorld.y.toFixed(3);
    document.getElementById("pointCoordZLeftWorld").innerHTML = pointLeftImgCoordWorld.z.toFixed(3);
    // input coordinate of the point in the left camera's image plane (camera coordinate system)
    let pointLeftImgCoordCamera = cameraLeft.getImageCoordCamera(selectedPoint.position);
    document.getElementById("pointCoordXLeft").innerHTML = pointLeftImgCoordCamera.x.toFixed(3);
    document.getElementById("pointCoordYLeft").innerHTML = pointLeftImgCoordCamera.y.toFixed(3);

    // update right camera attributes
    cameraRight.updatePrincipalPoint();
    cameraRight.updateProjectionMatrixArray();
    // get and input coordinates of the point in the right camera's image plane (camera coordinate system)
    let pointRightImgCoordCamera = cameraRight.getImageCoordCamera(selectedPoint.position);
    document.getElementById("pointCoordXRight").innerHTML = pointRightImgCoordCamera.x.toFixed(3);
    document.getElementById("pointCoordYRight").innerHTML = pointRightImgCoordCamera.y.toFixed(3);
    // get and input coordinates of the point in the right camera's image plane (world coordinate system)
    let pointRightImgCoordWorld = cameraRight.getImageCoordWorld(selectedPoint.position);
    document.getElementById("pointCoordXRightWorld").innerHTML = pointRightImgCoordWorld.x.toFixed(3);
    document.getElementById("pointCoordYRightWorld").innerHTML = pointRightImgCoordWorld.y.toFixed(3);
    document.getElementById("pointCoordZRightWorld").innerHTML = pointRightImgCoordWorld.z.toFixed(3);
}

function resetPointTab() {
    document.getElementById("pointName").innerText = "";
    // reset world coordinates
    document.getElementById("pointCoordX").value = 0;
    document.getElementById("pointCoordY").value = 0;
    document.getElementById("pointCoordZ").value = 0;
    // reset image plane coordinates
    document.getElementById("pointCoordXLeft").innerHTML = 0;
    document.getElementById("pointCoordYLeft").innerHTML = 0;
    document.getElementById("pointCoordXRight").innerHTML = 0;
    document.getElementById("pointCoordYRight").innerHTML = 0;
    // reset image plane coordinates (world coordinate system)
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
    document.getElementById("lineFeedback").innerHTML = "";

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
    if (lines.getObjectByName(lineStartPoint.name + "-" + lineEndPoint.name) != undefined || lines.getObjectByName(lineEndPoint.name + "-" + lineStartPoint.name) != undefined) {
        document.getElementById("lineFeedback").innerHTML = "Diese Linie existiert bereits";
        return;
    }
    // declare and initialize new line
    let newLine = new Line(lineStartPoint, lineEndPoint);
    lines.add(newLine);
    // reset marked line
    unmarkObject(selectedLine);
    markObject(newLine);
    selectedLine = newLine;
    // update stuff
    updateLineTab();
}

function updateLinesConnectedToPoint(_operation) {
    // get the amount of children of the line group
    let childrenAmount = lines.children.length;
    // loop through all lines of the scene
    for (let i = childrenAmount - 1; i >= 0; i--) {
        // check if there's a line object
        if (lines.children[i].children[0] != undefined && lines.children[i].children[0].type == "Line") {
            // check if the line is connected to the point
            if (lines.children[i].isConnectedToPoint(selectedPoint)) {
                switch (_operation) {
                    case "change":
                        lines.children[i].update();
                        break;
                    case "remove":
                        lines.remove(lines.children[i]);
                        resetLineTab();
                        break;
                }
            }
        }
    }
}

function handleDeleteLine() {
    if (selectedLine != undefined) {
        // delete line
        lines.getObjectByName(selectedLine.name).removeFromParent();
        // update stuff
        selectedLine = undefined;
        resetLineTab();
    }
}

function updateLineTab() {
    // input selected line name
    document.getElementById("lineName").innerText = selectedLine.name;
}

function resetLineTab() {
    document.getElementById("lineName").innerText = "";
}
// #endregion (LINES)

// #region (CAMERAS)
function updateCameraTab(_camera) {
    // input camera's coordinates
    document.getElementById(_camera.name + "CoordX").value = _camera.position.x;
    document.getElementById(_camera.name + "CoordY").value = _camera.position.y;
    document.getElementById(_camera.name + "CoordZ").value = _camera.position.z;
    // update and input camera's principal point coordinates
    _camera.updatePrincipalPoint();
    document.getElementById(_camera.name + "PrincipalPointX").innerHTML = _camera.principalPoint.x.toFixed(3);
    document.getElementById(_camera.name + "PrincipalPointY").innerHTML = _camera.principalPoint.y.toFixed(3);
    document.getElementById(_camera.name + "PrincipalPointZ").innerHTML = _camera.principalPoint.z.toFixed(3);
    // input camera's distance (= distance from projection center to principal point)
    document.getElementById(_camera.name + "Distance").value = _camera.near;
    // input camera's field of view
    document.getElementById(_camera.name + "FOV").value = _camera.fov;
    // input camera's AKG ("Allgemeine Koordinatengleichung")
    document.getElementById(_camera.name + "AKG").innerHTML = _camera.getAKG();
    // input camera's aspect ratio
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
    // update stuff
    if (selectedPoint != undefined)
        updatePointTab();
    handleResetBeams();
    updateCameraTab(camera);
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
    for (let i = 0; i < camera.children.length; i++)
        camera.children[i].update();
    updateCameraTab(camera);
}

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

function onCameraControlsChange() {
    updateCameraTab(cameraLeft);
    updateCameraTab(cameraRight);
    if (selectedPoint != undefined)
        updatePointTab();
}
// #endregion (CAMERAS)

// #region (RESPONSIVE DESIGN)
function onWindowResize() {
    // get new canvas aspect
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasAspect = canvasWidth / canvasHeight;

    // adjust renderer
    renderer.setSize(canvasWidth, canvasHeight);

    // get and adjust extra canvas (3D-Viewer) needed for using transformControls
    let canvasViewer3D = document.getElementById("transformControlsCanvas")
    canvasViewer3D.width = canvasWidth;
    canvasViewer3D.height = canvasHeight / 2;

    // update scene camera
    cameraScene.aspect = canvasAspect * 2;
    cameraScene.updateProjectionMatrix();
    // update left camera
    cameraLeft.aspect = canvasAspect;
    cameraLeft.updateProjectionMatrix();
    document.getElementById("leftCamAspectRatio").innerHTML = cameraLeft.aspect.toFixed(3);
    // update right camera
    cameraRight.aspect = canvasAspect;
    cameraRight.updateProjectionMatrix();
    document.getElementById("rightCamAspectRatio").innerHTML = cameraRight.aspect.toFixed(3);
}
// #endregion (RESPONSIVE DESIGN)

// #region (BEAMS)
function createBeams(_cameras, _objects) {
    beams.clear();
    for (let i = 0; i < _cameras.children.length; i++) {
        for (let j = 0; j < _objects.children.length; j++) {
            beams.add(new Beam(_cameras.children[i], _objects.children[j]));
        }
    }
}

function createBeam(_cameras, _object) {
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

function resetBeams(_cameras, _objects) {
    beams.clear();
    createBeams(_cameras, _objects);
}

function resetBeam(_cameras, _object) {
    beams.clear();
    createBeam(_cameras, _object);
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

// #region (RAYCASTING)
// handle the user clicking somewhere
function onDocumentMouseDown(_event) {
    // check if user clicked with the left mouse button
    if (_event.which == 1) {
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
            mouse.x = ((_event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            mouse.y = -((_event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 4 + 1;
            break;
        case cameraLeft:
            mouse.x = ((_event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 4 - 1;
            mouse.y = -((_event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 4 + 3;
            break;
        case cameraRight:
            mouse.x = ((_event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 4 - 3;
            mouse.y = ((_event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 4 + 3;
            break;
    }

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, _camera);

    // get the objects that intersected with the ray
    let intersects = raycaster.intersectObjects(_selectableObjects, true);

    if (intersects[0] != undefined) {
        // check what kind of object intersected with the ray
        switch (intersects[0].object.type) {
            case "Mesh": // = Point
                // reset marked object
                unmarkObject(selectedPoint);
                markObject(intersects[0].object);
                selectedPoint = intersects[0].object.parent;
                // update stuff
                updatePointTab();
                handleResetBeams();
                break;
            case "Line": // = Line
                // reset marked object
                unmarkObject(selectedLine);
                markObject(intersects[0].object);
                selectedLine = intersects[0].object.parent;
                // update stuff
                updateLineTab();
                break;
        }
    }
}
// #endregion (RAYCASTING)