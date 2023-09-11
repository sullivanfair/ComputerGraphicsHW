/**
 * @author Sullivan Fair
 */
const vshaderSource = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 color;
void main()
{
    color = a_Color;
    gl_Position = a_Position;

}
`;

const fshaderSource = `
// In a webgl fragment shader, float precision has to be specified before
// any other variable declarations (in this case, "medium" precision)
precision mediump float;
varying vec4 color;
void main()
{
    gl_FragColor = color;
}
`;

const squarevshaderSource = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
}
`;

// fragment shader
const squarefshaderSource = `
// precision declaration required to use floats
precision mediump float;
uniform vec4 color;
void main()
{
	gl_FragColor = color;
}
`;

// raw data for some point positions
var vertices = new Float32Array([
-1.0, -0.75,
0.0, -0.75,
-0.5, 0.75
]
);

// a color value for each vertex
var colors = new Float32Array([
1.0, 0.0, 0.0, 1.0,  // red
0.0, 1.0, 0.0, 1.0,  // green
0.0, 0.0, 1.0, 1.0,  // blue
]);

var squareVertices = new Float32Array([
    0.0, -0.25,
    0.5, -0.25,
    0.5, 0.25,
    0.0, -0.25,
    0.5, 0.25,
    0.0, 0.25
]);

// A few global variables...
    
// the OpenGL context
var gl;
var squareGl;
    
// handles to buffers on the GPU
var vertexbuffer;
var squareVertexBuffer;

var colorbuffer;
    
// handle to the compiled shader program on the GPU
var shader;
var squareShader;

// code to actually render our geometry
function drawTriangle()
{
    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // load and compile the shader pair
    shader = createShaderProgram(gl, vshaderSource, fshaderSource);

    // load the vertex data into GPU memory
    vertexbuffer = createAndLoadBuffer(vertices);

    //load the color data into GPU memory
    colorbuffer = createAndLoadBuffer(colors);

    // specify a fill color for clearing the framebuffer
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // bind the shader
    gl.useProgram(shader);

    // bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

    // bind the shader
    gl.useProgram(shader);

    // bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

    // get the index for the a_Position attribute defined in the vertex shader
    var positionIndex = gl.getAttribLocation(shader, 'a_Position');
    if (positionIndex < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // "enable" the a_position attribute
    gl.enableVertexAttribArray(positionIndex);

    // associate the data in the currently bound buffer with the a_position attribute
    // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
    // the last three args just yet.)
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

    // we can unbind the buffer now (not really necessary when there is only one buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // bind the buffer with the color data
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);

    // get the index for the a_Color attribute defined in the vertex shader
    var colorIndex = gl.getAttribLocation(shader, 'a_Color');
    if (colorIndex < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // "enable" the a_Color attribute
    gl.enableVertexAttribArray(colorIndex);

    // Associate the data in the currently bound buffer with the a_Color attribute
    // The '4' specifies there are 4 floats per vertex in the buffer
    gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

    // we can unbind the buffer now
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // draw, specifying the type of primitive to assemble from the vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // unbind shader and "disable" the attribute indices
    // (not really necessary when there is only one shader)
    gl.disableVertexAttribArray(positionIndex);
    gl.disableVertexAttribArray(colorIndex);
    gl.useProgram(null);
}

function drawSquare(currentColor)
{
    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // load and compile the shader pair
    shader = createShaderProgram(gl, squarevshaderSource, squarefshaderSource);

    // load the vertex data into GPU memory
    vertexbuffer = createAndLoadBuffer(squareVertices);

    // bind the shader
    gl.useProgram(shader);

    // bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

    // get the index for the a_Position attribute defined in the vertex shader
    var positionIndex = gl.getAttribLocation(shader, 'a_Position');
    if (positionIndex < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // "enable" the a_position attribute
    gl.enableVertexAttribArray(positionIndex);

    // associate the data in the currently bound buffer with the a_position attribute
    // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
    // the last three args just yet.)
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

    // we can unbind the buffer now (not really necessary when there is only one buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let squareIndex = gl.getUniformLocation(shader, "color");
    // two ways to do this...
    // a) pass four floats individually
    //gl.uniform4f(index, currentColor[0], currentColor[1], currentColor[2], currentColor[3]);
    // or b) since currentColor is a JS array, we can use it to construct a Float32Array
    gl.uniform4fv(squareIndex, new Float32Array(currentColor));

    // draw, specifying the type of primitive to assemble from the vertices
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // unbind shader and "disable" the attribute indices
    // (not really necessary when there is only one shader)
    gl.disableVertexAttribArray(positionIndex);
    gl.useProgram(null);
}

function changeColor(event)
{
    let canvas = document.getElementById('theCanvas');
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    // reverse so (0, 0) is lower left corner, to be consistent with framebuffer
    y = canvas.height - y;

    var vertColors = [
        1.0, 0.0, 0.0, 1.0,  // red
        0.0, 1.0, 0.0, 1.0,  // green
        0.0, 0.0, 1.0, 1.0,  // blue
        ];
    
    const p1 = {
        x: 0,
        y: 50
    }

    const p2 = {
        x: 200,
        y: 50
    }

    const p3 = {
        x: 100,
        y: 350
    }

    const p4 = {
        x,
        y
    }

    if(isInTriangle(p1, p2, p3, p4))
    {
        var color = findRGB(x, y, 200, 350, vertColors);
        drawTriangle();
        drawSquare(color);
    }
}

function triangleArea(p1, p2, p3)
{
    return Math.abs((p1.x*(p2.y-p3.y) + 
                    p2.x*(p3.y-p1.y) + 
                    p3.x*(p1.y-p2.y))/2.0);
}

function isInTriangle(p1, p2, p3, p4)
{
    const area = triangleArea (p1, p2, p3);          
    const area1 = triangleArea (p4, p2, p3);      
    const area2 = triangleArea (p1, p4, p3);       
    const area3 = triangleArea (p1, p2, p4);  

    return (area == area1 + area2 + area3);
}

function main()
{
    var canvas = document.getElementById('theCanvas');
    drawTriangle();
    
    color = [0.0, 0.0, 0.0, 1.0];
    drawSquare(color);
    
    canvas.onclick = changeColor;
}