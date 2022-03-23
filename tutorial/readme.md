# This is a tutorial for getting familiar with THREE.js and WebGL

Author: Uwe Hahne
Last date of change: 2022/03/07

Inspired by the following tutorials:
-  [Three.js Visual Studio Code Setup Tutorial](https://youtu.be/DEtTa3LrFVE) 
-  [Three.js - Spiele für den Browser entwickeln](https://www.youtube.com/playlist?list=PLNmsVeXQZj7rrmmZEVGA4GfLLNLlGipWo)

The idea is to start from the code in the [part00](./part00) folder and extend this code as described in the following. The resulting code after each part is already committed and can be used as a check or to re-enter the tutorial at a later step.

## Part 01 - Setup
First step is to set up the development environment. We need an editor in order to write the source code. In order to get supported while typing, we use [Visual Studio Code (VS Code)](https://code.visualstudio.com/) as editor. VS Code is a streamlined code editor that provides various tools that ease the typing and testing of our code, while it is much less complex than a complex integrated development environment (IDE). VS Code supports various languages and runs on Windows, Mac and Linux. This tutorial has been created using the VS Code version 1.64.2, but should be compatible to most other versions.

Step A
- [x] Install Visual Studio Code

As we want to work with Three.js, we also need to install or clone it.

Step B
  [x] Install or clone Three.js from https://threejs.org/ under *Code*.

As we are developing a website, we need to run a local server in order to be able to display and test our results. Here, we can either use `python http.server` or the VS Code extension *Live Server*.

Step C
- [x] Either install python or the VS Code extension

We then create an index.html file and fill it with the regular code structure for HTML documents. This can be done with typing `!` and then let VS Code generate the code for us.

Step D (use part00 folder, there are the TODOs marked in the code)
- [x] Create the folder structure, copy three.js module files and the index.html
- [x] Then the index.html shall include three.js and our own script file.

As last step, we test if all tools have been installed successfully. 

Step E
- [x] Create a JavaScript source file `main.js` and test the access to the three.js module with a console output.



## Part 02 - Creating and rendering of a first scene
Steps to do
- [x] create a scene object for all the content 
- [x] create a camera to mathematically define the projection of the scene onto the screen
- [ ] create a renderer that implements the projection of the scene onto the screen
- [ ] create some content for the scene
- [ ] render the scene

In order to get a first 3D impression, we need to adjust camera position.

## Part 03 - Animate the scene
Steps to do
- [ ] restructure the code and create a render loop
- [ ] animate the scene object transformations by changing the transformation

## Part 04 - Visualize the virtual camera
Inspired by the [THREE.js camera example](https://github.com/mrdoob/three.js/blob/master/examples/webgl_camera.html)
Steps to do
- [ ] split the view in two parts, start with two identically set cameras
  - [ ] Use an event listener for window resizing
  - [ ] Be aware that the renderer has an autoclear functionality
- [ ] change the left camera so that it looks at the right camera
- [ ] use a camera helper to visualize the viewing frustum

## Part 05 - Draw a line
- [ ] Draw a line from the optical center into the scene
