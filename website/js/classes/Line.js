import * as THREE from "../../threejs/ThreeModule.js";

export default class Line extends THREE.Object3D {

    startPoint;
    endPoint;
    material;
    line;
    color = new THREE.Color(0xffffff);

    constructor(_startPoint, _endPoint) { // _startPoint: Point | _endPoint: Point
        super();
        this.name = _startPoint.name + "-" + _endPoint.name;

        // save the start & end point (for automatic line movement)
        this.startPoint = _startPoint;
        this.endPoint = _endPoint;

        // create an array with the coordinates to create the geometry
        let coordinates = [];
        // add the coordinates
        coordinates.push(new THREE.Vector3(_startPoint.position.x, _startPoint.position.y, _startPoint.position.z));
        coordinates.push(new THREE.Vector3(_endPoint.position.x, _endPoint.position.y, _endPoint.position.z));

        // create the geometry
        let geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
        // create the material
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        // create the line
        this.line = new THREE.Line(geometry, this.material);
        // add the line
        this.add(this.line);
    }

    isConnectedToPoint(_point) {
        if (this.startPoint.uuid == _point.uuid || this.endPoint.uuid == _point.uuid)
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