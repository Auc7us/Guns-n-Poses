// render.js

import { calculateDistance, translateObj, rotateObj, hermiteDerivative, hermiteInterpolation} from './utils.js';
let platformPositionT = 0;
const platformSpeed = 0.005;
let platformDirection = 1;

export function drawAimPoint(canvas, color = 'white', size = 20, lineWidth = 0.5) {
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get canvas context!');
        return;
    }
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.fillStyle = color;

    context.beginPath();
    context.arc(centerX, centerY, size * 0.03, 0, 2 * Math.PI);
    context.stroke();

    context.beginPath();
    context.moveTo(centerX, centerY - size);
    context.lineTo(centerX, centerY - size / 2);
    context.stroke();

    const angle1 = (150 * Math.PI) / 180;
    const x1 = centerX + size * Math.cos(angle1);
    const y1 = centerY + size * Math.sin(angle1);
    const x1Inner = centerX + (size / 2) * Math.cos(angle1);
    const y1Inner = centerY + (size / 2) * Math.sin(angle1);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x1Inner, y1Inner);
    context.stroke();

    const angle2 = (30 * Math.PI) / 180;
    const x2 = centerX + size * Math.cos(angle2);
    const y2 = centerY + size * Math.sin(angle2);
    const x2Inner = centerX + (size / 2) * Math.cos(angle2);
    const y2Inner = centerY + (size / 2) * Math.sin(angle2);
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2Inner, y2Inner);
    context.stroke();
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

export function drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, startZ, endZ, xOff) {
    const segmentSize = 1000; 
    // const startZ = 0;
    // const endZ = -19000;

    for (let z = startZ; z >= endZ; z -= segmentSize) {
        const translatedBase = translateObj(base, xOff, 0, z);
        const translatedGrid = translateObj(grid, xOff, 0, z);
        const projectedBase = translatedBase.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        
        if (projectedBase.length > 0 && projectedGrid.length > 0) {
            drawWarpedBase(dy, projectedBase, projectedGrid, canvas);
        }
    }
}

export function drawFloatingPlatform(obj, grid, ego, canvas, fovSlider, pitch, yaw, dy, platformData) {
    const { position, tangent } = platformData;
    const xOff = position.x;
    const zOff = position.z;
    const angle = -1*Math.atan2(tangent.z, tangent.x);
   
    const rotatedBase = rotateObj(obj, angle, [0, 1, 0]); 
    const rotatedGrid = rotateObj(grid, angle, [0, 1, 0]);
    const translatedBase = translateObj(rotatedBase, xOff, 0,  zOff);
    const translatedGrid = translateObj(rotatedGrid, xOff, 0,  zOff);
    const projectedBase = translatedBase.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    
    if (projectedBase.length > 0 && projectedGrid.length > 0) {
        drawWarpedBase(dy, projectedBase, projectedGrid, canvas, '#5C4033');
    }
}


export function updateFloatingPlatformPosition(P0, P1, T0, T1, P_0, P_1, T_0, T_1) {
    platformPositionT += platformSpeed * platformDirection;
    
    if (platformPositionT > 2) {
        platformPositionT = 2;
        platformDirection = -1;
    }
    else if (platformPositionT < 0) {
        platformPositionT = 0;
        platformDirection = 1; 
    }

    let newPosition, tangent;

    if (platformPositionT <= 1) {
        const t = platformPositionT; 
        newPosition = hermiteInterpolation(t, P0, P1, T0, T1);
        tangent = hermiteDerivative(t, P0, P1, T0, T1);
    } 
    else {
        const t = platformPositionT - 1; 
        newPosition = hermiteInterpolation(t, P_0, P_1, T_0, T_1);
        tangent = hermiteDerivative(t, P_0, P_1, T_0, T_1);
    }

    return { position: newPosition, tangent: tangent };
}



export function drawWarpedBase(dy, projectedBase, projectedGrid, canvas, baseColor = 'black') {
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
    if (baseColor == 'black') {baseColor = dy - 2000 <= 0 ? '#909090' : '#202020';}
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

export function drawObj(projectedPoints, objColor, canvas, closeShape = true, fillShape = false, lineWidth = 2) {
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
        context.lineWidth = lineWidth;
        context.stroke();
    }
}

// export function drawStraightPath(startPoint, endPoint, canvas, fovSlider, ego, pitch, yaw) {
//     const projectedStart = projectPoint(startPoint, ego, fovSlider, canvas, pitch, yaw);
//     const projectedEnd = projectPoint(endPoint, ego, fovSlider, canvas, pitch, yaw);

//     if (!projectedStart || !projectedEnd) return;

//     const context = canvas.getContext('2d');
//     context.strokeStyle = 'white';
//     context.lineWidth = 3;

