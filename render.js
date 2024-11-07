// render.js
// Contains  functions for Game World Creation and Rendering

import { calculateDistance} from './utils.js';
import {updateFloatingPlatformPosition, getHeightAtPosition} from './groundMechanics.js';
import * as renderUtils from './renderUtils.js';
import { drawGroundSegments, drawFloatingPlatform, placeObj} from './levelBuilder.js';

export function renderScene(canvas, fovSlider, base, grid, cube, bullets, gun, ego, pitch, yaw, dy, keysPressed, platform, platform_grid, playerHitbox, mainCurveSegments, leftRailSegments, rightRailSegments) {
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get canvas context!');
        return;
    }

    if (ego.z < 0) {
        const groundY = getHeightAtPosition(ego.x, ego.z, ego.y+1900);

        console.log(`Player at (${ego.x}, ${ego.z}) - Ground Height: ${groundY}`);

        if (isNaN(groundY)) {
            console.log("No ground detected below the player!");
        } else {
            // Adjust `ego.y` based on groundY, considering the feet offset
            ego.y = groundY - 1900;
        }
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cam2scrn = calculateDistance(fovSlider.value);

    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, 0 ,-19000, 0);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, 0 ,-19000, -4000, 0, {angle: 0, axis:[0, 0, 0]});
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
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, -15000, -19000,  4000,      0); 
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,      0,  -2000,  4000,      0);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,  -5000,  -5900,  4000,   1000, {angle: 3.14/2, axis:[1, 0, 0]});
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,  -3000,  -5000,  4000,  -1000);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,  -8000,  -8900,  4000,      0, {angle: 3.14/2, axis:[1, 0, 0]});
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,  -6000,  -8000,  4000,  -2000);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, -12000, -14000,  4000,  -4000);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, -14000, -14900,  4000,  -2000, {angle: 3.14/2, axis:[1, 0, 0]});
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy,  -9000, -11000,  4000,  -3000);
    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, -11000, -11900,  4000,  -1000, {angle: 3.14/2, axis:[1, 0, 0]});

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
