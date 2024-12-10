// mainGL.js

import {loadWorldObjects, getRailPath} from './worldLoaderGL.js';
import {renderScene } from './renderGL.js';
import {createShader, createProgram, loadTexture } from './utilsGL.js';
import {updateMovement, initiateJump } from './mechanicsGL.js';

async function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');
    const gravity = -9800;
    const jumpHeight = 5000;
    const absGround = 0 //-4000;
    const groundY = 0;
    const speed = 90;
    const deltaTime = 0.016; // ~60 FPS
    let loopTime = 0;

    if (!gl) {
        console.error('WebGL not supported!');
        return;
    }

    const worldObjects = await loadWorldObjects(gl);
    const railPath = await getRailPath();
    const vertexShaderSrc = document.getElementById(    'vertex-shader').text;
    const vertexTexSrc    = document.getElementById(    'vertex-texture').text;
    const fragmentBPDSrc  = document.getElementById( 'fragment-bpd').text;
    const fragmentSpecSrc = document.getElementById('fragment-specular').text;
    const fragmentTexSrc  = document.getElementById( 'fragment-texture').text;

    const vertexShader = createShader(gl,   gl.VERTEX_SHADER, vertexShaderSrc);
    const vertexTex = createShader(gl,   gl.VERTEX_SHADER, vertexTexSrc);
    const fSBPD        = createShader(gl, gl.FRAGMENT_SHADER, fragmentBPDSrc);
    const fSSpecular   = createShader(gl, gl.FRAGMENT_SHADER, fragmentSpecSrc);
    const fSTex        = createShader(gl, gl.FRAGMENT_SHADER, fragmentTexSrc);
    
    const program1 = createProgram(gl, vertexShader, fSBPD);
    const program2 = createProgram(gl, vertexShader, fSBPD);
    const program3 = createProgram(gl,    vertexTex, fSTex);

    const groundTexture = loadTexture(gl, 'objects/ground.jpg');
    const woodTexture = loadTexture(gl, 'objects/wood.jpg');
    const objTexture = loadTexture(gl, 'objects/stairs.jpg');
    const nGroundTex = loadTexture(gl, 'objects/ground-normal1.jpg');
    const nObjTex = loadTexture(gl, 'objects/stairs-normal.jpg');
    const nWoodTex = loadTexture(gl, 'objects/wood-normal.jpg');

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
        const forward = vec3.fromValues(Math.sin(yawPitch.yaw), -Math.sin(yawPitch.pitch), -Math.cos(yawPitch.yaw));
        vec3.normalize(forward, forward);
        vec3.add(camera.target, [ego.x, ego.y, ego.z], forward);
    }

    function renderLoop() {
        updateMovement(ego, gravity, keysPressed, yawPitch.yaw, speed, deltaTime, groundY, absGround);
        camera.position[0] = ego.x;
        camera.position[1] = ego.y;
        camera.position[2] = ego.z;

        loopTime += deltaTime;
        updateCameraTarget(); // Ensure the target updates on movement

        renderScene(gl, program1, program2, program3, worldObjects, camera, projection, railPath, loopTime, groundTexture, woodTexture, objTexture, nGroundTex, nWoodTex, nObjTex);
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

main();
