import * as THREE from "../../threejs/ThreeModule.js";
import Line from "./Line.js";
import Point from "./Point.js";

export default class Beam extends Line {
    color = new THREE.Color(0xFFFFB7);

    constructor(startPoint = new Point(), endPoint = new Point()) {
        super(startPoint, endPoint);
        this.material.color.set(0xFFFFB7);
    }
}