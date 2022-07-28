import * as THREE from "../../threejs/ThreeModule.js";
import Line from "./Line.js";
import Point from "./Point.js";

/* Instantiate to create a beam that goes from a camera's projection center to a point of a model */

export default class Beam extends Line {
    color = new THREE.Color(0xFFFFB7);

    constructor(startPoint = new Point(), endPoint = new Point()) {
        super(startPoint, endPoint);
        this.material.color.set(0xFFFFB7);
    }
}