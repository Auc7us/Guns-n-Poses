import { loadWorldObjects } from './worldLoaderGL.js';
import { renderScene } from './renderGL.js';
import { createShader, createProgram } from './utilsGL.js';
import { updateMovement, initiateJump } from './mechanicsGL.js';

async function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');
    const gravity = -9800;
    const jumpHeight = 5000;
    const absGround = -2000;
    const groundY = 0;

    if (!gl) {
        console.error('WebGL not supported!');
        return;
    }

    const vertexShaderSource = document.getElementById('vertex-shader').textContent;
    const fragmentShaderSource = document.getElementById('fragment-shader').textContent;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const locations = {
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

    const worldObjects = await loadWorldObjects(gl);

    const camera = {
        position: vec3.fromValues(2000, 1900, 5000),
        target: vec3.fromValues(2000, 700, 0),
        up: vec3.fromValues(0, 1, 0),
    };

    const ego = {
        x: camera.position[0],
        y: camera.position[1],
        z: camera.position[2],
        velocityY: 0,
        isJumping: false,
        isFreeFalling: false,
        onGround: true,
    };

    const projection = {
        fov: (65 * Math.PI) / 180, // Default FOV (in radians)
        aspect: canvas.width / canvas.height,
        near: 0.1,
        far: 50000,
    };

    const light = {
        direction: vec3.normalize([], [1, -1, 0]),
        color: [1, 1, 1],
    };

    const keysPressed = {};
    const yawPitch = { yaw: 0, pitch: 0 };
    const mouseSensitivity = 0.002;
    const pitchLimit = Math.PI / 3 - 0.01;

    // FOV Slider Event Listener
    const fovSlider = document.getElementById('fovSlider');
    if (fovSlider) {
        fovSlider.addEventListener('input', (event) => {
            const fovValue = event.target.value;
            projection.fov = (fovValue * Math.PI) / 180; // Convert degrees to radians
        });
    }

    // Event Listeners for Movement and Mouse
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
        if (event.key === ' ') {
            initiateJump(ego, jumpHeight, gravity);
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === canvas) {
            yawPitch.yaw += event.movementX * mouseSensitivity;
            yawPitch.pitch += event.movementY * mouseSensitivity;

            if (yawPitch.pitch > pitchLimit) yawPitch.pitch = pitchLimit;
            if (yawPitch.pitch < -pitchLimit) yawPitch.pitch = -pitchLimit;
        }
    });

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    // Set light and object color uniforms
    gl.uniform3fv(locations.uniforms.lightDirection, light.direction);
    gl.uniform3fv(locations.uniforms.lightColor, light.color);
    gl.uniform3fv(locations.uniforms.objectColor, [0.8, 0.2, 0.2]);

    const speed = 90;
    const deltaTime = 0.016; // ~60 FPS

    function updateCameraTarget() {
        const forward = vec3.fromValues(
            Math.sin(yawPitch.yaw),
            -Math.sin(yawPitch.pitch),
            -Math.cos(yawPitch.yaw)
        );
        vec3.normalize(forward, forward);
        vec3.add(camera.target, [ego.x, ego.y, ego.z], forward);
    }

    function renderLoop() {
        updateMovement(ego, gravity, keysPressed, yawPitch.yaw, yawPitch.pitch, speed, deltaTime, groundY, absGround);
        camera.position[0] = ego.x;
        camera.position[1] = ego.y;
        camera.position[2] = ego.z;

        updateCameraTarget(); // Ensure the target updates on movement

        renderScene(gl, program, locations, worldObjects, camera, projection, light);
        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

main();
