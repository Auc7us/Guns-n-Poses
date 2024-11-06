// levelBuilder.js

import { hermiteInterpolation, hermiteDerivative } from './utils.js';

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

