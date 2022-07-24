import * as THREE from "../../threejs/ThreeModule.js";
import Point from "./Point.js";

export default class Line extends THREE.Object3D {
    startPoint;
    endPoint;
    material;
    line;
    color = new THREE.Color(0xffffff);

    constructor(startPoint = new Point(), endPoint = new Point()) {
        super();
        this.name = startPoint.name + "-" + endPoint.name;
        this.startPoint = startPoint;
        this.endPoint = endPoint;

        // create an array with the coordinates to create the geometry
        let coordinates = [];
        coordinates.push(new THREE.Vector3(startPoint.position.x, startPoint.position.y, startPoint.position.z));
        coordinates.push(new THREE.Vector3(endPoint.position.x, endPoint.position.y, endPoint.position.z));

        let geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.line = new THREE.Line(geometry, this.material);
        this.add(this.line);
    }

    isConnectedToPoint(point = new Point()) {
        if (this.startPoint.uuid == point.uuid || this.endPoint.uuid == point.uuid)
            return true;
        return false
    }

    update() {
        // create an array with the coordinates to create the new geometry
        let coordinates = [];
        coordinates.push(new THREE.Vector3(this.startPoint.position.x, this.startPoint.position.y, this.startPoint.position.z));
        coordinates.push(new THREE.Vector3(this.endPoint.position.x, this.endPoint.position.y, this.endPoint.position.z));
        
        let geometry = new THREE.BufferGeometry().setFromPoints(coordinates);

        // delete old line
        this.remove(this.line);
        // create new line
        this.line = new THREE.Line(geometry, this.material);

        this.add(this.line);
    }
}