/* ===========================================================================================================================
 * File: main.js
 * Author: Wesly Barayuga
 * Date: 10/30/2024
 * Purpose: Define internal state for WebGL 2.0 to model, render, and control a 3D Cube with PHONG lighting 
 * 
 * User Notice:
 *  - Includes a Cube composed of 12 triangles
 *  - Includes a posisional light
 *  - Includes a directional light
 *  - This was fun to make :)
 * =========================================================================================================================== */

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

// Vertex shader program
const vsSource = document.getElementById('vshader').textContent.trim();
// Fragment shader program
const fsSource = document.getElementById('fshader').textContent.trim();

// Define the cube vertices, normals, and indices
const vertices = new Float32Array([
    // Front face
    -1, -1,  1,   0,  0,  1,
     1, -1,  1,   0,  0,  1,
     1,  1,  1,   0,  0,  1,
    -1,  1,  1,   0,  0,  1,
    // Back face
    -1, -1, -1,   0,  0, -1,
    -1,  1, -1,   0,  0, -1,
     1,  1, -1,   0,  0, -1,
     1, -1, -1,   0,  0, -1,
    // Left face
    -1, -1, -1,  -1,  0,  0,
    -1, -1,  1,  -1,  0,  0,
    -1,  1,  1,  -1,  0,  0,
    -1,  1, -1,  -1,  0,  0,
    // Right face
     1, -1, -1,   1,  0,  0,
     1,  1, -1,   1,  0,  0,
     1,  1,  1,   1,  0,  0,
     1, -1,  1,   1,  0,  0,
    // Top face
    -1,  1, -1,   0,  1,  0,
     1,  1, -1,   0,  1,  0,
     1,  1,  1,   0,  1,  0,
    -1,  1,  1,   0,  1,  0,
    // Bottom face
    -1, -1, -1,   0, -1,  0,
    -1, -1,  1,   0, -1,  0,
     1, -1,  1,   0, -1,  0,
     1, -1, -1,   0, -1,  0,
]);

const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
]);

// Initialize shaders and program
function initShaders() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    return shaderProgram;
}

const shaderProgram = initShaders();

// Create buffer for vertices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Create buffer for indices
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Define attribute locations
const positionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
const normalLocation = gl.getAttribLocation(shaderProgram, "aNormal");

// Enable vertex attributes
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * 4, 0);
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(normalLocation);

// Set up uniforms
const uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
const uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
const uLightDirectionLocation = gl.getUniformLocation(shaderProgram, "uLightDirection");
const uLightPositionLocation = gl.getUniformLocation(shaderProgram, "uLightPosition");
const uLightColorLocation = gl.getUniformLocation(shaderProgram, "uLightColor");
const uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");
const uUseDirectionalLightLocation = gl.getUniformLocation(shaderProgram, "uUseDirectionalLight");
const uUsePositionalLightLocation = gl.getUniformLocation(shaderProgram, "uUsePositionalLight");

// Light and material properties
const light = {
    direction: [1.0, -1.0, -1.0],
    position: [2.0, 2.0, 2.0],
    color: [1.0, 1.0, 1.0],
    ambientColor: [0.1, 0.1, 0.1]
};

let cubeRotationX = 0;
let cubeRotationY = 0;
let useDirectionalLight = true;
let usePositionalLight = true;

function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(shaderProgram);

    // Set up the model view matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotationX, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotationY, [0, 1, 0]);

    // Set up the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

    // Send matrices and light data to shaders
    gl.uniformMatrix4fv(uModelViewMatrixLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);
    gl.uniform3fv(uLightDirectionLocation, light.direction);
    gl.uniform3fv(uLightPositionLocation, light.position);
    gl.uniform3fv(uLightColorLocation, light.color);
    gl.uniform3fv(uAmbientColorLocation, light.ambientColor);
    gl.uniform1i(uUseDirectionalLightLocation, useDirectionalLight);
    gl.uniform1i(uUsePositionalLightLocation, usePositionalLight);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}


//=========================================================================================================================================
//                                                              Controller
//=========================================================================================================================================

const keysPressed = {};

document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});

function updateMovement() {
    let isMoving = false; // Flag to check if the cube is being controlled

    if (keysPressed["ArrowLeft"]) {
        cubeRotationY -= 0.1;
        isMoving = true;
    }
    if (keysPressed["ArrowRight"]) {
        cubeRotationY += 0.1;
        isMoving = true;
    }
    if (keysPressed["ArrowUp"]) {
        cubeRotationX -= 0.1;
        isMoving = true;
    }
    if (keysPressed["ArrowDown"]) {
        cubeRotationX += 0.1;
        isMoving = true;
    }
    if (keysPressed["w"]) {
        light.position[1] += 0.1; // Move light up on the Y-axis
    }
    if (keysPressed["s"]) {
        light.position[1] -= 0.1; // Move light down on the Y-axis
    }
    if (keysPressed["a"]) {
        light.position[0] -= 0.1; // Move light left on the X-axis
    }
    if (keysPressed["d"]) {
        light.position[0] += 0.1; // Move light right on the X-axis
    }
    if (keysPressed["1"]) {
        usePositionalLight = true;
    }
    if (keysPressed["2"]) {
        usePositionalLight = false;
    }
    if (keysPressed["3"]) {
        useDirectionalLight = true;
    }
    if (keysPressed["4"]) {
        useDirectionalLight = false;
    }

    // If no keys are pressed, slowly rotate the cube
    if (!isMoving) {
        cubeRotationY += 0.006; // Slow rotation on Y-axis
        cubeRotationX += 0.006; // Slow rotation on X-axis
    }

    // Call updateMovement recursively to keep the animation smooth
    requestAnimationFrame(updateMovement);
}

// Start the movement update loop
updateMovement();


//=========================================================================================================================================
//                                                              Controller
//=========================================================================================================================================


function render() {
    drawScene();
    requestAnimationFrame(render);
}

// Start rendering
render();
