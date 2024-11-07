// groundMechanics.js
// Contains mechanics functions for defining object movement in the scene

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