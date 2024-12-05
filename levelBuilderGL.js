import { calculateBoundingBox } from './groundMechanicsGL.js';

export const groundPolygons = [];

export function placeObj(gl, obj, translation, rotation, scale, locations, isGround = false) {
    
    const modelMatrix = mat4.create();
    // modelMatrix = rotateObj(modelMatrix, rotation.angle, rotation.axis);
    // modelMatrix = scaleObj(modelMatrix, scale.x, scale.y, scale.z);
    // modelMatrix = translateObj(modelMatrix, translation.x, translation.y, translation.z);

    mat4.translate(modelMatrix, modelMatrix, translation); // World space position
    mat4.rotate(modelMatrix, modelMatrix, rotation.angle, rotation.axis);  // Rotate around object's local origin
    mat4.scale(modelMatrix, modelMatrix, scale);  // Scale relative to its local axes
    
    gl.uniformMatrix4fv(locations.uniforms.modelMatrix, false, modelMatrix);
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