function world() {
    "use strict";
    const canvas = document.getElementById('canvas');    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    var slider4 = document.getElementById('slider4');
    if (!slider4) {
        console.error('Slider element not found!');
        return;
    }
    slider4.value = 2;

    let yaw = 0; // Initial yaw value in radians
    let dx = 512;
    let dy = 200;
    let dz = 2000;
    const origY = dy;
    var ego = { x: dx, y: dy, z: dz };
    let mouseSensitivity = parseFloat(slider4.value) * 0.001;

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
        canvas.width = canvas.width; // Clear the canvas
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
            const translatedX = point.x - camera.x;
            const translatedZ = point.z - camera.z;
            const rotatedX = translatedX * cosYaw + translatedZ * sinYaw;
            const rotatedZ = -translatedX * sinYaw + translatedZ * cosYaw;

            if (rotatedZ >= 0) return null;
            const xProjected = -(rotatedX * cam2scrn) / rotatedZ + canvas.width / 2;
            const yProjected = camera.y + ((point.y - camera.y) * cam2scrn) / rotatedZ;

            return { x: xProjected, y: yProjected };
        }

        function drawGroundSegments() {
            // Calculate the number of segments to render based on the camera's z-position
            const startIndex = Math.floor(ego.z / -1024) - 1; // Start rendering one segment before the current
            const segmentsToRender = 5; // Render five segments: two before, current, and two after

            for (let i = startIndex; i < startIndex + segmentsToRender; i++) {
                const translatedBase = translateObj(base, 0, 0, -1024 * i);
                const translatedGrid = translateObj(grid, 0, 0, -1024 * i);
                const projectedBase = translatedBase.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                
                if (projectedBase.length > 0 && projectedGrid.length > 0) {
                    drawWarpedBase(projectedBase, projectedGrid);
                }
            }
        }

        drawGroundSegments();

        const translatedCube = translateObj(cube, 362, 84, -362);
        const projectedCube = translatedCube.map(corner => projectPoint(corner, ego)).filter(point => point !== null);

        drawCube(projectedCube);
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

    canvas.addEventListener('mousemove', (event) => {
        const deltaX = event.movementX;
        yaw += deltaX * mouseSensitivity; // Update yaw based on sensitivity
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
                ego.y = crouch ? origY * 1.5 : origY; 
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
        pace = keysPressed['Shift'] ? 10 : 5;   
        
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
        if (keysPressed['w']) {
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
                jumpProgress += 0.0125; // Increment the jump progress
                requestAnimationFrame(jumpAnimation);
            } else {
                ego.y = originalY; // Reset to original position after the jump
                isJumping = false; // Allow new jumps
            }
        }
        jumpAnimation();
    }
    
    requestAnimationFrame(updateMovement); // Start the animation loop
    
    slider4.addEventListener("input", () => {
        mouseSensitivity = parseFloat(slider4.value) * 0.001; 
    });

    renderScene(); 
}

window.onload = world;
