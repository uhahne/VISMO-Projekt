import * as THREE from "../../threejs/ThreeModule.js";

export default class Camera extends THREE.PerspectiveCamera {
    //imagePlane; // = Bildebene
    //coordinateSystem; // = Koordinatensystem
    principalPoint = new THREE.Vector3(); // = Hauptpunkt 
    projectionCenter = new THREE.Vector3(); // = Projektionszentrum Z = camera.position
    distance = 1; // = Distanz (zwischen Projektionszentrum und Hauptpunkt)
    projectionMatrixArray = []; // new THREE.Matrix4(); -> Calculation see ViSMo_Arbeitsblatt-1


    constructor(_position, _distance, _aspect) {
        super();
        this.fov = 110;
        this.aspect = _aspect;
        this.near = _distance; // imgPlane, so = distance
        this.far = 20;

        this.name = "Camera";

        //this.imagePlane = new THREE.Plane();

        //this.coordinateSystem = new THREE.AxesHelper();
        //this.add(this.coordinateSystem);

        this.projectionCenter = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        this.updateEverything();

        this.distance = _distance; // to get the position if the opticalCenter

        this.projectionMatrixArray = this.updateProjectionMatrixArray();

        // position the camera
        this.position.x = _position.x;
        this.position.y = _position.y;
        this.position.z = _position.z;
    }

    updateEverything() { // TODO: needs to happen after every camera manipulation (position)
        // !!! CAMERA 1 TEST VALUES !!!
        // this.projectionCenter = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        // this.principalPoint = new THREE.Vector3(0, 0, 1);
        // !!! CAMERA 2 TEST VALUES !!!
        // this.projectionCenter = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        // this.principalPoint = new THREE.Vector3(5 - 1 / Math.sqrt(2), 0, 2 + 1 / Math.sqrt(2));

        /* UPDATE PROJECTION CENTER */
        // (if the position of the object == projection center (which for now it does))
        this.projectionCenter = new THREE.Vector3(Number(this.position.x), Number(this.position.y), Number(this.position.z));

        /* UPDATE PRINCIPAL POINT */
        // get the camera's normal (direction it's facing)
        let normal = new THREE.Vector3();
        this.getWorldDirection(normal);
        // calculate the principal via "projection center", "distance" and "normal"
        this.principalPoint = new THREE.Vector3(this.projectionCenter.x + normal.x * this.distance, this.projectionCenter.y + normal.y * this.distance, this.projectionCenter.z + normal.z * this.distance);
    
        this.updateProjectionMatrixArray();
    }

    updateProjectionMatrixArray() {
        // get Z (projection center)
        let z = new THREE.Vector4(
            this.projectionCenter.x,
            this.projectionCenter.y,
            this.projectionCenter.z,
            1
        );

        // get the normal from the projection center to the principal point)
        let normal = new THREE.Vector3();
        normal.subVectors(this.principalPoint, this.projectionCenter).normalize();

        // get D from linear equation (= AKG/Allgemeine Koordinatengleichung)
        let d = -(normal.x * this.principalPoint.x + normal.y * this.principalPoint.y + normal.z * this.principalPoint.z);

        // get L
        let l = new THREE.Vector4(
            normal.x,
            normal.y,
            normal.z,
            d
        );

        // get 1 / (L * Z)
        let r1 = 1 / (l.x * z.x + l.y * z.y + l.z * z.z + l.w * z.w);

        // get Z * L
        let r2 = [
            z.x * l.x, z.x * l.y, z.x * l.z, z.x * l.w,
            z.y * l.x, z.y * l.y, z.y * l.z, z.y * l.w,
            z.z * l.x, z.z * l.y, z.z * l.z, z.z * l.w,
            z.w * l.x, z.w * l.y, z.w * l.z, z.w * l.w
        ];

        // get (1 / (L * Z)) * (Z * L) = r1 * r2
        let r3 = [
            r2[0] * r1, r2[1] * r1, r2[2] * r1, r2[3] * r1,
            r2[4] * r1, r2[5] * r1, r2[6] * r1, r2[7] * r1,
            r2[8] * r1, r2[9] * r1, r2[10] * r1, r2[11] * r1,
            r2[12] * r1, r2[13] * r1, r2[14] * r1, r2[15] * r1
        ];

        // identity matrix (= Einheitsmatrix)
        let e = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        // get e - r3 (results in projection matrix)
        this.projectionMatrixArray = [
            e[0] - r3[0], e[1] - r3[1], e[2] - r3[2], e[3] - r3[3],
            e[4] - r3[4], e[5] - r3[5], e[6] - r3[6], e[7] - r3[7],
            e[8] - r3[8], e[9] - r3[9], e[10] - r3[10], e[11] - r3[11],
            e[12] - r3[12], e[13] - r3[13], e[14] - r3[14], e[15] - r3[15]
        ]
    }

    getImageCoord(_pointCoord) { // _pointCoord: THREE.Vector3
        // apply matrix to point coordinates
        let coord = [
            this.projectionMatrixArray[0] * _pointCoord.x + this.projectionMatrixArray[1] * _pointCoord.y + this.projectionMatrixArray[2] * _pointCoord.z + this.projectionMatrixArray[3] * 1,
            this.projectionMatrixArray[4] * _pointCoord.x + this.projectionMatrixArray[5] * _pointCoord.y + this.projectionMatrixArray[6] * _pointCoord.z + this.projectionMatrixArray[7] * 1,
            this.projectionMatrixArray[8] * _pointCoord.x + this.projectionMatrixArray[9] * _pointCoord.y + this.projectionMatrixArray[10] * _pointCoord.z + this.projectionMatrixArray[11] * 1,
            this.projectionMatrixArray[12] * _pointCoord.x + this.projectionMatrixArray[13] * _pointCoord.y + this.projectionMatrixArray[14] * _pointCoord.z + this.projectionMatrixArray[15] * 1
        ];

        // normalize point coordinates vector
        coord = [
            coord[0] / coord[3], coord[1] / coord[3], coord[2] / coord[3], coord[3] / coord[3]
        ];

        // turn vector into image coordinates
        let imageCoord = new THREE.Vector2(coord[0].toFixed(4), coord[1].toFixed(4))

        return imageCoord;
    }
} 