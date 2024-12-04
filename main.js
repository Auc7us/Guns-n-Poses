// main.js

import { loadWorldObjects } from './worldLoader.js';
import { renderScene } from './render.js';
import { updateMovement, shoot, initiateJump, createPlayerHitbox, resetMovement, updateBullets } from './mechanics.js';

async function world() {
    "use strict";
    const canvas = document.getElementById('canvas');    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    var slider1 = document.getElementById('slider1');
    var fovSlider = document.getElementById('fovSlider');
    
    if (!slider1 || !fovSlider) {
        console.error('Slider not found!');
        return;
    }

    slider1.value = 3;
    fovSlider.value = 65;
    let usePointer = 0;
    let yaw = 0; 
    let pitch = 0 //-0.13; 
    let dx = 2000;
    let dy = 100;
    let dz = 2500;//-16000;
    let groundY = 2000;
    const origY = dy;
    const absGround = 5000;
    var ego = { 
        x: dx, 
        y: dy, 
        z: dz, 
        velocityY: 0,        // Vertical velocity
        isJumping: false,    // Track if currently jumping
        isFreeFalling: false, // Track if currently in free fall
        onGround: true
    };    
    let mouseSensitivityConst = 0.001;
    let mouseSensitivity = 0;
    const pitchLimit = Math.PI / 3 - 0.01; 
    let chargeStartTime = 0;
    let maxChargeTime = 3000; 
    let isCharging = false;
    let chargedBulletScale = 1;
    let shootingInterval = null;

    const { base, grid, cube, bullet, gun, platform, platform_grid, mainCurveSegments, leftRailSegments, rightRailSegments } = await loadWorldObjects();
    
    let bullets = [];
    const bulletSpeed = 5000;//1500;
    // let isJumping = false;
    const jumpHeight = 5000 //4000; // gotta check if this is a realistic height for jump in mm
    const gravity = -9800 //-6000;
    const delT = 0.01667;
    let crouch = false;
    let cam2scrn = 1043;

    const playerDimensions = {
        width: 1000,  // Width of the player in mm
        height: 2000,  // Full height of the player in mm
        depth: 1000  // Depth of the player in mm
    };    

    const keysPressed = {};

    canvas.addEventListener('mousemove', (event) => {
        const deltaX = event.movementX;
        const deltaY = event.movementY;
        yaw += deltaX * mouseSensitivity;
        pitch -= deltaY * mouseSensitivity; 
        if (pitch > pitchLimit) pitch = pitchLimit;
        if (pitch < -pitchLimit) pitch = -pitchLimit;
    });

    document.addEventListener('keydown', (event) => {
        if (!event.repeat) {
            keysPressed[event.key.toLowerCase()] = true;

            if (event.key === ' ') {
                crouch = false;
                // ego.y = origY;
                initiateJump(ego, jumpHeight, gravity);
                console.log(`After initiateJump: isJumping=${ego.isJumping}, velocityY=${ego.velocityY}`);
            }
    
            if (event.key.toLowerCase() === 'c') {
                crouch = !crouch;
                ego.y = crouch ? origY + 1000 : origY;
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
        if (event.key === 'Shift') {
            keysPressed['Shift'] = false;
        }
    });
    
    function resetMovement() {
        for (let key of ['w', 'a', 's', 'd']) {
            keysPressed[key] = false;
        }
    }
    

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 2 && usePointer) {
            isCharging = true;
            chargeStartTime = Date.now();
            console.log("Charging started.");
        }

        if (event.button === 0 && usePointer) {
            if (!shootingInterval) {
                shootingInterval = setInterval(() => {
                    shoot(false, ego, bullets, bullet, yaw, pitch, chargedBulletScale);
                }, 100);
            }
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (event.button === 2 && usePointer && isCharging) {
            isCharging = false;
            const chargeDuration = Date.now() - chargeStartTime;

            if (chargeDuration >= 100) {
                chargedBulletScale = 5 + Math.min(chargeDuration / maxChargeTime, 1) * 20;
                shoot(true, ego, bullets, bullet, yaw, pitch, chargedBulletScale);
                chargedBulletScale = 1;
            }
        }

        if (event.button === 0 && usePointer) {
            clearInterval(shootingInterval);
            shootingInterval = null;
        }
    });

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            usePointer = 1;
            mouseSensitivity = parseFloat(slider1.value) * mouseSensitivityConst;
        } else {
            usePointer = 0;
            mouseSensitivity = 0;
        }
    });

    setInterval(() => {
        updateMovement(ego, keysPressed, yaw, bullets, bulletSpeed, gravity, groundY, delT, absGround);
        const playerHitbox = createPlayerHitbox(ego, playerDimensions);
        renderScene(canvas, fovSlider, base, grid, cube, bullets, gun, ego, pitch, yaw, dy, keysPressed,
             platform, platform_grid, playerHitbox, groundY, mainCurveSegments, leftRailSegments, rightRailSegments);
    }, 1000 * delT); 
}

window.onload = world;
