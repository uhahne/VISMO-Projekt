import * as THREE from "../../threejs/ThreeModule.js";

export default class Point extends THREE.Object3D {

    material;
    mesh;
    color = new THREE.Color(0xcccccc);

    constructor(name = "", position = new THREE.Vector3(), radius = 0) {
        super();
        this.name = name;

        // create the geometry
        let geometry = new THREE.SphereGeometry(radius, 8, 6);
        // create the material
        this.material = new THREE.MeshBasicMaterial({color: 0xcccccc});
        // create the mesh
        this.mesh = new THREE.Mesh(geometry, this.material);
        // add the mesh
        this.add(this.mesh);

        // position the point
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
}