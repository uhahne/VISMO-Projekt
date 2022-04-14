			const scene = new THREE.Scene();

			const aspect = window.innerWidth / window.innerHeight

			let insetWidth, insetHeight; 

			const renderer = new THREE.WebGLRenderer();
			
			console.log("Test");

			//erste Szenen-Cam 
			let camera = new THREE.PerspectiveCamera( 70, aspect , 0.1, 750 );
            
			camera.position.z = 4;
			camera.position.y = 2;
			camera.lookAt(0, 0, 0); 

			//zweite Cam (mit Parameter)
			let cameraTwo = new THREE.PerspectiveCamera (50, aspect, 0.01, 500);

			cameraTwo.position.set(2, 2, 2);
			cameraTwo.lookAt(0, 0, 0); 

			//zweite camera wird child von erster
			camera.add(cameraTwo);
			//adding cam to the scene
			scene.add(camera);


			const geometry = new THREE.BoxGeometry();
			const material = new THREE.MeshBasicMaterial( { color: 0x8a00ff } );
			const cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

/*
			const animate = function () {
				requestAnimationFrame( animate );

				cube.rotation.x += 0.01;
				cube.rotation.y += 0.01;


				renderer.render( scene, camera );
			};
*/
			animate();

			resize();

			function resize() {
				//cam 1
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize (window.innerWidth, window.innerHeight);

				//cam 2
				insetWidth = window.innerWidth / 4; 
				insetHeight = window.innerHeight / 4;

				cameraTwo.aspect = insetWidth / insetHeight;
				cameraTwo.updateProjectionMatrix();



			}
			window.addEventListener ("resize", resize);
			

			function animate() {
				requestAnimationFrame(animate);

				//cam 1
				/*
				camera.position.x = cube.position.x;
				camera.position.y = cube.position.z + 10;
				cube.rotation.y += 0.01; 
				*/

				renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	//				renderer.setSize( window.innerWidth, window.innerHeight );
	//				document.body.appendChild( renderer.domElement );

				renderer.render(scene, camera);


				//cam 2
				renderer.clearDepth();

				renderer.setScissorTest(true);
				
				renderer.setScissor(
					window.innerWidth - insetWidth - 16,
					window.innerHeight - insetHeight -16,
					insetWidth,
					insetHeight
				);

				renderer.setViewport (
					window.innerWidth - insetWidth - 16,
					window.insetHeight - insetHeight - 16,
					insetWidth,
					insetHeight
				); 

				renderer.render(scene, cameraTwo);
				renderer.setScissorTest (false);

			}
