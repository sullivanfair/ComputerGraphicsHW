/**
 * @author Sullivan Fair
 */

// vertex shader
const vshaderSource = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
}
`;

// fragment shader
const fshaderSource = `
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexbuffer;

// handle to the compiled shader program on the GPU
var shader;

// code to actually render our geometry
function draw(n)
{
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

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

  // draw, specifying the type of primitive to assemble
  // (do this in two steps to try out Spector.js)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n * 3);
  

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

function constructVertices(n)
{
  const vertices = [];
  const theta = (2 * Math.PI) / n;
  const count = 0;

  for(let i = 0; i < n; i++)
  {
    vertices.push(0, 0);

    const curTheta = i * theta;
    const x = Math.cos(curTheta) * 0.8
    const y = Math.sin(curTheta) * 0.8;
    vertices.push(x, y);

    const nextTheta = (i + 1) * theta;
    const nextX = Math.cos(nextTheta) * 0.8;
    const nextY = Math.sin(nextTheta) * 0.8;
    
    vertices.push(nextX, nextY);
  }

  return new Float32Array(vertices);
}

// entry point when page is loaded
function main() {

  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

  // get graphics context
  gl = getGraphicsContext("theCanvas");

  // load and compile the shader pair
  shader = createShaderProgram(gl, vshaderSource, fshaderSource);

  let N = parseInt(document.getElementById('nBox').value);
  const vertices = constructVertices(N);

  // load the vertex data into GPU memory
  vertexbuffer = createAndLoadBuffer(vertices);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // we could just call draw() once to see the result, but setting up an animation
  // loop to continually update the canvas makes it easier to experiment with the
  // shaders
  //draw();

  // define an animation loop
  var animate = function() {
	  let nextN = parseInt(document.getElementById('nBox').value);

    if((nextN > 0) && nextN != N)
    {
      const vertices = constructVertices(nextN);

      vertexbuffer = createAndLoadBuffer(vertices);
      N = nextN;
    }

    draw(N);

	  // request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();
}