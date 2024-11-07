// groundMechanics.js
// Contains mechanics functions for defining object movement and interactions in the scene

import {groundPolygons} from './levelBuilder.js';

let platformPositionT = 0;
const platformSpeed = 0.005;
let platformDirection = 1;

export function updateFloatingPlatformPosition(segments) {
    
    platformPositionT += platformSpeed * platformDirection;
    const maxT = segments.length - 1;
    if (platformPositionT > maxT + 1) {
        platformPositionT = maxT + 1;
        platformDirection = -1;
    } else if (platformPositionT < 0) {
        platformPositionT = 0;
        platformDirection = 1;
    }

    let segmentIndex = Math.floor(platformPositionT);
    let tInSegment = platformPositionT - segmentIndex;

    if (segmentIndex >= segments.length) {
        segmentIndex = segments.length - 1;
        tInSegment = 1;
    } else if (segmentIndex < 0) {
        segmentIndex = 0;
        tInSegment = 0;
    }

    const currentSegment = segments[segmentIndex];
    const position = currentSegment.getInterpolatedPoint(tInSegment);
    const tangent = currentSegment.getTangent(tInSegment);

    return { position, tangent };
}

export function calculateBoundingBox(vertices) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    vertices.forEach(vertex => {
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
        if (vertex.z < minZ) minZ = vertex.z;
        if (vertex.z > maxZ) maxZ = vertex.z;
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
}

function calculateYAtXZ(x, z, vertices) {
    if (vertices.every(v => v.y === vertices[0].y)) {
        return vertices[0].y; 
    }

    const [p1, p2, p3] = vertices;
    const A = (p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y);
    const B = (p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z);
    const C = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    const D = -(A * p1.x + B * p1.y + C * p1.z);

    if (B === 0) {
        console.warn("Plane is vertical, can't compute y from x and z alone.");
        return NaN;
    }
    const y = -(A * x + C * z + D) / B;
    return y;
}

export function getHeightAtPosition(x, z, playerFeetY, absGround) {
    let retVal = absGround;

    groundPolygons.forEach(({ vertices, boundingBox }) => {
        if (x >= boundingBox.minX && x <= boundingBox.maxX && z >= boundingBox.minZ && z <= boundingBox.maxZ) {
            // console.warn("Ground Polygon Found");
            const yAtXZ = calculateYAtXZ(x, z, vertices);
            if (!isNaN(yAtXZ) &&( yAtXZ >= playerFeetY || playerFeetY - yAtXZ <= 1000)) { // ground exists ie y @ x,z is not NaN, and playerFeet are above the height of ground at that point  
                // console.log(`yAtXZ: ${yAtXZ}`);
                retVal = yAtXZ;
            }
        }
    });

    return retVal;
}
