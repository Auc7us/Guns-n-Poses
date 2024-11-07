// renderUtils.js

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

export function drawObj(projectedPoints, objColor = '#FF33A6', canvas, fillShape = false, lineWidth = 2, dy) {
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

    if (fillShape) {
        context.lineTo(flippedPoints[0].x, flippedPoints[0].y);
        if (objColor === 'ground') {objColor = dy - 2000 <= 0 ? '#909090' : '#202020';}
        context.fillStyle = objColor;
        context.fill();
    } else {
        context.strokeStyle = objColor;
        context.lineWidth = lineWidth;
        context.stroke();
    }
}

export function drawHermiteCurve(segment, segments = 100, ego, fovSlider, canvas, pitch, yaw, context, thickness = '10', color = '#202020') {
    context.beginPath();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const hermitePoint = segment.getInterpolatedPoint(t);
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