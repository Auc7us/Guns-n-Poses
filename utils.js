// utils.js

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

