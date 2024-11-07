// render.js

import { calculateDistance} from './utils.js';
import {updateFloatingPlatformPosition} from './groundMechanics.js';
import * as renderUtils from './renderUtils.js';
import { drawGroundSegments, drawFloatingPlatform, placeObj} from './levelBuilder.js';

export function renderScene(canvas, fovSlider, base, grid, cube, bullets, gun, ego, pitch, yaw, dy, keysPressed, platform, platform_grid, playerHitbox, mainCurveSegments, leftRailSegments, rightRailSegments) {
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get canvas context!');
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cam2scrn = calculateDistance(fovSlider.value);

    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, 0 ,-19000, 0);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, -38000 ,-56000, 18000);
    
    const segments = 100;
    context.save();
    leftRailSegments.forEach(segment => renderUtils.drawHermiteCurve(segment, segments, ego, fovSlider, canvas, pitch, yaw, context));
    rightRailSegments.forEach(segment => renderUtils.drawHermiteCurve(segment, segments, ego, fovSlider, canvas, pitch, yaw, context));
    context.restore();
    const platformInfo = updateFloatingPlatformPosition(mainCurveSegments);
    drawFloatingPlatform(platform, platform_grid, ego, canvas, fovSlider, pitch, yaw, dy, platformInfo);

    
    if (keysPressed['v']) {
        mainCurveSegments.forEach(segment => renderUtils.drawHermiteCurve(segment, segments, ego, fovSlider, canvas, pitch, yaw, context, '4', 'yellow'));
    }

    placeObj(cube, {angle: 0, axis:[0, 1, 0]}, {x: 18000, y: -2000, z: -53000}, ego, fovSlider, canvas, pitch, yaw, "cyan", false, 1);
    placeObj(cube, {angle: 0, axis:[0, 1, 0]}, {x:     0, y: -2000, z:      0}, ego, fovSlider, canvas, pitch, yaw,  "red", false, 1);
    
    bullets.forEach((bullet) => {
        const translatedBullet = bullet.shape.map(point => {
            let transformedPoint = vec3.fromValues(point.x, point.y, point.z);
            vec3.add(transformedPoint, transformedPoint, [bullet.position.x, bullet.position.y, bullet.position.z]);
            return {
                x: transformedPoint[0],
                y: transformedPoint[1],
                z: transformedPoint[2]
            };
        });
        const projectedBullet = translatedBullet.map(corner => renderUtils.projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        if (projectedBullet.length > 0) {
            renderUtils.drawObj(projectedBullet, "white", canvas, false, 2);
        }
    });

    const transformedGun = gun.map(point => {
        let transformedPoint = vec4.fromValues(point.x, point.y, point.z, 1);
    
        let translationToPlayer = mat4.create();
        mat4.translate(translationToPlayer, translationToPlayer, [ego.x + 10, ego.y + 300, ego.z - 600]);
    
        vec4.transformMat4(transformedPoint, transformedPoint, translationToPlayer);
    
        let translateToOrigin = mat4.create();
        mat4.translate(translateToOrigin, translateToOrigin, [-ego.x, -ego.y, -ego.z]);
        vec4.transformMat4(transformedPoint, transformedPoint, translateToOrigin);
        let combinedRotationMatrix = mat4.create();
        mat4.rotateY(combinedRotationMatrix, combinedRotationMatrix, -yaw);
        mat4.rotateX(combinedRotationMatrix, combinedRotationMatrix, -pitch);
        vec4.transformMat4(transformedPoint, transformedPoint, combinedRotationMatrix);

        let translateBack = mat4.create();
        mat4.translate(translateBack, translateBack, [ego.x, ego.y, ego.z]);
        vec4.transformMat4(transformedPoint, transformedPoint, translateBack);
    
        return {
            x: transformedPoint[0],
            y: transformedPoint[1],
            z: transformedPoint[2]
        };
    });

    const projectedGun = transformedGun.map(corner => renderUtils.projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    renderUtils.drawObj(projectedGun, "green", canvas, false, 2);

    renderUtils.drawAimPoint(canvas);
}
