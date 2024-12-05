//renderGL.js
import {placeObj, drawRepeatingObj} from './levelBuilderGL.js';

export function renderScene(gl, program, locations, worldObjects, camera, projection, light) {
    // Set up WebGL state
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, projection.fov, projection.aspect, projection.near, projection.far);

    // Set uniform matrices
    gl.uniformMatrix4fv(locations.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations.uniforms.projectionMatrix, false, projectionMatrix);

    // Set light uniforms
    gl.uniform3fv(locations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations.uniforms.lightColor, light.color);

    //cubes aka end points
    placeObj(gl,  worldObjects.cube, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.cube, [18000, 0, -53000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);

    //weapons
    placeObj(gl,  worldObjects.gun,  [2000, 1600, 4350], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.bullet,  [2115, 1770, 4000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    
    //track and platform
    placeObj(gl,  worldObjects.lRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.rRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.platform, [10000, 0, -28000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);

    //ground
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -19000, 1000, [    0, 0, 0], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -19000, 1000, [-4000, 0, 0], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, -38000, -56000, 1000, [18000, 0, 0], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    
    //strairs
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 0, 0], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    placeObj(gl,  worldObjects.surface, [4000,    0, -3000], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 1000, -3000], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    placeObj(gl,  worldObjects.surface, [4000, 1000, -6000], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 2000, -6000], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    placeObj(gl,  worldObjects.surface, [4000, 2000, -9000], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 3000, -9000], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    placeObj(gl,  worldObjects.surface, [4000, 3000, -12000], { angle: Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 4000, -12000], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -4999, 1000, [4000, 0, -15000], { angle: 0, axis: [0, 1, 0] },  [1, -1, 1]);
}
