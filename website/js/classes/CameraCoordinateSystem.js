import * as THREE from "../../threejs/ThreeModule.js";

/* Instantiate to create coordinate system axes for a camera to enable better coordinate reading */

export default class CameraCoordinateSystem extends THREE.Group {

    constructor() {
        super();
        this.name = "CameraCoordinateSystem"

        let xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000, 0.2, 0.05);
        this.add(xAxis);

        let yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00, 0.2, 0.05);
        this.add(yAxis);
    }

    // DISCLAIMER: parent must be camera!
    update() {
        // get camera's distance from center to image plane
        let distance = this.parent.near;
        // move coordinate system in front of image plane
        this.position.z = 0 - (distance + 0.02);
        // scale coordinate system
        this.scale.x = distance; 
        this.scale.y = distance;
    }
}