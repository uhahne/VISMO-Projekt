import * as THREE from "../../threejs/ThreeModule.js";

export default class Point extends THREE.Object3D {

    material;
    mesh;
    color = new THREE.Color(0x008C5A);

    constructor(_name, _position, _radius) { // _name: string | _position: THREE.Vector3 | _radius: number
        super();
        this.name = _name;

        // create the geometry
        let geometry = new THREE.SphereGeometry(_radius, 8, 6);
        // create the material
        this.material = new THREE.MeshBasicMaterial({color: 0x008C5A});
        // create the mesh
        this.mesh = new THREE.Mesh(geometry, this.material);
        // add the mesh
        this.add(this.mesh);

        // position the point
        this.position.x = _position.x;
        this.position.y = _position.y;
        this.position.z = _position.z;
    }
}