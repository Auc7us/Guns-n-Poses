// worldLoader.js
// Load WebGL-ready models and prepare buffers

export async function loadModel(gl, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load model from ${filePath}`);
        }
        const modelData = await response.json();

        // Prepare buffers
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertices), gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.normals), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);

        return {
            vertexBuffer,
            normalBuffer,
            indexBuffer,
            vertexCount: modelData.indices.length,
        };
    } catch (error) {
        console.error(`Error loading model: ${error}`);
        return null;
    }
}

export async function loadWorldObjects(gl) {
    const cube = await loadModel(gl, './objects/cubeGL.json');
    const gun = await loadModel(gl, './objects/gunGL.json');
    const surface = await loadModel(gl, './objects/surfaceGL.json');
    // Add more objects as needed
    // const platform = await loadModel(gl, './objects/platformGL.json');

    return {
        cube,
        surface,
        gun,
        // platform,
    };
}
