export function updateMovement(ego, keysPressed, yaw, pitch, speed, deltaTime, groundY, absGround) {
    const pace = keysPressed['shift'] ? speed * 1.5 : speed;

    // Calculate forward (W/S) and strafe (A/D) directions
    const forwardVector = {
        x: Math.sin(yaw),
        z: -Math.cos(yaw),
    };
    const strafeVector = {
        x: Math.cos(yaw),
        z: Math.sin(yaw),
    };

    // Movement logic
    if (keysPressed['w']) {
        ego.x += forwardVector.x * pace;
        ego.z += forwardVector.z * pace;
    }
    if (keysPressed['s']) {
        ego.x -= forwardVector.x * pace;
        ego.z -= forwardVector.z * pace;
    }
    if (keysPressed['d']) {
        ego.x += strafeVector.x * pace;
        ego.z += strafeVector.z * pace;
    }
    if (keysPressed['a']) {
        ego.x -= strafeVector.x * pace;
        ego.z -= strafeVector.z * pace;
    }

    // Ground collision detection
    if (ego.z < 0) {
        groundY = getHeightAtPosition(ego.x, ego.z, ego.y + 1900, absGround);

        if (!isNaN(groundY) && ego.y + 1900 > groundY) {
            // Land on the ground
            ego.y = groundY - 1900;
            ego.velocityY = 0; // Reset velocity
            ego.isJumping = false;
            ego.isFreeFalling = false;
            ego.onGround = true;
        }
    }

    // Check if player is above ground
    if (groundY - (ego.y + 1900) > 0) {
        ego.onGround = false;
        if (!ego.isJumping) ego.isFreeFalling = true;
    } else {
        ego.onGround = true;
        ego.isFreeFalling = false;
    }

    // Handle vertical movement (jump or free fall)
    if (ego.isJumping) {
        jump(ego, -9800, deltaTime); // Gravity is negative
    } else if (ego.isFreeFalling) {
        freeFall(ego, -9800, groundY, deltaTime);
    }
}

export function initiateJump(ego, jumpHeight, gravity) {
    if (ego.isJumping || ego.isFreeFalling) return; // Prevent multiple jumps
    ego.isJumping = true;
    ego.isFreeFalling = false;
    ego.velocityY = Math.sqrt(-2 * gravity * jumpHeight); // Initial upward velocity
}

export function jump(ego, gravity, deltaTime) {
    if (!ego.isFreeFalling) {
        ego.velocityY += gravity * deltaTime; // Gravity reduces upward velocity
        ego.y += ego.velocityY * deltaTime; // Move up or down based on velocity
        if (ego.velocityY <= 0) {
            // Transition to free fall when upward velocity stops
            ego.isJumping = false;
            ego.isFreeFalling = true;
        }
    }
}

export function freeFall(ego, gravity, groundY, deltaTime) {
    if (!ego.onGround) {
        ego.velocityY += gravity * deltaTime; // Gravity accelerates downward velocity
        ego.y += ego.velocityY * deltaTime; // Move down
    } else {
        // Stop falling when hitting the ground
        ego.y = groundY - 1900;
        ego.velocityY = 0;
    }
}

export function getHeightAtPosition(x, z, playerFeetY, absGround) {
    // Placeholder function for ground height detection
    // Replace this with your collision/ground detection logic
    return absGround; // Default ground height
}
