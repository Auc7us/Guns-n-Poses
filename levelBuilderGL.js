import { calculateBoundingBox } from './groundMechanicsGL.js';

export const groundPolygons = [];

export function placeObj(gl, obj, translation, rotation, scale, locations, isGround = false) {
    
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, translation); // World space position
    mat4.rotate(modelMatrix, modelMatrix, rotation.angle, rotation.axis);  // Rotate around object's local origin
    mat4.scale(modelMatrix, modelMatrix, scale);  // Scale relative to its local axes

    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelMatrix); // Compute the inverse transpose of the modelMatrix

    
    gl.uniformMatrix4fv(locations.uniforms.modelMatrix, false, modelMatrix);
    gl.uniformMatrix3fv(locations.uniforms.normalMatrix, false, normalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.enableVertexAttribArray(locations.attributes.position);
    gl.vertexAttribPointer(locations.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.enableVertexAttribArray(locations.attributes.normal);
    gl.vertexAttribPointer(locations.attributes.normal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
    gl.drawElements(gl.TRIANGLES, obj.vertexCount, gl.UNSIGNED_SHORT, 0);

    if (isGround) {
        const boundingBox = calculateBoundingBox(obj.vertices);
        groundPolygons.push({ vertices: obj.vertices, boundingBox });
    }
}

export function drawRepeatingObj(gl, obj, locations, startZ, endZ, repeatInterval, translation, rotation, scale) {
    for (let z = startZ; z >= endZ; z -= repeatInterval) {
        placeObj(gl, obj, [translation[0], translation[1], translation[2] + z], rotation, scale, locations, 0);
    }
}
