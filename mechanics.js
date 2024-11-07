// player mechanics.js
// Contains Player Movement, Gun and Bullet mechanics

export function updateMovement(ego, keysPressed, yaw, bullets, bulletSpeed, gravity, groundY, deltaTime) {
    const pace = keysPressed['shift'] ? 133 : 90;

    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);

    if (keysPressed['d']) {
        ego.x += pace * cosYaw; 
        ego.z += pace * sinYaw;
    }
    if (keysPressed['a']) {
        ego.x -= pace * cosYaw; 
        ego.z -= pace * sinYaw;
    }

    if (keysPressed['w']) {
        ego.x += pace * sinYaw; 
        ego.z -= pace * cosYaw;
    }
    if (keysPressed['s']) {
        ego.x -= pace * sinYaw; 
        ego.z += pace * cosYaw;
    }

    if (ego.isJumping) {
        ego.velocityY += gravity * deltaTime; // Apply gravity to vertical velocity
        ego.y -= ego.velocityY * deltaTime;   // Update the player's Y position

        // Check if player has landed
        if (ego.y >= groundY) {
            ego.y = groundY;         // Reset y position to ground level
            ego.isJumping = false;   // End the jump
            ego.velocityY = 0;       // Reset vertical velocity
        }
    }

    updateBullets(bullets, ego, bulletSpeed);
}

export function updateBullets(bullets, ego, bulletSpeed) {
    bullets.forEach((bullet, index) => {
        bullet.position.x += bullet.direction.x * bulletSpeed;
        bullet.position.y += bullet.direction.y * bulletSpeed;
        bullet.position.z += bullet.direction.z * bulletSpeed;

        const maxDistance = 50000;
        if (
            Math.abs(bullet.position.x - ego.x) > maxDistance ||
            Math.abs(bullet.position.y - ego.y) > maxDistance ||
            Math.abs(bullet.position.z - ego.z) > maxDistance
        ) {
            bullets.splice(index, 1);
        }
    });
}

export function resetMovement() {
    pace = 0;
}

export function initiateJump(isJumping, ego, jumpHeight, gravity) {
    if (isJumping) return; // Ensure no double-jumping occurs
    isJumping = true;

    // Set initial upward velocity for the jump
    ego.velocityY = Math.sqrt(-2 * gravity * jumpHeight); 
    ego.isJumping = true;  // Mark player as jumping
}

export function shoot(isCharged, ego, bullets, bullet, yaw, pitch, chargedBulletScale) {
    const scale = isCharged ? chargedBulletScale : 1;
    const gunBarrelOffset = vec3.fromValues(300, 320, 0);
    const startPosition = vec3.create();

    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, -yaw);
    mat4.rotateX(rotationMatrix, rotationMatrix, -pitch);
    vec3.transformMat4(startPosition, gunBarrelOffset, rotationMatrix);
    vec3.add(startPosition, startPosition, [ego.x, ego.y, ego.z]);

    const direction = vec3.fromValues(0, 0, -1);
    vec3.transformMat4(direction, direction, rotationMatrix);
    vec3.normalize(direction, direction);

    const scaledBulletShape = bullet.map(point => ({
        x: point.x * scale,
        y: point.y * scale,
        z: point.z * scale
    }));

    bullets.push({
        shape: JSON.parse(JSON.stringify(scaledBulletShape)),
        position: { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        direction: { x: direction[0], y: direction[1], z: direction[2] }
    });
}

export function createPlayerHitbox(ego, dimensions) {
    return {
        min: {
            x: ego.x - dimensions.width / 2,
            y: ego.y + dimensions.height - 100,
            z: ego.z - dimensions.depth / 2,
        },
        max: {
            x: ego.x + dimensions.width / 2,
            y: ego.y - 300,
            z: ego.z + dimensions.depth / 2,
        }
    };
}