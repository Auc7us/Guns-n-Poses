// mainGL.js

import {loadWorldObjects, getRailPath} from './worldLoaderGL.js';
import {renderScene } from './renderGL.js';
import {createShader, createProgram, loadTexture } from './utilsGL.js';
import {updateMovement, initiateJump,updateBullets, shoot } from './mechanicsGL.js';

async function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');
    const gravity = -9800;
    const jumpHeight = 5000;
    const absGround = 0; //-4000;
    const groundY = 0;
    const speed = 90;
    const deltaTime = 0.016; // ~60 FPS
    let loopTime = 0;
    let bullets = [];
    const bulletSpeed = 2000;
    const maxBulletDistance = 50000;
    let isShooting = false;
    const chargedBulletScale = 1;
    let fireRate = 0.5; //burst of bullets per second
    let lastShotTime = 0; 
    let shootingF = 0;

    if (!gl) {
        console.error('WebGL not supported!');
        return;
    }

    const worldObjects = await loadWorldObjects(gl);
    const railPath = await getRailPath();
    const vertexShaderSrc = document.getElementById(    'vertex-shader').text;
    const vertexTexSrc    = document.getElementById(    'vertex-texture').text;
    const vertexGunSrc    = document.getElementById(    'vertex-gun').text;
    const fragmentBPDSrc  = document.getElementById( 'fragment-bpd').text;
    const fragmentGunSrc = document.getElementById('fragment-gun').text;
    const fragmentTexSrc  = document.getElementById( 'fragment-texture').text;

    const vertexShader = createShader(gl,   gl.VERTEX_SHADER, vertexShaderSrc);
    const vertexTex = createShader(gl,   gl.VERTEX_SHADER, vertexTexSrc);
    const vertexGun = createShader(gl,   gl.VERTEX_SHADER, vertexGunSrc);
    const fSBPD        = createShader(gl, gl.FRAGMENT_SHADER, fragmentBPDSrc);
    const fSGun  = createShader(gl, gl.FRAGMENT_SHADER, fragmentGunSrc);
    const fSTex        = createShader(gl, gl.FRAGMENT_SHADER, fragmentTexSrc);
    
    const program1 = createProgram(gl, vertexShader, fSBPD);
    const program2 = createProgram(gl, vertexShader, fSBPD);
    const program3 = createProgram(gl,    vertexTex, fSTex);
    const program4 = createProgram(gl,    vertexGun, fSGun);

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
        fov: (65 * Math.PI) / 180,
        aspect: canvas.width / canvas.height,
        near: 0.1,
        far: 70000,
    };

    const keysPressed = {};
    const yawPitch = { yaw: 0, pitch: 0 };
    const mouseSensitivity = 0.002;
    const pitchLimit = Math.PI / 3 - 0.01;

    const fovSlider = document.getElementById('fovSlider');
    if (fovSlider) {
        fovSlider.addEventListener('input', (event) => {
            const fovValue = event.target.value;
            projection.fov = (fovValue * Math.PI) / 180; 
        });
    }

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

    const rateOfFireSlider = document.getElementById('rateOfFireSlider');
    const rateOfFireValueDisplay = document.getElementById('rateOfFireValue');
    

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) { 
            isShooting = true;
        }
    });
    canvas.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            isShooting = false;
        }
    });

    function updateCameraTarget() {
        const forward = vec3.fromValues(Math.sin(yawPitch.yaw), -Math.sin(yawPitch.pitch), -Math.cos(yawPitch.yaw));
        vec3.normalize(forward, forward);
        vec3.add(camera.target, [ego.x, ego.y, ego.z], forward);
    }

    function getCooldownPercentage() {
        return Math.min(1, (loopTime - lastShotTime) / fireRate);
    }

    function updateCooldownBar() {
        const cooldownBar = document.getElementById('cooldownBar');
        if (cooldownBar) {
            const percentage = getCooldownPercentage() * 100;
            cooldownBar.style.width = `${percentage}%`;
        }
    }

    function renderLoop() {
        if (rateOfFireSlider && rateOfFireValueDisplay) {
            rateOfFireSlider.addEventListener('input', (event) => {
                fireRate = parseFloat(event.target.value); 
                rateOfFireValueDisplay.textContent = fireRate.toFixed(2); 
                console.log("Fire Rate Updated:", fireRate); 
            });
        } else {
            console.error("Rate of Fire slider or display not found in DOM!");
        }

        if (isShooting && (loopTime - lastShotTime) >= fireRate) {
            shoot(false, ego, bullets, worldObjects.bullet, yawPitch, chargedBulletScale);
            lastShotTime = loopTime;
            shootingF = 1;
        } else{
            shootingF = 0;
        }
        shootingF = shootingF * isShooting;

        updateMovement(ego, gravity, keysPressed, yawPitch.yaw, speed, deltaTime, groundY, absGround);
        updateBullets(bullets, deltaTime, bulletSpeed, maxBulletDistance, ego);
        camera.position[0] = ego.x;
        camera.position[1] = ego.y;
        camera.position[2] = ego.z;

        loopTime += deltaTime;
        updateCameraTarget();
        renderScene(gl, program1, program2, program3, worldObjects, camera, yawPitch, projection, railPath, loopTime, groundTexture, woodTexture, objTexture, nGroundTex, nWoodTex, nObjTex, bullets, fireRate, shootingF);
        
        updateCooldownBar();
        
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

main();
