import { groundPolygons } from './levelBuilderGL.js';

export function calculateBoundingBox(vertices) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    vertices.forEach(vertex => {
        if (vertex[0] < minX) minX = vertex[0];
        if (vertex[0] > maxX) maxX = vertex[0];
        if (vertex[1] < minY) minY = vertex[1];
        if (vertex[1] > maxY) maxY = vertex[1];
        if (vertex[2] < minZ) minZ = vertex[2];
        if (vertex[2] > maxZ) maxZ = vertex[2];
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
}

function calculateYAtXZ(x, z, vertices) {
    
    if (vertices.every(v => v.y === vertices[0].y)) {
        return vertices[0].y; 
    }

    const [p1, p2, p3] = vertices;
    const A = (p2[1] - p1[1]) * (p3[2] - p1[2]) - (p2[2] - p1[2]) * (p3[1] - p1[1]);
    const B = (p2[2] - p1[2]) * (p3[0] - p1[0]) - (p2[0] - p1[0]) * (p3[2] - p1[2]);
    const C = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
    const D = -(A * p1[0] + B * p1[1] + C * p1[2]);

    if (B === 0) {
        console.warn("Plane is vertical, can't compute y from x and z alone.");
        return NaN; // Cannot calculate Y for a vertical plane
    }

    return -(A * x + C * z + D) / B;
}

export function getHeightAtPosition(x, z, playerFeetY, absGround) {
    let retVal = absGround;

    groundPolygons.forEach(({ vertices, boundingBox }) => {
        if (x >= boundingBox.minX && x <= boundingBox.maxX && z >= boundingBox.minZ && z <= boundingBox.maxZ) {
            const yAtXZ = calculateYAtXZ(x, z, vertices);
            if (!isNaN(yAtXZ) && (yAtXZ >= playerFeetY || playerFeetY - yAtXZ <= 1000)) {
                retVal = yAtXZ;
            }
        }
    });

    return retVal;
}

export function calculateBoundingBoxGL(vertices) {
    return calculateBoundingBox(vertices);
}