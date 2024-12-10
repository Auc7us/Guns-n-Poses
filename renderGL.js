//renderGL.js

import { placeObj, drawRepeatingObj } from './levelBuilderGL.js';
import { updateFloatingPlatformPosition } from './groundMechanicsGL.js';
import { getLocations, getTexLocations } from './utilsGL.js';

export function renderScene(gl, program1, program2, program3, worldObjects, camera, projection, railPath, loopTime, groundTexture, woodTexture, objTexture, nGroundTex, nWoodTex, nObjTex) {
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
    // vec3.normalize(light.direction, [1 , 0, 0]);
    vec3.normalize(light.direction, [0.4 * Math.cos(loopTime*0.5) , -1* Math.cos(loopTime*0.5)* Math.cos(loopTime*0.5), -0.4* Math.sin(loopTime*0.5)]);
    /*LIGHT DIRECTION REMEMBERRR
        X Positive = Left to Right (light is on left)
        Y Negative = Top to bottom (light is on top)
        Z Negative = Front to back (light is behind you at the start)
    */
    gl.uniform3fv(locations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations.uniforms.lightColor, light.color);
    gl.uniform3fv(locations.uniforms.viewPosition, camera.position);
    //Program 1 Objects ##########################################################################
    // Cubes gates
    gl.uniform3fv(locations.uniforms.objectColor, [0.9, 0.2, 0.1]);
    placeObj(gl, worldObjects.cubeGate, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    gl.uniform3fv(locations.uniforms.objectColor, [0, 0.9, 0.9]);
    placeObj(gl, worldObjects.cubeGate, [18000, 0, -53000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    // Track and Platform rendering
    gl.uniform3fv(locations.uniforms.objectColor, [0.7, 0.7, 0.7]);
    placeObj(gl,  worldObjects.lRail, [0, 0, 0], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.rRail, [0, 0, 0], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.bullet, [2115, 1770, 4000], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    const platformInfo = updateFloatingPlatformPosition(railPath);
    const { position, tangent } = platformInfo;
    const platX = position.x;
    const platZ = position.z;
    const platformAngle = -Math.atan2(tangent.z, tangent.x);
    // placeObj(gl, worldObjects.platform, [platX, 150, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.2, -1.2, 1.2], locations, 0);
    // placeObj(gl, worldObjects.cube, [platX, 100, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.5, -0.02, 1.5], locations, 0);
    
    // Program 2 Setup #########################################################################
    gl.useProgram(program2);
    const locations2 = getLocations(gl, program2);
    // Set uniform matrices for program2
    gl.uniformMatrix4fv(locations2.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations2.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform3fv(locations2.uniforms.viewPosition, camera.position);
    // Set light for program2
    const light2 = {direction: vec3.create(), color: [1, 1, 1]};
    // loopTime = 0;
    vec3.normalize(light2.direction, [Math.sin(loopTime), -Math.cos(loopTime), Math.sin(loopTime)]);
    // gl.uniform3fv(locations2.uniforms.lightDirection, light2.direction);
    gl.uniform3fv(locations2.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations2.uniforms.lightColor, light2.color);
    // Render gun and bullet with bpd effects
    loopTime = loopTime*3
    const objectsToRenderWithProgram2 = [
        { obj: worldObjects.gun,     translation: [2120, 1770, 4550], rotation: { angle:                    0, axis: [0, 1, 0] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},    
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:             loopTime, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:   loopTime+Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:   loopTime+Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+3*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle:     loopTime+Math.PI, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+5*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+3*Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
        { obj: worldObjects.fMuzzle, translation: [2120, 1770, 4550], rotation: { angle: loopTime+7*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.23]},
    ];

    objectsToRenderWithProgram2.forEach(({ obj, translation, rotation, scale, color}) => {
        gl.uniform3fv(locations2.uniforms.objectColor, color);    
        placeObj(gl, obj, translation, rotation, scale, locations2, 0);
    });

    console.log(camera.position);

    // Progam 3 Setup #############################################################################
    gl.useProgram(program3);
    const textureLocations = getTexLocations(gl, program3);
    // Set uniform matrices for program3
    gl.uniformMatrix4fv(textureLocations.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(textureLocations.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform3fv(textureLocations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(textureLocations.uniforms.lightColor, light.color);
    gl.uniform3fv(textureLocations.uniforms.viewPosition, camera.position);
    // Bind and activate the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, nGroundTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);

    // gl.uniform3fv(textureLocations.uniforms.objectColor, [0.5, 0.5, 0.5]);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,      0, -19000, 4000, [    0, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -4, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,      0, -19000, 4000, [-4000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -4, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, -38000, -56000, 4000, [18000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -4, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,      0,  -3999, 4000, [ 4000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -4, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,      0,  -3999, 4000, [ 4000, 0, -16000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 4], 1);
    
    // Render stairs
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, objTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, nObjTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);
    placeObj(gl, worldObjects.surface, [4000,    0,  -4000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 1000,  -7000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 2000, -10000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 3000, -13000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 1000,  -4000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 2000,  -7000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 3000, -10000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 4000, -13000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    
    //Platform
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, woodTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, nWoodTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);
    placeObj(gl, worldObjects.cube, [platX, 100, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.5, -0.02, 1.5], textureLocations, 1);

    

}


// { obj: worldObjects.gun,     translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle:                    0, axis: [0, 1, 0] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle:             loopTime, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle:     loopTime+Math.PI, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle:   loopTime+Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle:   loopTime+Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle: loopTime+3*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle: loopTime+5*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle: loopTime+3*Math.PI/2, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.fMuzzle, translation: [120+wpnXOff, -130+wpnYOff, -450+wpnZOff], rotation: { angle: loopTime+7*Math.PI/4, axis: [0, 0, 1] }, scale: [1, -1, 1], color: [0.83, 0.67, 0.3]},
//         { obj: worldObjects.bullet,  translation: [115+wpnXOff, -130+wpnYOff, -1000+wpnZOff], rotation: { angle:                   0, axis: [0, 1, 0] }, scale: [1, -1, 1], color: [0.8, 0.8, 0.8]},
