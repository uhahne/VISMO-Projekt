import * as THREE from "../threejs/ThreeModule.js";
import { OrbitControls } from "../threejs/OrbitControls.js";
import Point from "../js/classes/Point.js";
import Line from "../js/classes/Line.js";
import DefaultModel from "./classes/DefaultModel.js";

let rendererScene, scene, controls;
let rendererLeft, rendererRight;
let cameraScene, cameraLeft, cameraRight;
let cameraHelperLeft, cameraHelperRight;

let points, lines;

let selectedPoint, selectedLine;
let lineStartPoint, lineEndPoint; // for line creation

let canvasScene, canvasLeft, canvasRight;
let canvasWidth, canvasHeight, canvasAspect;

let leftFOV = 50
let leftNEAR = 0.1
let leftFAR = 20

let rightFOV = 50
let rightNEAR = 0.1
let rightFAR = 20

let gridHelper;

document.getElementById("camUI").setAttribute("style", "display: none");
document.getElementById("paramUI").setAttribute("style", "display: none");

init();
animate();

function init() {
    // rendererScene
    canvasScene = document.getElementById("viewer3D");
    rendererScene = new THREE.WebGLRenderer({ canvas: canvasScene, antialias: true });
    rendererScene.setClearColor(0x3f3f3f, 1);
    rendererScene.autoClear = false;

    // rendererLeft
    canvasLeft = document.getElementById("viewer2DLeft");
    rendererLeft = new THREE.WebGLRenderer({ canvas: canvasLeft, antialias: true });
    rendererLeft.setClearColor(0x3f3f3f, 1);
    rendererLeft.autoClear = false;

    // rendererRight
    canvasRight = document.getElementById("viewer2DRight");
    rendererRight = new THREE.WebGLRenderer({ canvas: canvasRight, antialias: true });
    rendererRight.setClearColor(0x3f3f3f, 1);
    rendererRight.autoClear = false;

    // canvas size
    canvasWidth = canvasScene.clientWidth;
    canvasHeight = canvasScene.clientHeight;
    canvasAspect = canvasWidth / canvasHeight

    // scene
    scene = new THREE.Scene();

    // cameraScene
    cameraScene = new THREE.PerspectiveCamera(75, canvasAspect, 0.1, 1000);
    cameraScene.position.z = 12;
    cameraScene.lookAt(0, 0, 0);
    scene.add(cameraScene);

    // cameraScene controls
    controls = new OrbitControls(cameraScene, rendererScene.domElement);

    // cameraLeft

    cameraLeft = new THREE.PerspectiveCamera(leftFOV, canvasAspect / 2, leftNEAR, leftFAR);
    cameraLeft.position.set(-10, 0, 12);
    cameraLeft.lookAt(0, 0, 0);
    scene.add(cameraLeft);

    cameraHelperLeft = new THREE.CameraHelper(cameraLeft);
    scene.add(cameraHelperLeft);

    // cameraRight

    cameraRight = new THREE.PerspectiveCamera(rightFOV, canvasAspect / 2, rightNEAR, rightFAR);
    cameraRight.position.set(10, 0, 12);
    cameraRight.lookAt(0, 0, 0);
    scene.add(cameraRight);

    cameraHelperRight = new THREE.CameraHelper(cameraRight);
    scene.add(cameraHelperRight);

    points = new THREE.Group();
    points.name = "Points";
    lines = new THREE.Group();
    lines.name = "Lines";

    // origin point
    let originPoint = new Point("Ursprung", new THREE.Vector3(0, 0, 0), 0.25);
    originPoint.color = new THREE.Color(0xFF0000);
    originPoint.material.color.set(0xFF0000);
    points.add(originPoint);

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

    scene.add(points);
    scene.add(lines);

    gridHelper = new THREE.GridHelper(100, 100);
    gridHelper.position.y = -2
    scene.add(gridHelper);

}

function animate() {
    requestAnimationFrame(animate);

    // render scene
    rendererScene.clear();
    controls.update();
    rendererScene.render(scene, cameraScene);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;

    // render left camera
    rendererLeft.clear();
    rendererLeft.render(scene, cameraLeft);

    cameraHelperLeft.visible = false;
    cameraHelperRight.visible = false;

    // render right camera
    rendererRight.clear();
    rendererRight.render(scene, cameraRight);

    //Figure out a way to delete the far plane
    cameraHelperLeft.visible = true;
    cameraHelperRight.visible = true;


}

