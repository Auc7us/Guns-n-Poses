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

        // Set up model matrix for the object
        const modelMatrix = mat4.create();
        mat4.scale(modelMatrix, modelMatrix, [1, -1, 1]); // Flip on the Y-axis
        mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]); // Example transformation
        gl.uniformMatrix4fv(locations.uniforms.modelMatrix, false, modelMatrix);

        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
        gl.enableVertexAttribArray(locations.attributes.position);
        gl.vertexAttribPointer(locations.attributes.position, 3, gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
        gl.enableVertexAttribArray(locations.attributes.normal);
        gl.vertexAttribPointer(locations.attributes.normal, 3, gl.FLOAT, false, 0, 0);

        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
        gl.drawElements(gl.TRIANGLES, object.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}
