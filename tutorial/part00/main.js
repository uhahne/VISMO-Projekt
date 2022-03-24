// TODO check if THREE.js is available
console.log(THREE)

function main() 
{
    //create the scene that shall be rendered
    const scene = new THREE.Scene();

    // create and define a camera
    const fieldOfView = 50;
    const aspect = window.innerWidth/window.innerHeight; 
    const near = 0.1; 
    const far = 2000; 
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far)

    // adjust camera position & orientation

    camera.position.set(1, 1, 15);

    camera.lookAt(0, 0, 0); 
    


    // create a renderer that implements the projection of the scene onto the screen
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement);

    // create some content for the scene
    const geometry = new THREE.ConeGeometry( 3, 7, 200 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cone = new THREE.Mesh( geometry, material );
    scene.add( cone );

    // render the scene
    renderer.render(scene, camera);
    
}


main();
