// global variables for those elements needed in init and animate
let renderer, camera, scene;
let cube;

init();
animate();

function init()
{
    // create a scene object for all the content 
    scene = new THREE.Scene();

    // create a camera to mathematically define the projection of the scene onto the screen
    const fieldOfView = 75;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const nearPlane = 0.1;
    const farPlane = 1000;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane )

    // create and configure the renderer that implements the projection of the scene onto the screen
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement);

    // create some content for the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( 
        { 
            color: 0x00ff00,
            wireframe: true 
        } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube )

    // adjust camera position
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 5;

}

function animate() {
	// built-in method to run the render loop
    requestAnimationFrame( animate );
    // animate the cube by changing the transformation
    cube.rotation.y += 0.01;


    // render the scene
    renderer.render(scene, camera);
}

