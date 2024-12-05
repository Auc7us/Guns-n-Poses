// worldLoader.js
// Load WebGL-ready models and prepare buffers

import { CurveSegment} from './utils.js';

export async function loadVertices(obj) {
    try {
        const response = await fetch("objects/" + obj);
        if (!response.ok) {
            throw new Error("ERRRRRROOOOOR");
        }
        const vertices = await response.json(); 
        return vertices;
    } catch (error) {
        console.error(error);
        return [];
    }
}

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
    const bullet = await loadModel(gl, './objects/bulletGL.json');
    const lRail = await loadModel(gl, './objects/lRailGL.json');
    const rRail = await loadModel(gl, './objects/rRailGL.json');
    const platform = await loadModel(gl, './objects/platformGL.json');

    return {
        cube,
        surface,
        gun,
        platform,
        rRail,
        lRail,
        bullet

    };
}

export async function getRailPath() {
    
    const curveData = await loadVertices('platform_track.json');
    const mainCurveSegments = curveData.mainCurveSegments.map(segment => new CurveSegment(segment.P0, segment.P1, segment.T0, segment.T1));
    
    return mainCurveSegments
}