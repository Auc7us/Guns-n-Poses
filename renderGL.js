//renderGL.js

import {placeObj, placeWeapon, drawRepeatingObj, bindTexture, genFloatingMuzzle, placeMuzzle} from './levelBuilderGL.js';
import {updateFloatingPlatformPosition} from './groundMechanicsGL.js';
import {getLocations, getTexLocations} from './utilsGL.js';
import {transformGunMatrix} from './mechanicsGL.js';

let fMuzHeight = 0;

export function renderScene(gl, program1, program2, program3, worldObjects, camera, yawPitch, projection, railPath, loopTime, groundTexture, woodTexture, objTexture, nGroundTex, nWoodTex, nObjTex, bullets, fireRate, shootingF, mouseDownF) {
    gl.clearColor(0, 0, 0, 1.0); 
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
    const lightTime = loopTime;
    vec3.normalize(light.direction, [0.4 * Math.cos(lightTime*0.5) , -1* Math.cos(lightTime*0.5)* Math.cos(lightTime*0.5), -0.4* Math.sin(lightTime*0.5)]);
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
    placeObj(gl, worldObjects.cubeGate, [    0, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    gl.uniform3fv(locations.uniforms.objectColor, [0, 0.9, 0.9]);
    placeObj(gl, worldObjects.cubeGate, [18000, 0, -53000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    // Track and Platform rendering
    gl.uniform3fv(locations.uniforms.objectColor, [0.7, 0.7, 0.7]);
    placeObj(gl,  worldObjects.lRail, [   0,    0,    0], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl,  worldObjects.rRail, [   0,    0,    0], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    // placeObj(gl, worldObjects.bullet, [2115, 1770, 4000], {angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    const platformInfo = updateFloatingPlatformPosition(railPath);
    const { position, tangent } = platformInfo;
    const platX = position.x;
    const platZ = position.z;
    const platformAngle = -Math.atan2(tangent.z, tangent.x);
    // placeObj(gl, worldObjects.platform, [platX, 150, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.2, -1.2, 1.2], locations, 0);
    // placeObj(gl, worldObjects.cube, [platX, 100, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.5, -0.02, 1.5], locations, 0);
    
    const animTime = loopTime;
    let animSpeed = 0;
    if (shootingF == 1){ 
        animSpeed = 1.5 / fireRate;
    } else { animSpeed = 0;}

    const gunMatrix = transformGunMatrix(camera.position, yawPitch);
    gl.uniform3fv(locations.uniforms.objectColor, [0.83, 0.67, 0.3]);
    placeWeapon(gl, worldObjects.gun, gunMatrix, {angle: 0, axis: [0, 1, 0]}, locations, 0);

    fMuzHeight = 10* Math.sqrt(0.7/ fireRate);
    if (!mouseDownF){fMuzHeight = 0}
    
    const muzzleObjects = genFloatingMuzzle(worldObjects.fMuzzle, [0, 0, 1], [0.83, 0.67, 0.23], 8, animSpeed, animTime);
    muzzleObjects.forEach(({ obj, rotation, color }) => {
        gl.uniform3fv(locations.uniforms.objectColor, color);
        const muzzleMatrix = transformGunMatrix(camera.position, yawPitch);
        placeMuzzle(gl, obj, muzzleMatrix, [0, 15 - fMuzHeight,0], rotation, locations, 0);
    });

    // Program 2 Setup #########################################################################
    gl.useProgram(program2);
    const locations2 = getLocations(gl, program2);
    // Set uniform matrices for program2
    gl.uniformMatrix4fv(locations2.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations2.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform3fv(locations2.uniforms.viewPosition, camera.position);
    gl.uniform3fv(locations2.uniforms.lightDirection, light.direction);
    light.color = [0.8,0.5,0]
    gl.uniform3fv(locations2.uniforms.lightColor, light.color);

    bullets.forEach((bullet) => {
        const bulletMatrix = mat4.create();
        mat4.translate(bulletMatrix, bulletMatrix, [bullet.position.x, bullet.position.y, bullet.position.z]);
        mat4.multiply(bulletMatrix, bulletMatrix, bullet.rotationMatrix);
        mat4.scale(bulletMatrix, bulletMatrix, [bullet.scale, bullet.scale, 700]);
        gl.uniformMatrix4fv(locations2.uniforms.modelMatrix, false, bulletMatrix);
        gl.uniform3fv(locations2.uniforms.objectColor, [1,1,1]);
        placeWeapon(gl, worldObjects.bullet, bulletMatrix, { angle: 0, axis: [0, 1, 0] }, locations2, 0);
    });

    // Program 3 Setup #############################################################################
    light.color = [1,1,1]
    gl.useProgram(program3);
    const textureLocations = getTexLocations(gl, program3);
    gl.uniformMatrix4fv(textureLocations.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(textureLocations.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform3fv(textureLocations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(textureLocations.uniforms.lightColor, light.color);
    gl.uniform3fv(textureLocations.uniforms.viewPosition, camera.position);

    // Ground Texture
    bindTexture(gl, gl.TEXTURE0, groundTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    bindTexture(gl, gl.TEXTURE1, nGroundTex, {wrapS: gl.REPEAT, wrapT: gl.REPEAT, minFilter: gl.LINEAR, magFilter: gl.LINEAR});
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);
    // Ground Objects
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,       0,-19000, 4000, [    0, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,       0,-19000, 4000, [-4000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, -38000, -56000, 4000, [18000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,       0, -3999, 4000, [ 4000, 0,      0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 4], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations,       0, -3999, 4000, [ 4000, 0, -16000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 4], 1);
    // Stairs Texture
    bindTexture(gl, gl.TEXTURE0, objTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    bindTexture(gl, gl.TEXTURE1, nObjTex, {wrapS: gl.REPEAT, wrapT: gl.REPEAT, minFilter: gl.LINEAR, magFilter: gl.LINEAR});
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);
    // Stairs Objects
    placeObj(gl, worldObjects.surface, [4000,    0,  -4000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 1000,  -7000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 2000, -10000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    placeObj(gl, worldObjects.surface, [4000, 3000, -13000], { angle: -Math.PI / 2, axis: [1, 0, 0] }, [1, -1, 1], textureLocations, 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 1000,  -4000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 2000,  -7000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 3000, -10000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    drawRepeatingObj(gl, worldObjects.surface, textureLocations, 0, -2999, 4000, [4000, 4000, -13000], { angle: 0, axis: [0, 1, 0] }, [1, -4, 3], 1);
    // Platform Texture
    bindTexture(gl, gl.TEXTURE0, woodTexture);
    gl.uniform1i(textureLocations.uniforms.uTexture, 0);
    bindTexture(gl, gl.TEXTURE1, nWoodTex, {wrapS: gl.REPEAT, wrapT: gl.REPEAT, minFilter: gl.LINEAR, magFilter: gl.LINEAR});
    gl.uniform1i(textureLocations.uniforms.uNormalMap, 1);
    // Platform Object
    placeObj(gl, worldObjects.cube, [platX, 100, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.5, -0.02, 1.5], textureLocations, 1);

}