//get tab buttons by id and add click event listener
document.getElementById("building").addEventListener("click", handleBuildingTab);
document.getElementById("camera").addEventListener("click", handleCamTab);
document.getElementById("parameter").addEventListener("click", handleParamTab);

//display input fields for point selection and manipulation
function handleBuildingTab(_event) {
    document.getElementById("camUI").setAttribute("style", "display: none");
    document.getElementById("pointUI").setAttribute("style", "visibility: visible");
    document.getElementById("lineUI").setAttribute("style", "visibility: visible");
    document.getElementById("paramUI").setAttribute("style", "display: none");
}

//display input fields for camera
function handleCamTab(_event) {
    document.getElementById("pointUI").setAttribute("style", "display: none");
    document.getElementById("lineUI").setAttribute("style", "display: none");
    document.getElementById("paramUI").setAttribute("style", "display: none");
    document.getElementById("camUI").setAttribute("style", "visibility: visible");
}

function handleParamTab(_event) {
    document.getElementById("pointUI").setAttribute("style", "display: none");
    document.getElementById("lineUI").setAttribute("style", "display: none");
    document.getElementById("camUI").setAttribute("style", "display: none");
    document.getElementById("paramUI").setAttribute("style", "visibility: visible");
}


// create an EventListener for clicking the "create point"-button
document.getElementById("createPoint").addEventListener("click", handleCreatePoint);
// create a function to handle the clicking of the button
function handleCreatePoint(_event) {
    let newPoint;
    // create the new point
    if (document.getElementById("newPointName").value == "") {
        newPoint = new Point("Punkt", new THREE.Vector3(0, 0, 0), 0.25);
    } else {
        newPoint = new Point(document.getElementById("newPointName").value, new THREE.Vector3(0, 0, 0), 0.25);
    }
    // add the new point to the scene
    points.add(newPoint);
    // unmark previous point
    unmarkObject(selectedPoint);
    // mark current point
    markObject(newPoint);
    // reset the dom element where a point can be manipulated
    resetDomElementForPoint(newPoint);
}

document.getElementById("setStartPoint").addEventListener("click", handleSetStartPoint);
function handleSetStartPoint(_event) {
    lineStartPoint = selectedPoint;
    document.getElementById("startPointName").innerText = selectedPoint.name;
}

document.getElementById("setEndPoint").addEventListener("click", handleSetEndPoint);
function handleSetEndPoint(_event) {
    lineEndPoint = selectedPoint;
    document.getElementById("endPointName").innerText = selectedPoint.name;
}

document.getElementById("createLine").addEventListener("click", handleCreateLine);
function handleCreateLine(_event) {
    if (lineStartPoint != undefined && lineEndPoint != undefined && lineStartPoint != lineEndPoint) {
        let newLine = new Line(lineStartPoint, lineEndPoint);
        lines.add(newLine);
        unmarkObject(selectedLine);
        markObject(newLine);
        resetDomElementForLine(newLine);
    }
}


function showLeftCameraParameters(_point) {

    document.getElementById("leftCamCoordX").value = cameraLeft.position.x;
    document.getElementById("leftcamCoordY").value = cameraLeft.position.y;
    document.getElementById("leftCamCoordZ").value = cameraLeft.position.z;

    document.getElementById("leftFieldOfView").value = leftFOV;
    document.getElementById("leftAspectRatio").value = canvasAspect;
    document.getElementById("leftNearPlane").value = leftNEAR;
    document.getElementById("leftFarPlane").value = leftFAR;
}

function showRightCameraParameters(_point) {

    document.getElementById("rightCamCoordX").value = cameraRight.position.x;
    document.getElementById("rightCamCoordY").value = cameraRight.position.y;
    document.getElementById("rightCamCoordZ").value = cameraRight.position.z;

    document.getElementById("rightFieldOfView").value = rightFOV;
    document.getElementById("rightAspectRatio").value = canvasAspect;
    document.getElementById("rightNearPlane").value = rightNEAR;
    document.getElementById("rightFarPlane").value = rightFAR;
}

showLeftCameraParameters();
showRightCameraParameters();

