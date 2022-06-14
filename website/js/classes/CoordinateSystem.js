import * as THREE from "../../threejs/ThreeModule.js";

export default class CoordinateSystem extends THREE.Group {

    constructor() {
        super();
        this.name = "CoordinateSystem"

        let xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000, 0.2, 0.2);
        this.add(xAxis);
        let yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00, 0.2, 0.2);
        this.add(yAxis);
        let zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x0000ff, 0.2, 0.2);
        this.add(zAxis);
    }
}