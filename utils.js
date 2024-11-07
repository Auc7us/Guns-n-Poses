// utils.js
// Contains general utility functions used by different scripts

export class CurveSegment {
    constructor(P0, P1, T0, T1) {
        this.P0 = P0;
        this.P1 = P1;
        this.T0 = T0;
        this.T1 = T1;
    }

    getInterpolatedPoint(t) {
        return hermiteInterpolation(t, this.P0, this.P1, this.T0, this.T1);
    }

    getTangent(t) {
        return hermiteDerivative(t, this.P0, this.P1, this.T0, this.T1);
    }
}

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

