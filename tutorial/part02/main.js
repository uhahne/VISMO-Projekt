function main()
{
    // create a scene object for all the content 
    const scene = new THREE.Scene();

    // create a camera to mathematically define the projection of the scene onto the screen
    const fieldOfView = 75;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const nearPlane = 0.1;
    const farPlane = 1000;
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane )

    // create a renderer that implements the projection of the scene onto the screen
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement);

    // create some content for the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube )

    // adjust camera position
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 5;

    // render the scene
    renderer.render(scene, camera);

}

main();