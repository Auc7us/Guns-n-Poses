//levelBuilderGL.js

import { calculateBoundingBox } from './groundMechanicsGL.js';

export const groundPolygons = [];

export function placeObj(gl, obj, translation, rotation, scale, locations, isGround = false) {
    
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, translation); // World space position
    mat4.scale(modelMatrix, modelMatrix, scale);  // Scale relative to its local axes
    mat4.rotate(modelMatrix, modelMatrix, rotation.angle, rotation.axis);//performed first  // Rotate around object's local origin
    
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

    if (isGround) {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
        gl.enableVertexAttribArray(locations.attributes.texCoord);
        gl.vertexAttribPointer(locations.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
        // const boundingBox = calculateBoundingBox(obj.vertices);
        // groundPolygons.push({ vertices: obj.vertices, boundingBox });
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
    gl.drawElements(gl.TRIANGLES, obj.vertexCount, gl.UNSIGNED_SHORT, 0);


}

export function drawRepeatingObj(gl, obj, locations, startZ, endZ, repeatInterval, translation, rotation, scale, isGround = 0) {
    for (let z = startZ; z >= endZ; z -= repeatInterval) {
        placeObj(gl, obj, [translation[0], translation[1], translation[2] + z], rotation, scale, locations, isGround);
    }
}
