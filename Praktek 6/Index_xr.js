import * as THREE from './modules/three.module.js';
import { VRButton } from './VRButton.js';

var gl, cube, sphere, light, camera, scene, controller, videoTexture;

init();
animate();

function init() {
    // create context
    gl = new THREE.WebGLRenderer({ antialias: true });
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.xr.enabled = true;

    document.body.appendChild(gl.domElement);
    document.body.appendChild(VRButton.createButton(gl)); // Ensure this returns a Node

    // create camera
    const angleOfView = 55;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const nearPlane = 0.1;
    const farPlane = 1000;

    camera = new THREE.PerspectiveCamera(angleOfView, aspectRatio, nearPlane, farPlane);
    camera.position.set(0, 8, 30);

    // create the scene
    scene = new THREE.Scene();

    // Access the camera stream using getUserMedia
    const video = document.createElement('video');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((error) => {
            console.error('Error accessing the camera', error);
        });

    // Create video texture and apply as background when ready
    videoTexture = new THREE.VideoTexture(video);
    scene.background = videoTexture; // Set the video stream as the background

    // GEOMETRY
    const cubeSize = 4;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const sphereRadius = 3;
    const sphereWidthSegments = 32;
    const sphereHeightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments);

    // MATERIALS
    const textureLoader = new THREE.TextureLoader(); 

    // Tekstur untuk Cube
    const cubeTextureMap = textureLoader.load('textures/dias.png'); 
    const cubeMaterial = new THREE.MeshPhongMaterial({map: cubeTextureMap}); // Apply cube texture

    // Tekstur untuk Sphere
    const sphereNormalMap = textureLoader.load('textures/dias.png');
    sphereNormalMap.wrapS = THREE.RepeatWrapping;
    sphereNormalMap.wrapT = THREE.RepeatWrapping;
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: sphereNormalMap }); // Apply sphere texture

    // MESHES
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize + 1, cubeSize + 1, 0);
    scene.add(cube);

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);

    // LIGHTS
    const color = 0xffffff;
    const intensity = 0.7;
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 30, 30);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // CONTROLLER
    controller = gl.xr.getController(0);
    controller.addEventListener('selectstart', onSelectStart); // Listen for controller input
    scene.add(controller);
}

function onSelectStart() {
    // Change color when controller button is pressed
    cube.material.color.set(Math.random() * 0xffffff); // Random color for the cube
    sphere.material.color.set(Math.random() * 0xffffff); // Random color for the sphere
}

function render(time) {
    time *= 0.001;

    if (resizeDisplay()) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    // Rotate objects
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    sphere.rotation.z += 0.01;

    // Render the scene
    gl.render(scene, camera);
}

function animate() {
    gl.setAnimationLoop(render);
}

function resizeDisplay() {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
