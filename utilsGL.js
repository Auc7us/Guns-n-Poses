// utilsGL.js

export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(`Error linking program: ${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

export function getLocations(gl, program) {
    return {
        attributes: {
            position: gl.getAttribLocation(program, 'aPosition'),
            normal: gl.getAttribLocation(program, 'aNormal'),
        },
        uniforms: {
            modelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            lightDirection: gl.getUniformLocation(program, 'uLightDirection'),
            lightColor: gl.getUniformLocation(program, 'uLightColor'),
            objectColor: gl.getUniformLocation(program, 'uObjectColor'),
        },
    };
}
