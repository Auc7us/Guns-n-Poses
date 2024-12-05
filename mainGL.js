// mainGL.js

import { loadWorldObjects, getRailPath} from './worldLoaderGL.js';
import { renderScene } from './renderGL.js';
import { createShader, createProgram, getLocations } from './utilsGL.js';
import { updateMovement, initiateJump } from './mechanicsGL.js';

async function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');
    const gravity = -9800;
    const jumpHeight = 5000;
    const absGround = 0 //-4000;
    const groundY = 0;
    const speed = 90;
    const deltaTime = 0.016; // ~60 FPS
    let lighttime = 0;

    if (!gl) {
        console.error('WebGL not supported!');
        return;
    }

    const worldObjects = await loadWorldObjects(gl);
    const railPath = await getRailPath();
    const vertexShaderSource1 = document.getElementById('vertex-shader1').text;
    const vertexShaderSource2 = document.getElementById('vertex-shader2').text;
    const fragmentShaderSource1 = document.getElementById('fragment-shader1').text;
    const fragmentShaderSource2 = document.getElementById('fragment-shader2').text;
    // const fragmentShaderSource3 = document.getElementById('fragment-shader3').text;
    // const fragmentShaderSource4 = document.getElementById('fragment-shader4').text;

    const vertexShader1 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource1);
    const vertexShader2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    const fragmentShader1 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource1);
    const fragmentShader2 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource2);
    // const fragmentShader3 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource3);
    // const fragmentShader4 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource4);
    
    const program1 = createProgram(gl, vertexShader1, fragmentShader1);
    const program2 = createProgram(gl, vertexShader2, fragmentShader2);
    // const program3 = createProgram(gl, vertexShader1, fragmentShader3);
    // const program4 = createProgram(gl, vertexShader1, fragmentShader4);

    // const programsWithLocations = {
    //     program1: getLocations(gl, program1),
    //     program2: getLocations(gl, program2),
    //     program3: getLocations(gl, program3),
    //     program4: getLocations(gl, program4)
    // };

    const camera = {
        position: vec3.fromValues(2000, 1900, 5000),
        target: vec3.fromValues(2000, 700, 0),
        up: vec3.fromValues(0, 1, 0),
    };

    const ego = {
        x: camera.position[0],
        y: camera.position[1],
        z: camera.position[2],
        velocityY: 0,
        isJumping: false,
        isFreeFalling: false,
        onGround: true,
    };

    const projection = {
        fov: (65 * Math.PI) / 180, // Default FOV (in radians)
        aspect: canvas.width / canvas.height,
        near: 0.1,
        far: 70000,
    };

    const keysPressed = {};
    const yawPitch = { yaw: 0, pitch: 0 };
    const mouseSensitivity = 0.002;
    const pitchLimit = Math.PI / 3 - 0.01;

    // FOV Slider Event Listener
    const fovSlider = document.getElementById('fovSlider');
    if (fovSlider) {
        fovSlider.addEventListener('input', (event) => {
            const fovValue = event.target.value;
            projection.fov = (fovValue * Math.PI) / 180; // Convert degrees to radians
        });
    }

    // Event Listeners for Movement and Mouse
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
        if (event.key === ' ') {
            initiateJump(ego, jumpHeight, gravity);
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === canvas) {
            yawPitch.yaw += event.movementX * mouseSensitivity;
            yawPitch.pitch += event.movementY * mouseSensitivity;

            if (yawPitch.pitch > pitchLimit) yawPitch.pitch = pitchLimit;
            if (yawPitch.pitch < -pitchLimit) yawPitch.pitch = -pitchLimit;
        }
    });

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    function updateCameraTarget() {
        const forward = vec3.fromValues(
            Math.sin(yawPitch.yaw),
            -Math.sin(yawPitch.pitch),
            -Math.cos(yawPitch.yaw)
        );
        vec3.normalize(forward, forward);
        vec3.add(camera.target, [ego.x, ego.y, ego.z], forward);
    }

    function renderLoop() {
        updateMovement(ego, gravity, keysPressed, yawPitch.yaw, yawPitch.pitch, speed, deltaTime, groundY, absGround);
        camera.position[0] = ego.x;
        camera.position[1] = ego.y;
        camera.position[2] = ego.z;

        lighttime += deltaTime;
        updateCameraTarget(); // Ensure the target updates on movement

        renderScene(gl, program1, program2, worldObjects, camera, projection, railPath, lighttime);
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

main();
