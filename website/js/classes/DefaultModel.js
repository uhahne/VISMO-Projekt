import * as THREE from "../../threejs/ThreeModule.js";
import Point from "./Point.js";
import Line from "./Line.js";

export default class DefaultModel extends THREE.Object3D {

    constructor(position = new THREE.Vector3()) {
        super();

        // create the points of the default model
        let pointAb = new Point("Ab", new THREE.Vector3(3, -2, 3), 0.25);
        let pointBb = new Point("Bb", new THREE.Vector3(-3, -2, 3), 0.25);
        let pointCb = new Point("Cb", new THREE.Vector3(-3, -2, 6), 0.25);
        let pointDb = new Point("Db", new THREE.Vector3(3, -2, 6), 0.25);
        let pointAc = new Point("Ac", new THREE.Vector3(3, 2.5, 3), 0.25);
        let pointBc = new Point("Bc", new THREE.Vector3(-3, 2.5, 3), 0.25);
        let pointCc = new Point("Cc", new THREE.Vector3(-3, 2.5, 6), 0.25);
        let pointDc = new Point("Dc", new THREE.Vector3(3, 2.5, 6), 0.25);
        let pointCr = new Point("Cr", new THREE.Vector3(-3, 3.5, 6), 0.25);
        let pointDr = new Point("Dr", new THREE.Vector3(3, 3.5, 6), 0.25);

        // add the points to the default model
        this.add(pointAb, pointBb, pointCb, pointDb, pointAc, pointBc, pointCc, pointDc, pointCr, pointDr);

        // create and add the lines - which connect the points - to the default model
        this.add(new Line(pointAb, pointBb));
        this.add(new Line(pointBb, pointCb));
        this.add(new Line(pointCb, pointDb));
        this.add(new Line(pointDb, pointAb));
        this.add(new Line(pointAb, pointAc));
        this.add(new Line(pointBb, pointBc));
        this.add(new Line(pointCb, pointCc));
        this.add(new Line(pointDb, pointDc));
        this.add(new Line(pointAc, pointBc));
        this.add(new Line(pointBc, pointCc));
        this.add(new Line(pointCc, pointDc));
        this.add(new Line(pointDc, pointAc));
        this.add(new Line(pointCc, pointCr));
        this.add(new Line(pointDc, pointDr));
        this.add(new Line(pointBc, pointCr));
        this.add(new Line(pointCr, pointDr));
        this.add(new Line(pointDr, pointAc));

        // position the default model
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
}