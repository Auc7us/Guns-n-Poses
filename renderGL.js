import { placeObj, drawRepeatingObj } from './levelBuilderGL.js';
import { updateFloatingPlatformPosition } from './groundMechanicsGL.js';
import { getLocations } from './utilsGL.js';

export function renderScene(gl, program1, program2, worldObjects, camera, projection, railPath, loopTime) {
    // Set up WebGL state
    // gl.clearColor(0.53*Math.cos(loopTime)*Math.cos(loopTime), 0.81*Math.cos(loopTime)*Math.cos(loopTime), 0.92* Math.cos(loopTime)*Math.cos(loopTime), 1.0); // Background color
    gl.clearColor(0, 0, 0, 1.0); // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);
    mat4.perspective(projectionMatrix, projection.fov, projection.aspect, projection.near, projection.far);


    // Program 1 Setup #########################################################################
    gl.useProgram(program1);
    const locations = getLocations(gl, program1);
    // Set uniform matrices for program1
    gl.uniformMatrix4fv(locations.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations.uniforms.projectionMatrix, false, projectionMatrix);
    // const light = {direction: vec3.normalize([], [1, 2, -2]), color: [1, 1, 1]};
    const light = {direction: vec3.create(), color: [1, 1, 1]};
    // loopTime = -3.14/2;
    const loopTimeEnv = loopTime * 0.1;
    // vec3.normalize(light.direction, [0.1 * Math.sin(loopTimeEnv)*Math.sin(loopTimeEnv), 1*Math.cos(loopTimeEnv)*Math.cos(loopTimeEnv), -0.2*Math.sin(loopTimeEnv)*Math.sin(loopTimeEnv)]);
    vec3.normalize(light.direction, [0.1 , 1, -0.8]);
    /*LIGHT DIRECTION REMEMBERRR
    X Positive = Left to Right (light is on left)
    Y Positive = Top to bottom (light is on top)
    Z Negative = Front to back (light is behind you at the start)
    */
    gl.uniform3fv(locations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations.uniforms.lightColor, light.color);
    gl.uniform3fv(locations.uniforms.viewPosition, camera.position);
    //Program 1 Objects ##########################################################################
    // Cubes gates
    gl.uniform3fv(locations.uniforms.objectColor, [0.9, 0.2, 0.1]);
    placeObj(gl, worldObjects.cube, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    gl.uniform3fv(locations.uniforms.objectColor, [0, 0.9, 0.9]);
    placeObj(gl, worldObjects.cube, [18000, 0, -53000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    // Track and Platform rendering
    gl.uniform3fv(locations.uniforms.objectColor, [0.7, 0.7, 0.7]);
    placeObj(gl, worldObjects.lRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.rRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    const platformInfo = updateFloatingPlatformPosition(railPath);
    const { position, tangent } = platformInfo;
    const platX = position.x;
    const platZ = position.z;
    const platformAngle = -Math.atan2(tangent.z, tangent.x);
    gl.uniform3fv(locations.uniforms.objectColor, [0.5, 0.25, 0.01]);
    // placeObj(gl, worldObjects.platform, [platX, 150, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.2, -1.2, 1.2], locations, 0);
    placeObj(gl, worldObjects.platform, [platX, 100, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.5, -0.02, 1.5], locations, 0);
    // Render ground
    gl.uniform3fv(locations.uniforms.objectColor, [0.5, 0.5, 0.5]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -19000, 1000, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -19000, 1000, [-4000, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, -38000, -56000, 1000, [18000, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -3999, 1000, [4000, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -3999, 1000, [4000, 0, -16000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    // Render stairs
    gl.uniform3fv(locations.uniforms.objectColor, [0.4, 0.4, 0.4]);
    placeObj(gl, worldObjects.surface, [4000, 1000,  -4000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.surface, [4000, 2000,  -7000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.surface, [4000, 3000, -10000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.surface, [4000, 4000, -13000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], locations, 0);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 1000,  -4000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 2000,  -7000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 3000, -10000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -2999, 1000, [4000, 4000, -13000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);


    // Program 2 Setup #########################################################################
    gl.useProgram(program2);
    const locations2 = getLocations(gl, program2);
    // Set uniform matrices for program2
    gl.uniformMatrix4fv(locations2.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations2.uniforms.projectionMatrix, false, projectionMatrix);
    // console.log("Camera position:", camera.position);
    // gl.uniform3fv(locations2.uniforms.viewPosition, camera.position);
    // Set light for program2
    const light2 = {direction: vec3.create(), color: [1, 1, 1]};
    
    vec3.normalize(light2.direction, [Math.sin(loopTime), Math.cos(loopTime), Math.sin(loopTime)]);
    gl.uniform3fv(locations2.uniforms.lightDirection, light2.direction);
    gl.uniform3fv(locations2.uniforms.lightColor, light2.color);
    // Render gun and bullet with specular effects
    loopTime = loopTime*3
    const objectsToRenderWithProgram2 = [
        // { obj: worldObjects.gun, translation: [2000, 1600, 4350], color: [0.8, 0.7, 0.5], scale: [1, -1, 1]},
        { obj: worldObjects.gun,     translation: [2120, 1770, 4550], rotation: { angle:                    0, axis: [0, 1, 0] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:             loopTime, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:     loopTime+Math.PI, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:   loopTime+Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:   loopTime+Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+3*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+5*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+3*Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+7*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
        { obj: worldObjects.bullet,  translation: [2115, 1770, 4000], rotation: { angle:                    0, axis: [0, 1, 0] }, scale: [1, -1, 1], color: [0.8, 0.8, 0.8]},
    ];
    
    objectsToRenderWithProgram2.forEach(({ obj, translation, rotation, scale, color}) => {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, translation);
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, modelMatrix);
        gl.uniformMatrix3fv(locations2.uniforms.normalMatrix, false, normalMatrix);
        gl.uniform3fv(locations2.uniforms.objectColor, color);    
        placeObj(gl, obj, translation, rotation, scale, locations2, 0);
    });
}
