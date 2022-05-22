import * as THREE from "../../threejs/ThreeModule.js";

export default class Grid extends THREE.LineSegments {

    constructor() {
        let size = 100
        let divisions = 100

        let xAxisColor = new THREE.Color(0x9D3C4A);
        //let yAxisColor = new THREE.Color(0x648B26);
        let zAxisColor = new THREE.Color(0x38679D);
        let gridColor = new THREE.Color(0x4F4F4F);

        let center = divisions / 2;
        let step = size / divisions;
        let halfSize = size / 2;

        let vertices = [], colors = [];

        for (let i = 0, j = 0, k = - halfSize; i <= divisions; i++, k += step) {

            vertices.push(- halfSize, 0, k, halfSize, 0, k);
            vertices.push(k, 0, - halfSize, k, 0, halfSize);

            let color;
            if (i === center) {
                color = xAxisColor;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
                color = zAxisColor;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
            } else {
                color = gridColor;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
                color.toArray(colors, j); j += 3;
            }
        }

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        let material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });

        super(geometry, material);

        this.type = 'Grid';
    }

}