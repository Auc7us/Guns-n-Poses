// levelBuilder.js

import { translateObj, rotateObj, hermiteInterpolation, hermiteDerivative } from './utils.js';
import { projectPoint, drawWarpedBase } from './render.js';

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

export const mainCurveSegments = [
    new CurveSegment(
        { x:  2000, y: 2000, z: -20000 },
        { x: 10000, y: 2000, z: -28000 },
        { x:     0, y:    0, z: -16000 },
        { x: 16000, y:    0, z:      0 }
    ),
    new CurveSegment(
        { x: 10000, y: 2000, z: -28000 },
        { x: 20000, y: 2000, z: -38000 },
        { x: 20000, y:    0, z:      0 },
        { x:     0, y:    0, z: -20000 }
    )
];

export const leftRailSegments = [
    new CurveSegment(
        { x:     0, y: 2000, z: -20000 },
        { x: 10000, y: 2000, z: -30000 },
        { x:     0, y:    0, z: -20000 },
        { x: 20000, y:    0, z:      0 }
    ),
    new CurveSegment(
        { x: 10000, y: 2000, z: -30000 },
        { x: 18000, y: 2000, z: -38000 },
        { x: 16000, y:    0, z:      0 },
        { x:     0, y:    0, z: -16000 }
    )
];

export const rightRailSegments = [
    new CurveSegment(
        { x:  4000, y: 2000, z: -20000 },
        { x: 10000, y: 2000, z: -26000 },
        { x:     0, y:    0, z: -12000 },
        { x: 12000, y:    0, z:      0 }
    ),
    new CurveSegment(
        { x: 10000, y: 2000, z: -26000 },
        { x: 22000, y: 2000, z: -38000 },
        { x: 24000, y:    0, z:      0 },
        { x:     0, y:    0, z: -24000 }
    )
];

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
