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
