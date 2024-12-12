//mechanicsGL.js

export function updateMovement(ego, gravity, keysPressed, yaw, speed, deltaTime, groundY, absGround) {
    const pace = keysPressed['shift'] ? speed * 1.5 : speed;

    const forwardVector = {
        x: Math.sin(yaw),
        z: -Math.cos(yaw),
    };
    const strafeVector = {
        x: Math.cos(yaw),
        z: Math.sin(yaw),
    };

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

    const playerFeetY = ego.y - 1900;

    // Ground collision detection
    if (ego.z < 0) {
        groundY = getHeightAtPosition(ego.x, ego.z, playerFeetY, absGround);
        // groundY = 0;
        // console.log(groundY);
        if (!isNaN(groundY) && playerFeetY < groundY) {
            // Land on the ground
            ego.y = groundY + 1900; // snap him to ground
            ego.velocityY = 0; // Reset velocity
            ego.isJumping = false;
            ego.isFreeFalling = false;
            ego.onGround = true;
        }
    }

    // Check if player is above ground
    if ( playerFeetY > groundY) {
        ego.onGround = false;
        if (!ego.isJumping) ego.isFreeFalling = true;
    } else {
        ego.onGround = true;
        ego.isFreeFalling = false;
    }

    // Handle vertical movement (jump or free fall)
    if (ego.isJumping) {
        jump(ego, gravity, deltaTime); // Gravity is negative
    } else if (ego.isFreeFalling) {
        freeFall(ego, gravity, groundY, deltaTime);
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
        ego.velocityY += gravity * deltaTime;
        ego.y += ego.velocityY * deltaTime;
        if (ego.velocityY <= 0) {
            ego.isJumping = false;
            ego.isFreeFalling = true;
        }
    }
}

export function freeFall(ego, gravity, groundY, deltaTime) {
    if (!ego.onGround) {
        ego.velocityY += gravity * deltaTime;
        ego.y += ego.velocityY * deltaTime;
    } else {
        ego.y = groundY + 1900;
        ego.velocityY = 0;
    }
}


export function getHeightAtPosition(x, z, playerFeetY, absGround) {
    // Placeholder function for ground height detection
    // I should replace this with  collision/ground detection
    return absGround; // Default ground height currently set in mainGL
}

export function transformGunMatrix(cameraPosition, yawPitch) {
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [cameraPosition[0],cameraPosition[1], cameraPosition[2]]);
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, -yawPitch.yaw); // Yaw
    mat4.rotateX(rotationMatrix, rotationMatrix, -yawPitch.pitch); // Pitch
    mat4.multiply(modelMatrix, modelMatrix, rotationMatrix);
    mat4.translate(modelMatrix, modelMatrix, [ 120, -130, -450]);
    return modelMatrix;
}

export function shoot(isCharged, ego, bullets, yawPitch, fireRate, loopTime) {
    // const scale = isCharged ? chargedBulletScale : 1;
    const scale = 0.5;

    const gunBarrelOffset = vec3.fromValues(120, -130, -1750);// this is a bit off need to work on this
    const startPosition = vec3.fromValues(ego.x, ego.y, ego.z);

    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, -yawPitch.yaw);
    mat4.rotateX(rotationMatrix, rotationMatrix, -yawPitch.pitch);
    
    vec3.transformMat4(startPosition, gunBarrelOffset, rotationMatrix);
    vec3.add(startPosition, startPosition, [ego.x, ego.y, ego.z]);

    // const direction = vec3.fromValues( (0.005/fireRate) * Math.sin(loopTime), 0, -1); 
    const direction = vec3.fromValues( 0, 0, -1); 
    vec3.transformMat4(direction, direction, rotationMatrix);
    vec3.normalize(direction, direction);

    bullets.push({
        position: { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        direction: { x: direction[0], y: direction[1], z: direction[2] },
        scale,
        rotationMatrix: mat4.clone(rotationMatrix)
    });
}

export function updateBullets(bullets, bulletSpeed, maxDistance, ego) {
    bullets.forEach((bullet, index) => {
        bullet.position.x += bullet.direction.x * bulletSpeed;
        bullet.position.y += bullet.direction.y * bulletSpeed;
        bullet.position.z += bullet.direction.z * bulletSpeed;
        if (
            Math.abs(bullet.position.x - ego.x) > maxDistance ||
            Math.abs(bullet.position.y - ego.y) > maxDistance ||
            Math.abs(bullet.position.z - ego.z) > maxDistance
        ) {
            bullets.splice(index, 1);
        }
    });
}
