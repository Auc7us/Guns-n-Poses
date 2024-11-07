// levelBuilder.js
// Contains functions that help build the level in the game by placing objects in the scene

import { translateObj, rotateObj} from './utils.js';
import * as renderUtils from './renderUtils.js';

export function placeObj(obj, rot, loc, ego, fovSlider, canvas, pitch, yaw, color, fillShape = false, thickness = 1) {
    const rotatedObj = rotateObj(obj, rot.angle, rot.axis);
    const translatedObj = translateObj(rotatedObj, loc.x, loc.y, loc.z);
    const projectedObj = translatedObj.map(corner => renderUtils.projectPoint(corner, ego, fovSlider, canvas, pitch, yaw)).filter(point => point !== null);
    renderUtils.drawObj(projectedObj, color, canvas, fillShape, thickness, ego.y);
}

export function drawGroundSegments(base, grid, ego, canvas, fovSlider, pitch, yaw, dy, startZ, endZ, xOff, yOff = 0, rot = {angle: 0, axis:[0, 1, 0]}) {
    const segmentSize = 1000; 

    for (let z = startZ; z >= endZ; z -= segmentSize) {
        placeObj(base, {angle: rot.angle, axis: rot.axis}, {x: xOff, y: yOff, z: z}, ego, fovSlider, canvas, pitch, yaw, "ground", true, 1);
        placeObj(grid, {angle: rot.angle, axis: rot.axis}, {x: xOff, y: yOff, z: z}, ego, fovSlider, canvas, pitch, yaw, "black", false, 1);
    }
}

export function drawFloatingPlatform(obj, grid, ego, canvas, fovSlider, pitch, yaw, dy, platformData) {
    const { position, tangent } = platformData;
    const xOff = position.x;
    const zOff = position.z;
    const angle = -1*Math.atan2(tangent.z, tangent.x);
   
    placeObj(obj, {angle: angle, axis:[0, 1, 0]}, {x: xOff, y: 0, z: zOff}, ego, fovSlider, canvas, pitch, yaw, "#5C4033", true, 1);
    placeObj(grid, {angle: angle, axis:[0, 1, 0]}, {x: xOff, y: 0, z: zOff}, ego, fovSlider, canvas, pitch, yaw, "black", false, 1);

}