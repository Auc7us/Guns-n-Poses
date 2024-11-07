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

    // Jump or free-fall mechanics
    if (ego.isJumping) {
        console.log("Calling jump function");
        jump(ego, gravity, deltaTime);
    } else if (ego.isFreeFalling) {
        // console.log("Calling freeFall function to check if above ground");
        freeFall(ego, gravity, groundY, deltaTime);
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

export function initiateJump(ego, jumpHeight, gravity) {
    console.log(`ego is jumping? : ${ego.isJumping}`);
    if (ego.isJumping) {
        console.log("Jump initiation skipped: Already jumping or free-falling");
        return;
    };
    ego.isJumping = true;
    ego.isFreeFalling = false;
    ego.velocityY = Math.sqrt(-2 * gravity * jumpHeight);
    // console.log(`Jump initiated: velocityY=${ego.velocityY}, isJumping=${ego.isJumping}`); 
}

export function jump(ego, gravity, deltaTime) {
    if ( ego.isFreeFalling === false) {
        ego.velocityY += gravity * deltaTime; // Gravity reduces upward velocity
        ego.y -= ego.velocityY * deltaTime;   // Move up based on velocity
        // console.log(`Updated jump position: velocityY=${ego.velocityY}, ego.y=${ego.y}`);
    }
}

export function freeFall(ego, gravity, groundY, deltaTime) {
    // Continue falling if above ground
    if (ego.onGround === false) {
        ego.velocityY += gravity * deltaTime;
        ego.y -= ego.velocityY * deltaTime;
        console.log(`Updated free-fall position: velocityY=${ego.velocityY}, ego.y=${ego.y}`);
    } else { //if overshot to go below ground 
        // console.log("Already on ground");
        ego.y = groundY - 1900;      // Land on the ground
        ego.velocityY = 0;
    }
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