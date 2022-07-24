import * as THREE from "../../threejs/ThreeModule.js";

export default class Camera extends THREE.PerspectiveCamera {
    principalPoint = new THREE.Vector3();
    projectionMatrixArray = [];

    constructor(projectionCenterPosition = new THREE.Vector3(), distance = 0, aspect = 0) {
        super();
        this.fov = 110;
        this.aspect = aspect;
        this.near = distance;
        this.far = 20;
        this.name = "Camera";

        this.updatePrincipalPoint();
        this.updateProjectionMatrixArray();

        this.position.set(
            Number(projectionCenterPosition.x),
            Number(projectionCenterPosition.y),
            Number(projectionCenterPosition.z)
        );
    }

    updatePrincipalPoint() {
        // get camera's normal (= direction it's facing)
        let normal = new THREE.Vector3();
        this.getWorldDirection(normal);

        // calculate the principal via projection center, distance and normal
        this.principalPoint = new THREE.Vector3(this.position.x + normal.x * this.near, this.position.y + normal.y * this.near, this.position.z + normal.z * this.near);
    }

    updateProjectionMatrixArray() {
        // get Z (projection center)
        let z = new THREE.Vector4(
            this.position.x,
            this.position.y,
            this.position.z,
            1
        );

        // get the normal from the projection center to the principal point)
        let normal = new THREE.Vector3();
        this.getWorldDirection(normal);

        // get D from linear equation (= AKG)
        this.updatePrincipalPoint();
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

    // returns string
    getAKG() {
        let akg = "ax + by + cz = d";

        let normal = new THREE.Vector3();
        this.getWorldDirection(normal);

        this.updatePrincipalPoint();

        let d = normal.x * this.principalPoint.x + normal.y * this.principalPoint.y + normal.z * this.principalPoint.z;
        akg = normal.x.toFixed(3) + "x + " + normal.y.toFixed(3) + "y + " + normal.z.toFixed(3) + "z = " + d.toFixed(3);

        return akg;
    }

    /*
    // get image coordinates (world coordinate system) by using the projection matrix
    getImageCoordWorld(pointCoord = new THREE.Vector3()) {
        // apply matrix to point coordinates
        let coord = [
            this.projectionMatrixArray[0] * pointCoord.x + this.projectionMatrixArray[1] * pointCoord.y + this.projectionMatrixArray[2] * pointCoord.z + this.projectionMatrixArray[3] * 1,
            this.projectionMatrixArray[4] * pointCoord.x + this.projectionMatrixArray[5] * pointCoord.y + this.projectionMatrixArray[6] * pointCoord.z + this.projectionMatrixArray[7] * 1,
            this.projectionMatrixArray[8] * pointCoord.x + this.projectionMatrixArray[9] * pointCoord.y + this.projectionMatrixArray[10] * pointCoord.z + this.projectionMatrixArray[11] * 1,
            this.projectionMatrixArray[12] * pointCoord.x + this.projectionMatrixArray[13] * pointCoord.y + this.projectionMatrixArray[14] * pointCoord.z + this.projectionMatrixArray[15] * 1
        ];

        // normalize point coordinates vector
        coord = [
            coord[0] / coord[3], coord[1] / coord[3], coord[2] / coord[3], coord[3] / coord[3]
        ];

        // turn vector into image coordinates
        let imageCoord = new THREE.Vector3(coord[0], coord[1], coord[2])

        return imageCoord;
    }
    */
    
    // get image coordinates (world coordinate system) by getting the intersection point through mathematical calculation
    getImageCoordWorld(pointCoord = new THREE.Vector3()) {
        // get normal coordinates
        let normal = new THREE.Vector3();
        this.getWorldDirection(normal);

        // calculate normal * p (p = pointCoord = Stützvektor)
        let np = normal.x * pointCoord.x + normal.y * pointCoord.y + normal.z * pointCoord.z;

        // get d
        this.updatePrincipalPoint();
        let d = normal.x * this.principalPoint.x + normal.y * this.principalPoint.y + normal.z * this.principalPoint.z;

        // calculate d - (normal * p)
        d -= np;

        // get u (= Richtungsvektor = pointCoord - this.position)
        let u = new THREE.Vector3(pointCoord.x - this.position.x, pointCoord.y - this.position.y, pointCoord.z - this.position.z);

        // calculate normal * u
        let nu = normal.x * u.x + normal.y * u.y + normal.z * u.z;

        // calculate d / (normal * u)
        let t = d / nu;

        // insert t into the line equation to get the intersection point (s)
        let s = new THREE.Vector3(pointCoord.x + u.x * t, pointCoord.y + u.y * t, pointCoord.z + u.z * t);

        return s;
    }
    
    getImageCoordCamera(pointCoord = new THREE.Vector3()) {
        // get the image coordinates (world coordinate system)
        let imageCoordCamera = this.getImageCoordWorld(pointCoord);

        // transform the world coordinates into the camera coordinate system
        imageCoordCamera.applyMatrix4(this.matrixWorldInverse);

        // rotate 180° around the y-axis (because the camera's z is facing the opposite direction)
        let rotationMatrix = new THREE.Matrix3();
        rotationMatrix.set(
            -1, 0, 0,
            0, 1, 0,
            0, 0, -1
        );
        imageCoordCamera.applyMatrix3(rotationMatrix);

        return imageCoordCamera;  
    }
} 