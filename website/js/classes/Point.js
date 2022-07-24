import * as THREE from "../../threejs/ThreeModule.js";

export default class Point extends THREE.Object3D {
    material;
    mesh;
    color = new THREE.Color(0xcccccc);

    constructor(name = "", position = new THREE.Vector3(), radius = 0) {
        super();
        this.name = name;

        let geometry = new THREE.SphereGeometry(radius, 8, 6);
        this.material = new THREE.MeshBasicMaterial({color: 0xcccccc});
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.add(this.mesh);

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
}