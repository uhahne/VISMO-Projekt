let render, camera, scene; 
let cone;


main();
animate();

function main() 
{
    //create the scene that shall be rendered
    scene = new THREE.Scene();

    // create and define a camera
    const fieldOfView = 50;
    const aspect = window.innerWidth/window.innerHeight; 
    const near = 1; 
    const far = 2000; 
    camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far)

    // adjust camera position & orientation

    camera.position.set(0, 0, 0);

    camera.lookAt(-5, -5, -5); 



    // create a renderer that implements the projection of the scene onto the screen
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement);

    // create some content for the scene
    const geometry = new THREE.ConeGeometry( 3, 7, 4 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true} );
    cone = new THREE.Mesh( geometry, material );
    cone.position.set(-5, -5, -5);
    scene.add( cone );


    // update the camera aspect when the window of the browser is changed
    window.addEventListener( 'resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
    }, false );
    

}
 


function animate() {

    requestAnimationFrame( animate );
    //let cone rotate/animate by changing the 
    cone.rotation.y += 0.01;
    cone.rotation.x += 0.01;

    //render the scene
    renderer.render(scene, camera);

}



