// global variables for those elements needed in init and animate
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let renderer, cameraRight, scene;
let cameraLeft, cameraHelper;
let cube;

init();
animate();

function init()
{
    // create a scene object for all the content 
    scene = new THREE.Scene();

    // create the right camera to mathematically define the projection of the scene onto the screen
    const fieldOfView = 75;
    //const aspectRatio = window.innerWidth / window.innerHeight;
    const nearPlane = 0.1;
    const farPlane = 10;
    cameraRight = new THREE.PerspectiveCamera(fieldOfView, 0.5 * aspect, nearPlane, farPlane )
    cameraHelper = new THREE.CameraHelper(cameraRight);
	scene.add(cameraHelper);
    


    // create the left camera to mathematically define the projection of the right camera and the scene onto the screen
    cameraLeft = new THREE.PerspectiveCamera(fieldOfView, 0.5 * aspect, nearPlane, farPlane*10 )

    // create and configure the renderer that implements the projection of the scene onto the screen
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    //renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild( renderer.domElement);

    // deactivate the automatic clearing after render call
    renderer.autoClear = false;
    
    // add event listener to handle window resizing
    window.addEventListener( 'resize', onWindowResize );

    // create some content for the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( 
        { 
            color: 0x00ff00,
            wireframe: true 
        } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube )

    // adjust camera positions
    cameraRight.position.x = 1;
    cameraRight.position.y = 1;
    cameraRight.position.z = 5;

    cameraLeft.position.x = 1;
    cameraLeft.position.y = 1;
    cameraLeft.position.z = 25;

}

function animate() {
	// built-in method to run the render loop
    requestAnimationFrame(animate);

    // clear manually but not between the two render calls
    renderer.clear();
    
    // animate the cube by changing the transformation
    cube.rotation.y += 0.01;

    // adjust the camera positions and viewing directions
    cameraRight.lookAt(cube.position);
    cameraLeft.position.x = -20;
    cameraLeft.lookAt(cube.position);
    cameraHelper.visible = true;

    // set the viewport to a split screen
    renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
	renderer.render(scene, cameraLeft);

    // do not show the viewing frustum in the right image
	cameraHelper.visible = false;

	renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
	renderer.render(scene, cameraRight);
}

function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    cameraLeft.aspect = 0.5 * aspect;
    cameraLeft.updateProjectionMatrix();

    cameraRight.aspect = 0.5 * aspect;
    cameraRight.updateProjectionMatrix();


}

