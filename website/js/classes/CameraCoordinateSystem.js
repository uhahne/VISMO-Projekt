import * as THREE from "../../threejs/ThreeModule.js";

export default class CameraCoordinateSystem extends THREE.Group {

    constructor() {
        super();
        this.name = "CameraCoordinateSystem"

        let xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000, 0.2, 0.05);
        this.add(xAxis);

        let yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00, 0.2, 0.05);
        this.add(yAxis);
    }

    update() { /* DISCLAIMER: parent must be camera! */
    let distance = this.parent.near; // get camera's distance from center to image plane
    this.position.z = 0 - (distance + 0.02); // move coordinate system in front of image plane
    this.scale.x = distance; // scale coordinate system
    this.scale.y = distance; // scale coordinate system
    }
}