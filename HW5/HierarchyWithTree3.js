//
// Hierarchical object using recursion.  Uses dummy objects in a way that is
// Similar to HierarchyWithTree2, but is based on a version of CS336Object.js.
//


// vertex shader
const vLightingShaderSource = `
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec4 u_Color;
uniform mat3 normalMatrix;
uniform vec4 lightPosition;

attribute vec4 a_Position;
attribute vec3 a_Normal;

varying vec4 color;
void main()
{
  // simple Gouraud shading
  float ambientFactor = 0.1;
  vec3 lightDirection = normalize((view * lightPosition - view * model * a_Position).xyz);
  vec3 normal = normalize(normalMatrix * a_Normal);
  float diffuseFactor = max(0.0, dot(lightDirection, normal));
  color = u_Color * diffuseFactor + u_Color * ambientFactor;
  color.a = 1.0;
  gl_Position = projection * view * model * a_Position;
}
`;

// fragment shader
const fLightingShaderSource = `
precision mediump float;
varying vec4 color;
void main()
{
  gl_FragColor = color;
}
`;


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;

// handle to the compiled shader program on the GPU
var lightingShader;

var scale = 1.0;

var sphere;
var sphereBuffer;
var sphereNormalBuffer;

var cylinder;
var cylinderBuffer;
var cylinderNormalBuffer;

// create the objects
var turbineDummy = new CS336Object();

var shaft = new CS336Object(drawCylinder);
shaft.setScale(1.5, 20, 1.5);
turbineDummy.addChild(shaft);

var topDummy = new CS336Object();
topDummy.setPosition(0, 10, 0);
turbineDummy.addChild(topDummy);

var housing = new CS336Object(drawCylinder);
housing.rotateX(90);
housing.moveBack(2);
housing.moveDown(1);
housing.setScale(2, 5, 2);
housing.moveForward(2);
topDummy.addChild(housing);

var hubDummy = new CS336Object();
hubDummy.moveForward(5);
topDummy.addChild(hubDummy);

var hub = new CS336Object(drawCylinder);
hub.rotateX(90);
hub.setScale(1, 3, 1);
hubDummy.addChild(hub);

var bladeDummy = new CS336Object;
hubDummy.addChild(bladeDummy);

var blade1 = new CS336Object(drawSphere);
blade1.moveUp(6);
blade1.setScale(1.5, 7.5, 0.75);

var blade2 = new CS336Object(drawSphere);
blade2.moveDown(6);
blade2.setScale(1.5, 7.5, 0.75);

bladeDummy.addChild(blade1);
bladeDummy.addChild(blade2);

// view matrix
var view = createLookAtMatrix(
               new THREE.Vector3(40, 40, 40),   // eye
               new THREE.Vector3(0.0, 0.0, 0.0),      // at - looking at the origin
               new THREE.Vector3(0.0, 1.0, 0.0));    // up vector - y axis


// Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
//var projection = new Matrix4().setPerspective(30, 1.5, 0.1, 1000);
var projection = createPerspectiveMatrix(30, 1.5, 1, 100);

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

// handler for key press events adjusts object rotations
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	case 't':
	  topDummy.rotateY(15);
		break;
	case 'T':
	  topDummy.rotateY(-15);
		break;
	case 's':
		blade1.rotateY(-15)
	  	blade2.rotateY(15);
		break;
	case 'S':
	  	blade1.rotateY(15);
		blade2.rotateY(-15);
		break;
  	case 'g':
		scale *= 1.25;
		turbineDummy.setScale(scale, scale, scale);
		break;
  	case 'G':
		scale *= 0.8;
		turbineDummy.setScale(scale, scale, scale);
		break;
	default:
		return;
	}
}

// helper function renders the cube based on the given model transformation
function drawCube(matrix)
{
	  // bind the shader
	  gl.useProgram(lightingShader);

	  // get the index for the a_Position attribute defined in the vertex shader
	  var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	  if (positionIndex < 0) {
	    console.log('Failed to get the storage location of a_Position');
	    return;
	  }

	  var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	  if (normalIndex < 0) {
		    console.log('Failed to get the storage location of a_Normal');
		    return;
		  }

	  // "enable" the a_position attribute
	  gl.enableVertexAttribArray(positionIndex);
	  gl.enableVertexAttribArray(normalIndex);

	  // bind data for points and normals
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);

	  var loc = gl.getUniformLocation(lightingShader, "view");
	  gl.uniformMatrix4fv(loc, false, view.elements);
	  loc = gl.getUniformLocation(lightingShader, "projection");
	  gl.uniformMatrix4fv(loc, false, projection.elements);
	  loc = gl.getUniformLocation(lightingShader, "u_Color");
	  gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
    var loc = gl.getUniformLocation(lightingShader, "lightPosition");
    gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

	  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
	  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

	  gl.uniformMatrix4fv(modelMatrixloc, false, matrix.elements);
	  gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(matrix, view));

	  gl.drawArrays(gl.TRIANGLES, 0, 36);

	  gl.useProgram(null);
}

