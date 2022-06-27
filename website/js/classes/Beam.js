import * as THREE from "../../threejs/ThreeModule.js";
import Line from "./Line.js";

export default class Beam extends Line {

    color = new THREE.Color(0xFFFFB7);

    constructor(_startPoint, _endPoint) { // _startPoint: Point | _endPoint: Point
        super(_startPoint, _endPoint);
        this.material.color.set(0xFFFFB7);
    }

    isConnectedToPoint(_point) {
    }

    update() {
    }
}