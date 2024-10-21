// mechanics.js

export function updateMovement(ego, keysPressed, yaw, bullets, bulletSpeed) {
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



export function initiateJump(isJumping, ego, jumpHeight, gravity, deltaTime) {
    if (isJumping) return;
    isJumping = true;
    let velocity = Math.sqrt(-2 * gravity * jumpHeight);;
    const originalY = ego.y;

    function jumpAnimation() {
        velocity += gravity * deltaTime;
        ego.y -= velocity * deltaTime;

        if (ego.y >= originalY) {
            ego.y = originalY;
            isJumping = false;
        } else {
            requestAnimationFrame(jumpAnimation);
        }
    }
    jumpAnimation();
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
