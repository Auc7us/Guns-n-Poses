// utils.js

export function calculateDistance(fov) {
    const fovRadians = (fov * Math.PI) / 180;
    return (1600 / (2 * Math.tan(fovRadians / 2))).toFixed(2);
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

export function rotateObj(points, angle, axis) {
    const rotationMatrix = mat4.create();
    mat4.rotate(rotationMatrix, rotationMatrix, angle, axis);

    return points.map(point => {
        const originalVec = vec3.fromValues(point.x, point.y, point.z);
        const rotatedVec = vec3.create();
        vec3.transformMat4(rotatedVec, originalVec, rotationMatrix);

        return {
            x: rotatedVec[0],
            y: rotatedVec[1],
            z: rotatedVec[2]
        };
    });
}

export function hermiteInterpolation(t, P0, P1, T0, T1) {
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

export function hermiteDerivative(t, P0, P1, T0, T1) {
    const h1 = 6 * t * t - 6 * t;
    const h2 = 3 * t * t - 4 * t + 1;
    const h3 = -6 * t * t + 6 * t;
    const h4 = 3 * t * t - 2 * t;

    return {
        x: h1 * P0.x + h2 * T0.x + h3 * P1.x + h4 * T1.x,
        y: h1 * P0.y + h2 * T0.y + h3 * P1.y + h4 * T1.y,
        z: h1 * P0.z + h2 * T0.z + h3 * P1.z + h4 * T1.z
    };
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

// export function evaluateBSpline(controlPoints, i, t) {
//     const P0 = controlPoints[i];
//     const P1 = controlPoints[i + 1];
//     const P2 = controlPoints[i + 2];
//     const P3 = controlPoints[i + 3];

//     const B0 = ((1 - t) ** 3) / 6;
//     const B1 = (3 * t ** 3 - 6 * t ** 2 + 4) / 6;
//     const B2 = (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6;
//     const B3 = (t ** 3) / 6;

//     const x = B0 * P0.x + B1 * P1.x + B2 * P2.x + B3 * P3.x;
//     const y = B0 * P0.y + B1 * P1.y + B2 * P2.y + B3 * P3.y;
//     const z = B0 * P0.z + B1 * P1.z + B2 * P2.z + B3 * P3.z;

//     return { x, y, z };
// }


