// worldLoader.js

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

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertices), gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.normals), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        if (modelData.texCoords) {
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.texCoords), gl.STATIC_DRAW);
        }

        const vertices3D = [];
        for (let i = 0; i < modelData.vertices.length; i += 3) {
            vertices3D.push([modelData.vertices[i], modelData.vertices[i + 1], modelData.vertices[i + 2]]);
        }

        return {
            vertexBuffer,
            normalBuffer,
            indexBuffer,
            texCoordBuffer,
            vertexCount: modelData.indices.length,
            vertices: vertices3D,
        };
    } catch (error) {
        console.error(`Error loading model: ${error}`);
        return null;
    }
}

export async function loadWorldObjects(gl) {
    const cubeGate = await loadModel(gl, './objects/cubeGate_flat.json');
    const gun      = await loadModel(gl, './objects/gunHP_flat.json');
    const surface  = await loadModel(gl, './objects/surface41_flat.json');
    const bullet   = await loadModel(gl, './objects/bullet_flat.json');
    const lRail    = await loadModel(gl, './objects/lRail_smooth.json');
    const rRail    = await loadModel(gl, './objects/rRail_smooth.json');
    const cube     = await loadModel(gl, './objects/cube_flat.json');
    const fMuzzle  = await loadModel(gl, './objects/floatingMuzzle_flat.json');
// 
    return {
        cubeGate,
        gun,
        surface,
        bullet,
        lRail,
        rRail,
        cube,
        fMuzzle
    };
}

export async function getRailPath() {
    
    const curveData = await loadVertices('platform_track.json');
    const mainCurveSegments = curveData.mainCurveSegments.map(segment => new CurveSegment(segment.P0, segment.P1, segment.T0, segment.T1));
    
    return mainCurveSegments
}