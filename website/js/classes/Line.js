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

        // save the start & end point (for automatic line movement)
        this.startPoint = startPoint;
        this.endPoint = endPoint;

        // create an array with the coordinates to create the geometry
        let coordinates = [];
        // add the coordinates
        coordinates.push(new THREE.Vector3(startPoint.position.x, startPoint.position.y, startPoint.position.z));
        coordinates.push(new THREE.Vector3(endPoint.position.x, endPoint.position.y, endPoint.position.z));

        // create the geometry
        let geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
        // create the material
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        // create the line
        this.line = new THREE.Line(geometry, this.material);
        // add the line
        this.add(this.line);
    }

    isConnectedToPoint(point = new Point()) {
        if (this.startPoint.uuid == point.uuid || this.endPoint.uuid == point.uuid)
            return true;
        return false
    }

    update() {
        // create the new coordinates
        let coordinates = [];
        coordinates.push(new THREE.Vector3(this.startPoint.position.x, this.startPoint.position.y, this.startPoint.position.z));
        coordinates.push(new THREE.Vector3(this.endPoint.position.x, this.endPoint.position.y, this.endPoint.position.z));
        // create new geometry
        let geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
        // delete the old line
        this.remove(this.line);
        // create new line
        this.line = new THREE.Line(geometry, this.material);
        // add the new line
        this.add(this.line);
    }
}