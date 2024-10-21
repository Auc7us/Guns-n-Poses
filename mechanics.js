// mechanics.js

export function updateMovement(ego, keysPressed, yaw, bullets, bulletSpeed) {
    const pace = keysPressed['Shift'] ? 133 : 90;

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

    const offsetDistance = 50; 
    const startX = ego.x + offsetDistance * Math.cos(yaw) * Math.cos(pitch) + 150 ; 
    const startY = ego.y + offsetDistance * Math.sin(pitch) + 200 ; 
    const startZ = ego.z + offsetDistance * Math.sin(yaw) * Math.cos(pitch);

    const direction = {
        x: Math.cos(pitch) * Math.sin(yaw),  
        y: Math.sin(pitch),                  
        z: Math.cos(pitch) * Math.cos(yaw)   
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    direction.x /= magnitude;
    direction.y /= -magnitude;
    direction.z /= -magnitude;

    const scaledBulletShape = bullet.map(point => ({
        x: point.x * scale,
        y: point.y * scale,
        z: point.z * scale
    }));

    bullets.push({
        shape: JSON.parse(JSON.stringify(scaledBulletShape)),
        position: { x: startX, y: startY, z: startZ }, 
        direction: direction 
    });
}
