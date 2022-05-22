// global variables for those elements needed in init and animate
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let renderer, cameraRight, scene;
let cameraLeft, cameraHelperRight, CameraHelperLeft;
let cube;
let cameraTop

let colorCube = new THREE.Color( "rgb(57, 180, 245)" );
let colorLineRight = new THREE.Color( "rgb(255, 110, 183)" );
let colorLineLeft = new THREE.Color( "rgb(183, 255, 110)" );


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
    cameraRight = new THREE.PerspectiveCamera(fieldOfView, 0.5 * aspect, nearPlane, farPlane );
    cameraHelperRight = new THREE.CameraHelper(cameraRight);
	scene.add(cameraHelperRight);


    // create the left Camera
    cameraLeft = new THREE.PerspectiveCamera(fieldOfView, 0.5 * aspect, nearPlane, farPlane);

    CameraHelperLeft = new THREE.CameraHelper(cameraLeft);
	scene.add(CameraHelperLeft);

    


    // create the top camera to mathematically define the projection of the right camera and the scene onto the screen
    cameraTop = new THREE.PerspectiveCamera(fieldOfView, 2 * aspect, nearPlane, farPlane*10 );



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
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial( 
        { 
            color: colorCube,
            wireframe: true 
        } );
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);


    // adjust camera positions
    cameraRight.position.x = 1;
    cameraRight.position.y = 1;
    cameraRight.position.z = 5;

    cameraLeft.position.x = 1;
    cameraLeft.position.y = 1;
    cameraLeft.position.z = -5;
    cameraLeft.rotation.z = 1,5708; 

    cameraTop.position.x = 1;
    cameraTop.position.y = 1;
    cameraTop.position.z = 25;

    // create a line object for Right Camera
    let pointsCameraRight = [];

    pointsCameraRight.push(new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z));
    pointsCameraRight.push(new THREE.Vector3(cameraRight.position.x, cameraRight.position.y, cameraRight.position.z));
    
    // THREE.Line ( THREE.BufferGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE_STRIP
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(pointsCameraRight);
    
    const lineMaterial = new THREE.LineBasicMaterial( { color: colorLineRight } );

    lineRight = new THREE.Line( lineGeometry, lineMaterial );
    //line.computeLineDistances();
    scene.add( lineRight );



        // create a line object for Left Camera
        let pointsCameraLeft = [];

        pointsCameraLeft.push(new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z));
        pointsCameraLeft.push(new THREE.Vector3(cameraLeft.position.x, cameraLeft.position.y, cameraLeft.position.z));
        
        // THREE.Line ( THREE.BufferGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE_STRIP
        const lineGeometryLeft = new THREE.BufferGeometry().setFromPoints(pointsCameraLeft);
        
        const lineMaterialLeft = new THREE.LineBasicMaterial( { color: colorLineRight } );
    
        lineLeft = new THREE.Line( lineGeometryLeft, lineMaterialLeft );
        //line.computeLineDistances();
        scene.add( lineLeft );
    

}

function animate() {
	// built-in method to run the render loop
    requestAnimationFrame(animate);

    // clear manually but not between the two render calls
    renderer.clear();
    
    // animate the cube by changing the transformation
    cube.rotation.y -= 0.035;
    // cube.rotation.x += 0.04; 


    // adjust the camera positions and viewing directions
    cameraRight.lookAt(cube.position);
    cameraLeft.lookAt(cube.position);
    cameraTop.position.x = -20;
    cameraTop.lookAt(cube.position);


    // set the viewport to a split screen
    renderer.setViewport(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
    cameraHelperRight.visible = true;
    CameraHelperLeft.visible = true;

	renderer.render(scene, cameraTop);

    console.log(SCREEN_HEIGHT)


    // do not show the viewing frustum in the right image


	renderer.setViewport(SCREEN_WIDTH / 2, -SCREEN_HEIGHT / 5, SCREEN_WIDTH / 2,  SCREEN_HEIGHT); 
    cameraHelperRight.visible = false;
    CameraHelperLeft.visible = false;

	renderer.render(scene, cameraRight);

    renderer.setViewport(0, -SCREEN_HEIGHT / 5, SCREEN_WIDTH / 2,  SCREEN_HEIGHT  ); 
    cameraHelperRight.visible = false;
    CameraHelperLeft.visible = false;

	renderer.render(scene, cameraLeft);


}

function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    cameraTop.aspect = 0.5 * aspect;
    cameraTop.updateProjectionMatrix();

    cameraRight.aspect = 0.5 * aspect;
    cameraRight.updateProjectionMatrix();
    
    cameraLeft.aspect = 0.5 * aspect;
    cameraLeft.updateProjectionMatrix();


}

