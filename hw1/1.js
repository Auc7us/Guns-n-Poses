function world() {
    "use strict";
    const canvas = document.getElementById('canvas');    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    var slider1 = document.getElementById('slider1');
    if (!slider1) {
        console.error('Slider element not found!');
        return;
    }
    slider1.value = 3;
    let usePointer = 0;
    let yaw = 0; // Initial yaw value in radians
    let pitch = -0.13; // Initial pitch value in radians
    let dx = 512;
    let dy = 100;
    let dz = 2000;
    const origY = dy;
    var ego = { x: dx, y: dy, z: dz };
    let mouseSensitivityConst = 0.001;
    let mouseSensitivity = 0;
    const pitchLimit = Math.PI / 3 - 0.01; // Limit the pitch angle to prevent flipping

    const base = [
        { x: 0, y: 384, z: 0 },        
        { x: 1024, y: 384, z: 0 },     
        { x: 1024, y: 384, z: -1024 }, 
        { x: 0, y: 384, z: -1024 }     
    ];

    const grid = [
        { x: 1024, y: 384, z: 0 },
        { x: 768, y: 384, z: 0 },
        { x: 768, y: 384, z: -1024 },     
        { x: 512, y: 384, z: -1024 },
        { x: 512, y: 384, z: 0 },     
        { x: 256, y: 384, z: 0 }, 
        { x: 256, y: 384, z: -1024 },  
        { x: 0, y: 384, z: -1024 },      
        { x: 0, y: 384, z: -256 },
        { x: 1024, y: 384, z: -256 },
        { x: 1024, y: 384, z: -512 },
        { x: 0, y: 384, z: -512 },
        { x: 0, y: 384, z: -768 },
        { x: 1024, y: 384, z: -768 }     
    ];

    const cube = [
        { x:   0, y:   0, z:   0 },       
        { x: 300, y:   0, z:   0 },
        { x: 300, y: 300, z:   0 },
        { x:   0, y: 300, z:   0 },
        { x:   0, y:   0, z:   0 },      
        
        { x:   0, y:   0, z: -300 },
        { x:   0, y: 300, z: -300 },
        { x:   0, y: 300, z:    0 }, 
        
        { x: 300, y: 300, z:    0 },
        { x: 300, y: 300, z: -300 },
        { x:   0, y: 300, z: -300 }, 
        
        { x: 300, y: 300, z: -300 },
        { x: 300, y:   0, z: -300 },
        { x: 300, y:   0, z:    0 }, 

        { x: 300, y:   0, z: -300 },
        { x:   0, y:   0, z: -300 },           
    ];

    // Load the gun image
    const gunImage = new Image();
    gunImage.src = 'gun.png'; // Ensure this path is correct
    let gunImageLoaded = false;

    gunImage.onload = () => {
        gunImageLoaded = true;
        console.log("Gun image loaded successfully."); // Debug message
    };

    gunImage.onerror = () => {
        console.error("Failed to load gun image. Check the path:", gunImage.src); // Error log
    };

    let isJumping = false;
    const jumpHeight = 100; // Max height of the jump
    const jumpSpeed = 5;    // Speed of the jump
    let crouch = false;

    function renderScene() {
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Failed to get canvas context!');
            return;
        }
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const cam2scrn = 2000;

        function translateObj(obj, x1, y1, z1) {
            return obj.map(point => ({
                x: point.x + x1,
                y: point.y + y1,
                z: point.z + z1
            }));
        }

        function projectPoint(point, camera) {
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);

            const translatedX = point.x - camera.x;
            const translatedZ = point.z - camera.z;
            const translatedY = point.y - camera.y;

            // Rotate point based on yaw (left-right rotation)
            const rotatedX = translatedX * cosYaw + translatedZ * sinYaw;
            const rotatedZ = -translatedX * sinYaw + translatedZ * cosYaw;

            // Rotate point based on pitch (up-down rotation)
            const rotatedY = translatedY * cosPitch - rotatedZ * sinPitch;
            const finalZ = rotatedY * sinPitch + rotatedZ * cosPitch;

            if (finalZ >= 0) return null;
            const xProjected = -(rotatedX * cam2scrn) / finalZ + canvas.width / 2;
            const yProjected = camera.y + ((rotatedY - camera.y) * cam2scrn) / finalZ;

            return { x: xProjected, y: yProjected };
        }

        function drawGroundSegments() {
            // Render fewer segments in front and behind based on the camera's current z-position
            const startIndex = Math.floor(ego.z / -1024) - 1; // Start one segment behind the current
            const segmentsBehind = 4; // Number of segments to render behind the screen
            const segmentsInFront = 4; // Number of segments to render in front of the screen

            for (let i = startIndex - segmentsBehind; i <= startIndex + segmentsInFront; i++) {
                if (i < 0) continue; // Skip negative indices
                const translatedBase = translateObj(base, 0, 0, -1024 * i);
                const translatedGrid = translateObj(grid, 0, 0, -1024 * i);
                const projectedBase = translatedBase.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                
                if (projectedBase.length > 0 && projectedGrid.length > 0) {
                    drawWarpedBase(projectedBase, projectedGrid);
                }
            }
        }

        function drawGun() {
            const imgWidth = 350; // Adjust width of the gun image
            const imgHeight = 163; // Adjust height of the gun image
            const posX = canvas.width / 2 - imgWidth / 3; // Position image on the right side
            const posY = canvas.height - imgHeight; // Position image on the bottom side
            
            // Draw the image if it's loaded
            if (gunImageLoaded) {
                context.drawImage(gunImage, posX, posY, imgWidth, imgHeight);
                console.log("Drawing gun image at:", posX, posY); // Debug message
            } else {
                console.warn("Gun image not loaded yet."); // Warning message
            }
        }
        
        drawGroundSegments();

        const translatedCube = translateObj(cube, 362, 84, -362);
        const projectedCube = translatedCube.map(corner => projectPoint(corner, ego)).filter(point => point !== null);

        drawCube(projectedCube); // Draw cube
        drawGun(); // Draw the gun image last to keep it on top
    }

    function drawCube(projectedCube) {
        if (projectedCube.length < 2) return; 
        const context = canvas.getContext('2d');
        const flippedCubeCorners = projectedCube.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));

        context.beginPath();
        context.moveTo(flippedCubeCorners[0].x, flippedCubeCorners[0].y);
        flippedCubeCorners.forEach((point, index) => {
            if (index > 0) {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath(); 
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.stroke();
    }

    function drawWarpedBase(projectedBase, projectedGrid) {
        if (projectedBase.length < 2 || projectedGrid.length < 2) return;

        const context = canvas.getContext('2d');
        const flippedBaseCorners = projectedBase.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));

        const flippedGridCorners = projectedGrid.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));

        context.beginPath();
        context.moveTo(flippedBaseCorners[0].x, flippedBaseCorners[0].y);
        flippedBaseCorners.forEach((point, index) => {
            if (index > 0) {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath();
        let baseColor = dy - 384 <= 0 ? '#909090' : '#202020';

        context.fillStyle = baseColor;
        context.fill();

        context.beginPath();
        flippedGridCorners.forEach((point, index) => {
            if (index === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath();
        context.strokeStyle = 'black';
        context.stroke();
    }

    // Handle mouse movement after pointer lock is enabled
    canvas.addEventListener('mousemove', (event) => {
        const deltaX = event.movementX;
        const deltaY = event.movementY;

        yaw += deltaX * mouseSensitivity; // Update yaw based on sensitivity

        // Update pitch and clamp within limits
        pitch -= deltaY * mouseSensitivity; 
        if (pitch > pitchLimit) pitch = pitchLimit;
        if (pitch < -pitchLimit) pitch = -pitchLimit;
    });

    const keysPressed = {};
    let pace = 10; 

    document.addEventListener('keydown', (event) => {
        if (!event.repeat) {
            keysPressed[event.key] = true; 
    
            if (event.key === ' ') {
                crouch = false; // Reset crouch state if jumping
                ego.y = origY;  
                initiateJump();
            }
    
            if (event.key === 'c') { 
                crouch = !crouch;
                ego.y = crouch ? origY * 1.2 : origY; 
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false; // Immediately stop movement on key release
        resetMovement(); // Explicitly reset movement state
    });

    window.addEventListener('blur', () => {
        // Clear all keys when window loses focus
        for (let key in keysPressed) {
            keysPressed[key] = false;
        }
        resetMovement();
    });

    function resetMovement() {
        // Reset ego movement to prevent any residual movement
        pace = 0;
    }

    function updateMovement() {
        pace = keysPressed['Shift'] ? 30 : 15;   
        
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);

        // Correct movement directions based on your previous logic
        // Move right and left along the camera direction (D and A keys)
        if (keysPressed['d']) {
            ego.x += pace * cosYaw; 
            ego.z += pace * sinYaw;
        }
        if (keysPressed['a']) {
            ego.x -= pace * cosYaw; 
            ego.z -= pace * sinYaw;
        }

        // Move forward and backward perpendicular to the camera direction (W and S keys)
        if (keysPressed['w'] ) {
            ego.x += pace * sinYaw; 
            ego.z -= pace * cosYaw;
        }
        if (keysPressed['s']) {
            ego.x -= pace * sinYaw; 
            ego.z += pace * cosYaw;
        }

        renderScene(); // Sync rendering with all updates including mouse movement
        requestAnimationFrame(updateMovement); // Continuously call updateMovement
    }

    function initiateJump() {
        if (isJumping) return; // Prevent another jump while already jumping
        isJumping = true;
        let jumpProgress = 0;
        const originalY = ego.y;

        function jumpAnimation() {
            if (jumpProgress < 1) {
                ego.y = originalY - jumpHeight * Math.sin(Math.PI * jumpProgress); // Create a smooth jump arc
                jumpProgress += 0.018; // Increment the jump progress
                requestAnimationFrame(jumpAnimation);
            } else {
                ego.y = originalY; // Reset to original position after the jump
                isJumping = false; // Allow new jumps
            }
        }
        jumpAnimation();
    }
    
    requestAnimationFrame(updateMovement); // Start the animation loop

    
    // Request pointer lock on canvas click
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            console.log('Pointer locked');
            usePointer = 1;
            mouseSensitivity = parseFloat(slider1.value) * mouseSensitivityConst;
        } else {
            console.log('Pointer unlocked');
            usePointer = 0;
            mouseSensitivity = 0;
        }
    });
    

    renderScene(); 
}

window.onload = world;
