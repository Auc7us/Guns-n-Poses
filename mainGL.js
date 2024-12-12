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
    const bulletSpeed = 5000;
    const maxBulletDistance = 50000;
    let mouseClicked = false;
    const chargedBulletScale = 1;
    let fireRate = 0.25; //burst of bullets per second
    let lastBulletFiredTime = 0; 
    let shootingF = 0;
    let prevIsShooting = 0;
    let wpnUseStartTime = 0;
    let coolDownStartTime = 0;
    let mouseDownF = 0;
    let cooldownPercentage = 0;

    if (!gl) {
        console.error('WebGL not supported!');
        return;
    }

    const worldObjects = await loadWorldObjects(gl);
    const railPath = await getRailPath();
    const vertexShaderSrc = document.getElementById(    'vertex-shader').text;
    const vertexTexSrc    = document.getElementById(   'vertex-texture').text;
    const fragmentBPDSrc  = document.getElementById(     'fragment-bpd').text;
    const fragmentTexSrc  = document.getElementById( 'fragment-texture').text;

    const vertexShader = createShader(gl,   gl.VERTEX_SHADER, vertexShaderSrc);
    const vertexTex = createShader(gl,   gl.VERTEX_SHADER, vertexTexSrc);
    const fSBPD        = createShader(gl, gl.FRAGMENT_SHADER, fragmentBPDSrc);
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
            mouseClicked = true;
            mouseDownF = 1;
        }
    });
    canvas.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            mouseClicked = false;
            mouseDownF = 0;
        }
    });

    function updateCameraTarget() {
        const forward = vec3.fromValues(Math.sin(yawPitch.yaw), -Math.sin(yawPitch.pitch), -Math.cos(yawPitch.yaw));
        vec3.normalize(forward, forward);
        vec3.add(camera.target, [ego.x, ego.y, ego.z], forward);
    }

    function getCooldownPercentage() {
        if(shootingF)return Math.min(1,(loopTime - wpnUseStartTime) / 4);
        else   return Math.min(1, 1 - ((loopTime - coolDownStartTime) / 2));
    }

    function updateCooldownBar(cooldownPercentage) {
        const cooldownBar = document.getElementById('cooldownBar');
        cooldownPercentage = cooldownPercentage * 100;
        console.log(cooldownPercentage);
        if (cooldownBar) {
            cooldownBar.style.width = `${cooldownPercentage}%`;
        }
    }

    function renderLoop() {

        if (loopTime > 2 && loopTime - coolDownStartTime < 2 ){
            mouseClicked = false;
            cooldownPercentage =  Math.min(1, 1 - ((loopTime - coolDownStartTime) / 2));
        }

        if (mouseClicked && (loopTime - lastBulletFiredTime) >= fireRate) {
            if (prevIsShooting == 0){
                wpnUseStartTime = loopTime;
            }
            if ((loopTime - wpnUseStartTime) < 5){
                fireRate = 0.4/(loopTime - wpnUseStartTime+0.5);
                console.log(fireRate);
                shoot(false, ego, bullets, yawPitch, fireRate, loopTime);
                lastBulletFiredTime = loopTime;
                shootingF = 1;
                cooldownPercentage = Math.min(1,(loopTime - wpnUseStartTime) / 4);

            } else {
                coolDownStartTime = loopTime;
            }
            
        } else{
            shootingF = 0;
        }
        if (!mouseDownF && (loopTime - wpnUseStartTime) < 5){
            cooldownPercentage = 0;
        }

        prevIsShooting = mouseClicked;
        // console.log(loopTime - coolDownStartTime, wpnUseStartTime);
        updateMovement(ego, gravity, keysPressed, yawPitch.yaw, speed, deltaTime, groundY, absGround);
        updateBullets(bullets, bulletSpeed, maxBulletDistance, ego);
        camera.position[0] = ego.x;
        camera.position[1] = ego.y;
        camera.position[2] = ego.z;

        loopTime += deltaTime;
        updateCameraTarget();
        renderScene(gl, program1, program2, program3, worldObjects, camera, yawPitch, projection, railPath, loopTime, groundTexture, woodTexture, objTexture, nGroundTex, nWoodTex, nObjTex, bullets, fireRate, mouseClicked, mouseDownF);
        
        updateCooldownBar(cooldownPercentage);
        
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

main();
