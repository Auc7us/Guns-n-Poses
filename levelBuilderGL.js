//levelBuilderGL.js

import { calculateBoundingBox } from './groundMechanicsGL.js';
let prevPosMuzzle = null; 
export const groundPolygons = [];

export function placeObj(gl, obj, translation, rotation, scale, locations, isGround = false) {
    
    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, translation); 
    mat4.scale(modelMatrix, modelMatrix, scale);
    mat4.rotate(modelMatrix, modelMatrix, rotation.angle, rotation.axis);//performed first  // Rotate around object's local origin
    
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelMatrix); 
    
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

export function placeWeapon(gl, obj, modelMatrix, rotation, locations,  hasTex = false, inWorldSpace = true) {
    
    const normalMatrix = mat3.create();
    if (inWorldSpace) { 
        mat4.scale(modelMatrix, modelMatrix, [1, -1, 1]);
    }
    mat4.rotate(modelMatrix, modelMatrix, rotation.angle, rotation.axis);
    
    mat3.normalFromMat4(normalMatrix, modelMatrix);
    
    gl.uniformMatrix4fv(locations.uniforms.modelMatrix, false, modelMatrix);
    gl.uniformMatrix3fv(locations.uniforms.normalMatrix, false, normalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.enableVertexAttribArray(locations.attributes.position);
    gl.vertexAttribPointer(locations.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.enableVertexAttribArray(locations.attributes.normal);
    gl.vertexAttribPointer(locations.attributes.normal, 3, gl.FLOAT, false, 0, 0);

    if (hasTex) {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
        gl.enableVertexAttribArray(locations.attributes.texCoord);
        gl.vertexAttribPointer(locations.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
    gl.drawElements(gl.TRIANGLES, obj.vertexCount, gl.UNSIGNED_SHORT, 0);

}

export function drawRepeatingObj(gl, obj, locations, startZ, endZ, repeatInterval, translation, rotation, scale, isGround = 0) {
    for (let z = startZ; z >= endZ; z -= repeatInterval) {
        placeObj(gl, obj, [translation[0], translation[1], translation[2] + z], rotation, scale, locations, isGround);
    }
}

let currentTextureUnit = null;
let currentTexture = null;

export function bindTexture(gl, textureUnit, texture, parameters = {}) {
    if (currentTextureUnit !== textureUnit || currentTexture !== texture) {
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        currentTextureUnit = textureUnit;
        currentTexture = texture;
    }

    if (parameters.wrapS !== undefined) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, parameters.wrapS);
    if (parameters.wrapT !== undefined) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, parameters.wrapT);
    if (parameters.minFilter !== undefined) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, parameters.minFilter);
    if (parameters.magFilter !== undefined) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, parameters.magFilter);
}

export function genFloatingMuzzle(obj, baseRotationAxis, baseColor, numObjects, speedMultiplier, loopTime) {

    if (prevPosMuzzle === null) {
        prevPosMuzzle = speedMultiplier * loopTime;
    }
    let posMuzzle = (speedMultiplier === 0) ? prevPosMuzzle : prevPosMuzzle + (speedMultiplier * (loopTime - prevPosMuzzle / speedMultiplier));
    const objects = [];
    for (let i = 0; i < numObjects; i++) {
        const angle = posMuzzle + (i * 2 * Math.PI / numObjects); 
        objects.push({
            obj: obj,
            rotation: { angle: angle, axis: baseRotationAxis },
            color: baseColor,
        });
    }
    if (speedMultiplier !== 0) {
        prevPosMuzzle = posMuzzle;
    }

    return objects;
}




