// render.js

import { calculateDistance } from './utils.js';

export function translateObj(obj, x1, y1, z1) {
    let translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, [x1, y1, z1]);
    
    return obj.map(point => {
        let translatedPoint = vec4.fromValues(point.x, point.y, point.z, 1);
        vec4.transformMat4(translatedPoint, translatedPoint, translationMatrix);
        return {
            x: translatedPoint[0],
            y: translatedPoint[1],
            z: translatedPoint[2]
        };
    });
}

export function projectPoint(point, camera, fovSlider, canvas, pitch, yaw) {
    let viewMatrix = mat4.create();

    mat4.rotateX(viewMatrix, viewMatrix, pitch);
    mat4.rotateY(viewMatrix, viewMatrix, yaw);
    mat4.translate(viewMatrix, viewMatrix, [-camera.x, -camera.y, -camera.z]);

    let projectionMatrix = mat4.create();
    let fovRadians = (fovSlider.value * Math.PI) / 180;
    let aspectRatio = canvas.width / canvas.height;
    mat4.perspective(projectionMatrix, fovRadians, aspectRatio, 0.1, 10000);

    let pointVec = vec4.fromValues(point.x, point.y, point.z, 1);
    vec4.transformMat4(pointVec, pointVec, viewMatrix);
    vec4.transformMat4(pointVec, pointVec, projectionMatrix);

    if (pointVec[3] <= 0) return null;
    let xProjected = (pointVec[0] / pointVec[3]) * canvas.width / 2 + canvas.width / 2;
    let yProjected = -(pointVec[1] / pointVec[3]) * canvas.height / 2 + canvas.height / 2;

    return { x: xProjected, y: yProjected };
}

export function drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy) {
    const startIndex = Math.floor(ego.z / -4000) - 1;
    const segmentsBehind = 4;
    const segmentsInFront = 4;

    for (let i = startIndex - segmentsBehind; i <= startIndex + segmentsInFront; i++) {
        if (i < 0) continue;
        const translatedBase = translateObj(base, 0, 0, -4000 * i);
        const translatedGrid = translateObj(grid, 0, 0, -4000 * i);
        const projectedBase = translatedBase.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        if (projectedBase.length > 0 && projectedGrid.length > 0) {
            drawWarpedBase(dy, projectedBase, projectedGrid, canvas);
        }
    }
}

export function drawWarpedBase(dy, projectedBase, projectedGrid, canvas) {
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

export function drawObj(projectedPoints, objColor, canvas, closeShape = true, fillShape = false) {
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
        context.lineTo(flippedPoints[0].x, flippedPoints[0].y);
    }

    if (fillShape) {
        context.fillStyle = objColor;
        context.fill();
    } else {
        context.strokeStyle = objColor;
        context.lineWidth = 2;
        context.stroke();
    }
}

export function renderScene(canvas, fovSlider, base, grid, cube, bullets, gun, ego, pitch, yaw, dy) {
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get canvas context!');
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cam2scrn = calculateDistance(fovSlider.value);

    drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy);

    const translatedCube = translateObj(cube, 0, -2000, 0);
    const projectedCube = translatedCube.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    drawObj(projectedCube, "red", canvas, false);

    bullets.forEach((bullet) => {
        const translatedBullet = translateObj(bullet.shape, bullet.position.x, bullet.position.y, bullet.position.z);
        const projectedBullet = translatedBullet.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        if (projectedBullet.length > 0) {
            drawObj(projectedBullet, "blue", canvas, true);
        }
    });

    const translatedGun = gun.map(point => {
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

    const projectedGun = translatedGun.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    drawObj(projectedGun, "green", canvas, false, false);
}
