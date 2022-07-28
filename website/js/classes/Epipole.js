import * as THREE from "../../threejs/ThreeModule.js";
import Point from "./Point.js";

/* Instantiate to create an epipole */

export default class Epipole extends Point {

    constructor(name = "", position = new THREE.Vector3(), radius = 0) {
        super(name, position, radius);

        // change the epipole's color
        this.color = new THREE.Color(0xff9900);
        this.material.color.set(0xff9900);
    }
}