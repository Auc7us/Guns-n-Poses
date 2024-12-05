import { placeObj, drawRepeatingObj } from './levelBuilderGL.js';
import { updateFloatingPlatformPosition } from './groundMechanicsGL.js';
import { getLocations } from './utilsGL.js';

export function renderScene(gl, program1, program2, worldObjects, camera, projection, railPath, lightTime) {
    // Set up WebGL state
    gl.clearColor(0, 0, 0, 1.0); // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Program 1 Setup
    gl.useProgram(program1);
    const locations = getLocations(gl, program1);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, projection.fov, projection.aspect, projection.near, projection.far);

    // Set uniform matrices for program1
    gl.uniformMatrix4fv(locations.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations.uniforms.projectionMatrix, false, projectionMatrix);

    const light = {
        
        direction: vec3.create(),
        color: [1, 1, 1],
    };

    const x = Math.sin(lightTime);
    const y = Math.cos(lightTime);
    const z = Math.sin(lightTime * 0.5); // Varying slower for a dynamic effect
    // Update light direction and normalize
    vec3.normalize(light.direction, [x, y, z]);
    

    // Set light uniforms for program1
    gl.uniform3fv(locations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations.uniforms.lightColor, light.color);

    // Render static objects with program1
    gl.uniform3fv(locations.uniforms.objectColor, [0.9, 0.2, 0.1]);
    placeObj(gl, worldObjects.cube, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);

    gl.uniform3fv(locations.uniforms.objectColor, [0, 0.9, 0.9]);
    placeObj(gl, worldObjects.cube, [18000, 0, -53000], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);

    // Track and platform rendering
    placeObj(gl, worldObjects.lRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    placeObj(gl, worldObjects.rRail, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);

    const platformInfo = updateFloatingPlatformPosition(railPath);
    const { position, tangent } = platformInfo;
    const platX = position.x;
    const platZ = position.z;
    const platformAngle = -Math.atan2(tangent.z, tangent.x);

    gl.uniform3fv(locations.uniforms.objectColor, [0.5, 0.25, 0.01]);
    placeObj(gl, worldObjects.platform, [platX, 150, platZ], { angle: platformAngle, axis: [0, 1, 0] }, [1.2, -1.2, 1.2], locations, 0);

    gl.uniform3fv(locations.uniforms.objectColor, [0.3, 0.3, 0.3]);
    // Render ground
    drawRepeatingObj(gl, worldObjects.surface, locations, 0, -19000, 1000, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1]);

    // Program 2 Setup for specular rendering
    gl.useProgram(program2);
    const locations2 = getLocations(gl, program2);
    
    const light2 = {
        direction: vec3.normalize([], [1, -1, -1]),
        color: [1, 1, 1],
    };

    // Set uniform matrices for program2
    gl.uniformMatrix4fv(locations2.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(locations2.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform3fv(locations2.uniforms.viewPosition, camera.position); // Pass camera position for specular reflection

    // Set light uniforms for program2
    gl.uniform3fv(locations2.uniforms.lightDirection, light2.direction);
    gl.uniform3fv(locations2.uniforms.lightColor, light2.color);

    // Render gun and bullet with specular effects
    const objectsToRenderWithProgram2 = [
        { obj: worldObjects.gun, translation: [2000, 1600, 4350], color: [0.8, 0.7, 0.5] },
        { obj: worldObjects.bullet, translation: [2115, 1770, 4000], color: [0.8, 0.8, 0.8] },
    ];
    
    objectsToRenderWithProgram2.forEach(({ obj, translation, color }) => {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, translation);
    
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, modelMatrix);
    
        gl.uniformMatrix3fv(locations2.uniforms.normalMatrix, false, normalMatrix);
        gl.uniform3fv(locations2.uniforms.objectColor, color);
    
        placeObj(gl, obj, translation, { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations2, 0);
    });
    
}
