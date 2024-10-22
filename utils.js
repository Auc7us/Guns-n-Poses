// utils.js
import { projectPoint } from './render.js';

export function calculateDistance(fov) {
    const fovRadians = (fov * Math.PI) / 180;
    return (1600 / (2 * Math.tan(fovRadians / 2))).toFixed(2);
}

// No longer used since we switched to gl-matrix

export function calculateMagnitude(vector) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

export function normalizeVector(vector) {
    const magnitude = calculateMagnitude(vector);
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
        z: vector.z / magnitude
    };
}

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


// utils.js

export function drawHermiteCurve(P0, P1, T0, T1, segments, ego, fovSlider, canvas, pitch, yaw, context) {
    function hermiteInterpolation(t, P0, P1, T0, T1) {
        const h1 = 2 * t ** 3 - 3 * t ** 2 + 1;
        const h2 = t ** 3 - 2 * t ** 2 + t;
        const h3 = -2 * t ** 3 + 3 * t ** 2;
        const h4 = t ** 3 - t ** 2;

        return {
            x: h1 * P0.x + h2 * T0.x + h3 * P1.x + h4 * T1.x,
            y: h1 * P0.y + h2 * T0.y + h3 * P1.y + h4 * T1.y,
            z: h1 * P0.z + h2 * T0.z + h3 * P1.z + h4 * T1.z
        };
    }

    context.beginPath(); // Begin the path outside the loop

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Calculate the position along the Hermite curve
        const hermitePoint = hermiteInterpolation(t, P0, P1, T0, T1);

        // Project the calculated point onto the screen
        const projectedPoint = projectPoint(
            { x: hermitePoint.x, y: hermitePoint.y, z: hermitePoint.z },
            ego,
            fovSlider,
            canvas,
            pitch,
            yaw
        );

        if (!projectedPoint) continue; // Skip if the point is outside the view

        const screenX = projectedPoint.x;
        const screenY = canvas.height - projectedPoint.y;

        if (i === 0) {
            context.moveTo(screenX, screenY);
        } else {
            context.lineTo(screenX, screenY);
        }
    }

    // Draw the Hermite curve
    context.strokeStyle = "blue";
    context.lineWidth = 2;
    context.stroke();
}




// B-spline basis function
function bSplineBasis(i, k, t, knots) {
    if (k === 1) {
        return knots[i] <= t && t < knots[i + 1] ? 1.0 : 0.0;
    } else {
        const denom1 = knots[i + k - 1] - knots[i];
        const term1 = denom1 !== 0 ? ((t - knots[i]) / denom1) * bSplineBasis(i, k - 1, t, knots) : 0;

        const denom2 = knots[i + k] - knots[i + 1];
        const term2 = denom2 !== 0 ? ((knots[i + k] - t) / denom2) * bSplineBasis(i + 1, k - 1, t, knots) : 0;

        return term1 + term2;
    }
}

// B-spline curve function
export function bSplineCurve(t, controlPoints, degree, knots) {
    let x = 0, y = 0, z = 0;

    for (let i = 0; i < controlPoints.length; i++) {
        const basis = bSplineBasis(i, degree + 1, t, knots);
        x += basis * controlPoints[i].x;
        y += basis * controlPoints[i].y;
        z += basis * controlPoints[i].z;
    }

    return { x, y, z };
}
