//renderGL.js
import { placeObj } from './levelBuilderGL.js';

export function renderScene(gl, program, locations, worldObjects, camera, projection, light) {
    // Set up WebGL state
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Set up view and projection matrices
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

    // Render each object
    for (const [name, object] of Object.entries(worldObjects)) {
        if (!object) continue;
        placeObj(gl, object, [0, 0, 0], { angle: 0, axis: [0, 1, 0] }, [1, -1, 1], locations, 0);
    }
}