function drawSphere(matrix)
{
	// bind the shader
	gl.useProgram(lightingShader);

	// get the index for the a_Position attribute defined in the vertex shader
	var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	if (positionIndex < 0) {
	console.log('Failed to get the storage location of a_Position');
	return;
	}

	var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	if (normalIndex < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return;
		}

	// "enable" the a_position attribute
	gl.enableVertexAttribArray(positionIndex);
	gl.enableVertexAttribArray(normalIndex);

	// bind data for points and normals
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
	gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
	gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var loc = gl.getUniformLocation(lightingShader, "view");
	gl.uniformMatrix4fv(loc, false, view.elements);
	loc = gl.getUniformLocation(lightingShader, "projection");
	gl.uniformMatrix4fv(loc, false, projection.elements);
	loc = gl.getUniformLocation(lightingShader, "u_Color");
	gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
	var loc = gl.getUniformLocation(lightingShader, "lightPosition");
	gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

	var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
	var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

	gl.uniformMatrix4fv(modelMatrixloc, false, matrix.elements);
	gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(matrix, view));

	gl.drawArrays(gl.TRIANGLES, 0, sphere.numVertices);

	gl.useProgram(null);
}

function drawCylinder(matrix)
{
	// bind the shader
	gl.useProgram(lightingShader);

	// get the index for the a_Position attribute defined in the vertex shader
	var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	if (positionIndex < 0) {
	console.log('Failed to get the storage location of a_Position');
	return;
	}

	var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	if (normalIndex < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return;
		}

	// "enable" the a_position attribute
	gl.enableVertexAttribArray(positionIndex);
	gl.enableVertexAttribArray(normalIndex);

	// bind data for points and normals
	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBuffer);
	gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cylinderNormalBuffer);
	gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var loc = gl.getUniformLocation(lightingShader, "view");
	gl.uniformMatrix4fv(loc, false, view.elements);
	loc = gl.getUniformLocation(lightingShader, "projection");
	gl.uniformMatrix4fv(loc, false, projection.elements);
	loc = gl.getUniformLocation(lightingShader, "u_Color");
	gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
	var loc = gl.getUniformLocation(lightingShader, "lightPosition");
	gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

	var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
	var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

	gl.uniformMatrix4fv(modelMatrixloc, false, matrix.elements);
	gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(matrix, view));

	gl.drawArrays(gl.TRIANGLES, 0, cylinder.numVertices);

	gl.useProgram(null);
}

// code to actually render our geometry
function draw()
{
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

	hubDummy.rotateZ(toRadians(50));
	bladeDummy.rotateZ(toRadians(50));

	// recursively render everything in the hierarchy
	turbineDummy.render(new THREE.Matrix4());
}

// entry point when page is loaded
function main() {

	sphere = getModelData(new THREE.SphereGeometry(1, 12, 6));

	cylinder = getModelData(new THREE.CylinderGeometry(1, 1, 1, 32));

    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // key handlers
    window.onkeypress = handleKeyPress;

    // create model data
    var cube = makeCube();

    // load and compile the shader pair
    lightingShader = createShaderProgram(gl, vLightingShaderSource, fLightingShaderSource);

	sphereBuffer = createAndLoadBuffer(sphere.vertices);
	sphereNormalBuffer = createAndLoadBuffer(sphere.vertexNormals);

	cylinderBuffer = createAndLoadBuffer(cylinder.vertices);
	cylinderNormalBuffer = createAndLoadBuffer(cylinder.vertexNormals);

    // load the vertex data into GPU memory
    vertexBuffer = createAndLoadBuffer(cube.vertices);

    // buffer for vertex normals
    vertexNormalBuffer = createAndLoadBuffer(cube.normals);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = function() {
	draw();
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();


}