/* Update Camera Parameters and make the camera adjust properly

function resetDomElementForCamera(_point) {
    // save the point for manipulation
    selectedCam = _Cam;
    // input the name of the point
    document.getElementById("camName").innerText = _Cam.name;
    // input the x-/y-/z-coordinate on the page to be the same as the actual object's x-coordinate
    document.getElementById("camCoordX").value = _Cam.position.x;
    document.getElementById("camCoordY").value = _Cam.position.y;
    document.getElementById("camCoordZ").value = _Cam.position.z;
 } 
    
 
 
 // create EventListener for the changing of the x-y-z-coordinate value for a Camera
document.getElementById("camCoordX").addEventListener("change", handleChangeCameraPositionX);
// handle the changing of the x-coordinate value
function handleChangeCameraPositionX(_event) {
    // move the point in the scene
    selectedCamera.position.x = _event.target.value;
}

document.getElementById("camCoordY").addEventListener("change", handleChangeCameraPositionY);
function handleChangePointPositionY(_event) {
    selectedCamera.position.y = _event.target.value;
}

document.getElementById("camCoordZ").addEventListener("change", handleChangeCameraPositionZ);
function handleChangeCameraPositionZ(_event) {
    selectedCamera.position.z = _event.target.value;
}
*/

function resetDomElementForPoint(_point) {
    // save the point for manipulation
    selectedPoint = _point;
    // input the name of the point
    document.getElementById("pointName").innerText = _point.name;
    // input the x-/y-/z-coordinate on the page to be the same as the actual object's x-coordinate
    document.getElementById("pointCoordX").value = _point.position.x;
    document.getElementById("pointCoordY").value = _point.position.y;
    document.getElementById("pointCoordZ").value = _point.position.z;
}


function resetDomElementForLine(_line) {
    // save the point for deletion
    selectedLine = _line;
    // input the name of the line
    document.getElementById("lineName").innerText = _line.name;
}

function emptyDomElementForPoint(_point) {
    document.getElementById("pointName").innerText = "";
    document.getElementById("pointCoordX").value = 0;
    document.getElementById("pointCoordY").value = 0;
    document.getElementById("pointCoordZ").value = 0;
}

function emptyDomElementForLine(_line) {
    document.getElementById("lineName").innerText = "";
}

function markObject(_object) {
    _object.material.color.set(0xff802a);
}

// give the object its default color
function unmarkObject(_object) {
    if (_object != null)
        _object.material.color.set(_object.color);
}

// create an EventListener for clicking the "delete point"-button
document.getElementById("deletePoint").addEventListener("click", handleDeletePoint);
// create a function to handle the clicking of the button
function handleDeletePoint(_event) {
    // loop through all points of the scene
    for (let i = 0; i < points.children.length; i++) {
        // find the object that matches the object id
        if (points.children[i].uuid == selectedPoint.uuid) {
            // remove the object
            points.remove(points.children[i]);
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
}

document.getElementById("pointCoordY").addEventListener("change", handleChangePointPositionY);
function handleChangePointPositionY(_event) {
    selectedPoint.position.y = _event.target.value;
    updateLinesConnectedToPoint("change");
}
document.getElementById("pointCoordZ").addEventListener("change", handleChangePointPositionZ);
function handleChangePointPositionZ(_event) {
    selectedPoint.position.z = _event.target.value;
    updateLinesConnectedToPoint("change");
}

function updateLinesConnectedToPoint(_operation) {
    // get the amount of children the lines group
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
                        emptyDomElementForLine();
                        break;
                }
            }
        }
    }
}

// create a raycaster
let raycaster = new THREE.Raycaster();
// create vector the save the coordinates of where the user clicked on the page
let mouse = new THREE.Vector2();
// create an EventListener to react on a mouse-click
document.addEventListener("mousedown", onDocumentMouseDown);
// handle the user clicking somewhere
function onDocumentMouseDown(_event) {
    // check if user clicked with the left mouse button
    if (_event.which == 1) {
        // save the coordinates of the point on which the user clicked 
        let canvasBounds = rendererScene.getContext().canvas.getBoundingClientRect();
        mouse.x = ((_event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
        mouse.y = - ((_event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, cameraScene);

        // get all objects in the scene
        let objects = scene.children;

        let recursiveFlag = true; // true = it also checks all descendants of the objects
        // false = it only checks intersection with the objects
        // get the objects that intersected with the ray
        let intersects = raycaster.intersectObjects(objects, recursiveFlag);

        // check if a object intersected with the ray
        if (intersects[0] != undefined) {
            switch (intersects[0].object.type) {
                case ("Mesh"): // = Point
                    // un-mark the previously selected object
                    unmarkObject(selectedPoint);
                    // mark/color the new object
                    intersects[0].object.material.color.set(0xff802a);
                    // reset the dom element to show its values
                    resetDomElementForPoint(intersects[0].object.parent);
                    break;
                case ("Line"): // = Line
                    unmarkObject(selectedLine);
                    intersects[0].object.material.color.set(0xff802a);
                    resetDomElementForLine(intersects[0].object.parent);
                    break;
            }
        }
    } else { }
}

