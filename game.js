async function loadVertices() {
    try {
        const response = await fetch('gun.json');
        if (!response.ok) {
            throw new Error("Failed to load vertices data.");
        }
        const vertices = await response.json(); // Parse JSON data
        return vertices;
    } catch (error) {
        console.error(error);
        return [];
    }
}


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
        console.error('Slider element not found!');
        return;
    }

    slider1.value = 3;
    fovSlider.value = 65;
    let usePointer = 0;
    let yaw = 0; // Initial yaw value in radians
    let pitch = -0.13; // Initial pitch value in radians
    let dx = 800;
    let dy = 100;
    let dz = 5000;
    const origY = dy;
    var ego = { x: dx, y: dy, z: dz };
    let mouseSensitivityConst = 0.001;
    let mouseSensitivity = 0;
    const pitchLimit = Math.PI / 3 - 0.01; // Limit the pitch angle to prevent flipping

    const base = [
        { x: 0, y: 2000, z: 0 },        
        { x: 4000, y: 2000, z: 0 },     
        { x: 4000, y: 2000, z: -4000 }, 
        { x: 0, y: 2000, z: -4000 }     
    ];

    const grid = [
        { x: 4000, y: 2000, z: 0 },
        { x: 3000, y: 2000, z: 0 },
        { x: 3000, y: 2000, z: -4000 },     
        { x: 2000, y: 2000, z: -4000 },
        { x: 2000, y: 2000, z: 0 },     
        { x: 1000, y: 2000, z: 0 }, 
        { x: 1000, y: 2000, z: -4000 },  
        { x: 0, y: 2000, z: -4000 },      
        { x: 0, y: 2000, z: -1000 },
        { x: 4000, y: 2000, z: -1000 },
        { x: 4000, y: 2000, z: -2000 },
        { x: 0, y: 2000, z: -2000 },
        { x: 0, y: 2000, z: -3000 },
        { x: 4000, y: 2000, z: -3000 }     
    ];

    const cube = [
        { x:   0, y:   0, z:   0 },       
        { x: 4000, y:   0, z:   0 },
        { x: 4000, y: 4000, z:   0 },
        { x:   0, y: 4000, z:   0 },
        { x:   0, y:   0, z:   0 },      
        
        { x:   0, y:   0, z: -4000 },
        { x:   0, y: 4000, z: -4000 },
        { x:   0, y: 4000, z:    0 }, 
        
        { x: 4000, y: 4000, z:    0 },
        { x: 4000, y: 4000, z: -4000 },
        { x:   0, y: 4000, z: -4000 }, 
        
        { x: 4000, y: 4000, z: -4000 },
        { x: 4000, y:   0, z: -4000 },
        { x: 4000, y:   0, z:    0 }, 

        { x: 4000, y:   0, z: -4000 },
        { x:   0, y:   0, z: -4000 },           
    ];

    const bulletTemplate = [
        { x:   0, y:   0, z:   0 },       
        { x:   9, y:   0, z:   0 },
        { x:   9, y:   9, z:   0 },
        { x:   0, y:   9, z:   0 },
        { x:   0, y:   0, z:   0 },      
        
        { x:   0, y:   0, z:  -57 },
        { x:   0, y:   9, z:  -57 },
        { x:   0, y:   9, z:   0 }, 
        
        { x:   9, y:   9, z:   0 },
        { x:   9, y:   9, z:  -57 },
        { x:   0, y:   9, z:  -57 }, 
        
        { x:   9, y:   9, z:  -57 },
        { x:   9, y:   0, z:  -57 },
        { x:   9, y:   0, z:   0 }, 

        { x:   9, y:   0, z:  -57 },
        { x:   0, y:   0, z:  -57 },           
    ];

    const gun = await loadVertices();
    // Array to store active bullets
    let bullets = [];
    // Bullet speed in mm/frame (adjustable for realistic FPS speed)
    const bulletSpeed = 150; 

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
    const jumpHeight = 300; 
    const jumpSpeed = 5;
    let crouch = false;

    let cam2scrn = 1043;

    function calculateDistance(fov) {
        const fovRadians = (fov * Math.PI) / 180; 
        return (1600 / (2 * Math.tan(fovRadians / 2))).toFixed(2);
    }

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

        cam2scrn = calculateDistance(fovSlider.value);

        function translateObj(obj, x1, y1, z1) {
            return obj.map(point => ({
                x: point.x + x1,
                y: point.y + y1,
                z: point.z + z1
            }));
        }

        function projectPoint(point, camera) {
            const cosYaw = Math.cos(-yaw);
            const sinYaw = Math.sin(-yaw);
            const cosPitch = Math.cos(-pitch);
            const sinPitch = Math.sin(-pitch);
        
            // Translate the point relative to the camera's position
            const translatedX = point.x - camera.x;
            const translatedZ = point.z - camera.z;
            const translatedY = - point.y + camera.y;
        
            // Apply yaw rotation (rotation around the vertical axis)
            const rotatedX = translatedX * cosYaw - translatedZ * sinYaw;
            const rotatedZ = translatedX * sinYaw + translatedZ * cosYaw;
        
            // Apply pitch rotation (rotation around the horizontal axis)
            const rotatedY = translatedY * cosPitch - rotatedZ * sinPitch;
            const finalZ = translatedY * sinPitch + rotatedZ * cosPitch;
        
            // Prevent projecting points that are behind the camera (negative Z)
            if (finalZ >= 0) return null;
        
            // Project the 3D point onto the 2D canvas (perspective projection)
            const xProjected = (rotatedX * cam2scrn) / -finalZ + canvas.width / 2;
            const yProjected = (rotatedY * cam2scrn) / -finalZ + canvas.height / 2;
        
            return { x: xProjected, y: yProjected };
        }

        function drawGroundSegments() {
            // Render fewer segments in front and behind based on the camera's current z-position
            const startIndex = Math.floor(ego.z / -4000) - 1; // Start one segment behind the current
            const segmentsBehind = 4; // Number of segments to render behind the screen
            const segmentsInFront = 4; // Number of segments to render in front of the screen

            for (let i = startIndex - segmentsBehind; i <= startIndex + segmentsInFront; i++) {
                if (i < 0) continue; // Skip negative indices
                const translatedBase = translateObj(base, 0, 0, -4000 * i);
                const translatedGrid = translateObj(grid, 0, 0, -4000 * i);
                const projectedBase = translatedBase.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                
                if (projectedBase.length > 0 && projectedGrid.length > 0) {
                    drawWarpedBase(projectedBase, projectedGrid);
                }
            }
        }

        function placeGunImg() {
            const imgWidth = 830; // Adjust width of the gun image
            const imgHeight = 386; // Adjust height of the gun image
            const posX = canvas.width - imgWidth - 150; // Position image on the right side
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

        const translatedCube = translateObj(cube, 0, -2000, 0);
        const projectedCube = translatedCube.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
        drawObj(projectedCube, "red", false); // Draw cube

        console.log("Rendering scene with", bullets.length, "bullets");
        bullets.forEach((bullet, index) => {
            // Translate the bullet according to its current position
            const translatedBullet = translateObj(bullet.shape, bullet.position.x, bullet.position.y, bullet.position.z);
            
            // Project the bullet points onto the 2D canvas
            const projectedBullet = translatedBullet.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
        
            // Check if bullet points are being correctly projected
            if (projectedBullet.length > 0) {
                drawObj(projectedBullet, "green", true); // Draw bullet in green color
            } else {
                console.warn("Bullet", index, "not visible or projected out of bounds.");
            }
        });

        // const translatedGun = translateObj(gun, ego.x+150, ego.y+150, ego.zd-500);
        // const translatedGun = translateObj(gun, ego.x+10, ego.y+250, ego.z-600);
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        
        const translatedGun = gun.map(point => {
            let x = point.x + 10;
            let y = point.y + 300;
            let z = point.z - 600;
    
            // Apply yaw rotation
            const rotatedX = x * cosYaw - z * sinYaw;
            const rotatedZ = x * sinYaw + z * cosYaw;
    
            // // Apply pitch rotation
            const rotatedY = y * cosPitch + rotatedZ * sinPitch;
            const finalZ = - y * sinPitch + rotatedZ * cosPitch;
    
            return {
                x: rotatedX + ego.x, 
                y: rotatedY + ego.y, 
                z: finalZ + ego.z
            };
        });
        const projectedGun = translatedGun.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
        drawObj(projectedGun, "green", false, false); // Draw cube
        // placeGuneImg(); // Draw the gun image last to keep it on top
    }

    function isConvex(triangle) {
        const crossProduct = (v1, v2, v3) => {
            return (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x);
        };
        
        const cp1 = crossProduct(triangle[0], triangle[1], triangle[2]);
        const cp2 = crossProduct(triangle[1], triangle[2], triangle[0]);
    
        // Return true if all cross products have the same sign
        return cp1 * cp2 >= 0;
    }

    function drawObj(projectedPoints, objColor, closeShape = true, fillShape = false) {
        if (projectedPoints.length < 2) return;
        
        const context = canvas.getContext('2d');
        const flippedPoints = projectedPoints.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));
        
        context.beginPath();
        context.moveTo(flippedPoints[0].x, flippedPoints[0].y);
        
        for (let i = 1; i < flippedPoints.length; i++) {
            context.lineTo(flippedPoints[i].x, flippedPoints[i].y);
        }
        
        if (closeShape) {
            context.lineTo(flippedPoints[0].x, flippedPoints[0].y);  // Close the shape if desired
        }
    
        if (fillShape) {
            context.fillStyle = objColor;
            context.fill();  // Fill the shape with color
        } else {
            context.strokeStyle = objColor;
            context.lineWidth = 2;
            context.stroke();  // Stroke the outline of the shape
        }
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
        let baseColor = dy - 2000 <= 0 ? '#909090' : '#202020';

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
                ego.y = crouch ? origY * 3 : origY; 
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
        pace = keysPressed['Shift'] ? 150 : 100;   
        
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

        // Update bullet positions
        updateBullets();

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
                jumpProgress += 0.025; // Increment the jump progress
                requestAnimationFrame(jumpAnimation);
            } else {
                ego.y = originalY; // Reset to original position after the jump
                isJumping = false; // Allow new jumps
            }
        }
        jumpAnimation();
    }

    
    function updateBullets() {
        bullets.forEach((bullet, index) => {
            // Update bullet position based on its direction and speed
            bullet.position.x += bullet.direction.x * bulletSpeed;
            bullet.position.y += bullet.direction.y * bulletSpeed;
            bullet.position.z += bullet.direction.z * bulletSpeed;
    
            // Log the current bullet position for debugging
            console.log("Bullet position:", bullet.position);
    
            // Check if the bullet is still within reasonable bounds relative to the player
            const maxDistance = 20000; // Define reasonable max distance from the player (e.g., 20 meters)
            if (
                Math.abs(bullet.position.x - ego.x) > maxDistance ||
                Math.abs(bullet.position.y - ego.y) > maxDistance ||
                Math.abs(bullet.position.z - ego.z) > maxDistance
            ) {
                console.log("Removing bullet", index, "due to out-of-bounds position.");
                bullets.splice(index, 1);
            }
        });
    }

    function shoot() {
        
        // Define bullet's starting position at the player's camera position, slightly in front of the screen
        const offsetDistance = 50; // Adjust as necessary, this moves the bullet in front of the player
        const startX = ego.x + offsetDistance * Math.cos(yaw) * Math.cos(pitch) + 150; // In front of the player along the yaw direction
        const startY = ego.y + offsetDistance * Math.sin(pitch) + 200; // Adjust based on pitch
        const startZ = ego.z + offsetDistance * Math.sin(yaw) * Math.cos(pitch); // Forward along yaw and pitch directions
        
        // Correct bullet direction based on yaw and pitch
        const direction = {
            x: Math.cos(pitch) * Math.sin(yaw),  // Movement along X based on yaw and pitch
            y: Math.sin(pitch),                  // Vertical movement based on pitch
            z: Math.cos(pitch) * Math.cos(yaw)   // Movement along Z based on yaw and pitch
        };
        
        // Normalize the direction vector to ensure consistent speed
        const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        direction.x /= magnitude;
        direction.y /= - magnitude;
        direction.z /= - magnitude;
        
        // Add the bullet to the bullets array with its starting position and direction
        bullets.push({
            shape: JSON.parse(JSON.stringify(bulletTemplate)), // Clone the bullet shape
            position: { x: startX, y: startY, z: startZ },     // Starting position
            direction: direction                               // Normalized direction vector
        });
    
        console.log("Bullet fired:", { startX, startY, startZ, direction });
    }
    
        
    
    // Listen for left-click to shoot
    canvas.addEventListener('click', (event) => {
        if (event.button === 0 && usePointer) { // Left click and pointer locked
            shoot();
        }
    });

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