//     context.beginPath();
//     context.moveTo(projectedStart.x, canvas.height - projectedStart.y);
//     context.lineTo(projectedEnd.x, canvas.height - projectedEnd.y);
//     context.stroke();
// }

export function drawHermiteCurve(P0, P1, T0, T1, segments, ego, fovSlider, canvas, pitch, yaw, context, thickness = '10', color = '#202020') {

    context.beginPath();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const hermitePoint = hermiteInterpolation(t, P0, P1, T0, T1);
        const projectedPoint = projectPoint(
            { x: hermitePoint.x, y: hermitePoint.y, z: hermitePoint.z },
            ego,
            fovSlider,
            canvas,
            pitch,
            yaw
        );

        if (!projectedPoint) continue;
        const screenX = projectedPoint.x;
        const screenY = canvas.height - projectedPoint.y;
        if (i === 0) {
            context.moveTo(screenX, screenY);
        } else {
            context.lineTo(screenX, screenY);
        }
    }

    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.stroke();
}

export function renderScene(canvas, fovSlider, base, grid, cube, bullets, gun, ego, pitch, yaw, dy, keysPressed, platform, platform_grid) {
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

    const P0 = { x:  2000, y: 2000, z: -20000};
    const P1 = { x: 10000, y: 2000, z: -28000};
    const T0 = { x:     0, y:    0, z: -16000}; 
    const T1 = { x: 16000, y:    0, z:      0};

    const P_0 = { x: 10000, y: 2000, z: -28000};
    const P_1 = { x: 20000, y: 2000, z: -38000};
    const T_1 = { x:     0, y:    0, z: -20000}; 
    const T_0 = { x: 20000, y:    0, z:      0};

    
    const P00 = { x:     0, y: 2000, z: -20000}; //Left Rail
    const P10 = { x: 10000, y: 2000, z: -30000};
    const T00 = { x:     0, y:    0, z: -20000}; 
    const T10 = { x: 20000, y:    0, z:      0};

    const P_00 = { x: 10000, y: 2000, z: -30000}; //Left_Rail
    const P_10 = { x: 18000, y: 2000, z: -38000};
    const T_10 = { x:     0, y:    0, z: -16000}; 
    const T_00 = { x: 16000, y:    0, z:      0};


    const P01 = { x:  4000, y: 2000, z: -20000}; //Right Rail
    const P11 = { x:  10000, y: 2000, z:-26000};
    const T01 = { x:     0, y:    0, z: -12000}; 
    const T11 = { x: 12000, y:    0, z:      0}; 

    const P_01 = { x:  10000, y: 2000, z: -26000}; //Right_Rail
    const P_11 = { x:  22000, y: 2000, z: -38000};
    const T_11 = { x:     0, y:    0, z: -24000}; 
    const T_01 = { x: 24000, y:    0, z:      0}; 

    const segments = 100;

    context.save();
    drawHermiteCurve(P00, P10, T00, T10, segments, ego, fovSlider, canvas, pitch, yaw, context);
    drawHermiteCurve(P01, P11, T01, T11, segments, ego, fovSlider, canvas, pitch, yaw, context);
    drawHermiteCurve(P_00, P_10, T_00, T_10, segments, ego, fovSlider, canvas, pitch, yaw, context);
    drawHermiteCurve(P_01, P_11, T_01, T_11, segments, ego, fovSlider, canvas, pitch, yaw, context);
    context.restore();
    const platformInfo = updateFloatingPlatformPosition(P0, P1, T0, T1, P_0, P_1, T_0, T_1);
    drawFloatingPlatform(platform, platform_grid, ego, canvas, fovSlider, pitch, yaw, dy, platformInfo);
    
    if (keysPressed['r']) {
        drawHermiteCurve(P0, P1, T0, T1, segments, ego, fovSlider, canvas, pitch, yaw, context, '4', 'pink'); // Main curve 1
        drawHermiteCurve(P_0, P_1, T_0, T_1, segments, ego, fovSlider, canvas, pitch, yaw, context, '4', 'yellow'); // Main curve 2
    }

    const translatedCube2 = translateObj(cube, 18000, -2000, -53000);
    const projectedCube2 = translatedCube2.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    drawObj(projectedCube2, "cyan", canvas, false, false, 1);
    
    const translatedCube1 = translateObj(cube, 0, -2000, 0);
    const projectedCube1 = translatedCube1.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    drawObj(projectedCube1, "red", canvas, false);
    
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
        const projectedBullet = translatedBullet.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
        if (projectedBullet.length > 0) {
            drawObj(projectedBullet, "white", canvas, true);
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

    const projectedGun = transformedGun.map(corner => projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    drawObj(projectedGun, "green", canvas, false, false);

    drawAimPoint(canvas);
}
