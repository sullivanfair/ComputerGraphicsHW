/**
 * @author Sullivan Fair
 */

const vshaderSource = `
    uniform mat4 transform;
    attribute vec4 a_Position;
    void main()
    {
        gl_Position = transform * a_Position;
    }
`;

const fshaderSource = `
    precision mediump float;
    uniform vec4 color;
    void main()
    {
        gl_FragColor = color;
    }
`;

var numPoints = 3;
var vertices = new Float32Array([
    0.0, 0.0,
    0.3, 0.0,
    0.3, 0.3
]);

var gl;
var vertexbuffer;
var shader;

function draw(modelElements)
{
    gl.useProgram(shader);

    var positionIndex = gl.getAttribLocation(shader, 'a_Position');
    if(positionIndex < 0)
    {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    gl.enableVertexAttribArray(positionIndex);
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var colorLoc = gl.getUniformLocation(shader, 'color');
    gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0);

    var transformLoc = gl.getUniformLocation(shader, 'transform');
    gl.uniformMatrix4fv(transformLoc, false, new THREE.Matrix4().elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(transformLoc, false, modelElements);

    gl.drawArrays(gl.TRIANGLES, 0, numPoints);

    gl.disableVertexAttribArray(positionIndex);
    gl.useProgram(null);
}

function main()
{
    gl = getGraphicsContext('theCanvas');

    shader = createShaderProgram(gl, vshaderSource, fshaderSource);
    vertexbuffer = createAndLoadBuffer(vertices);

    gl.clearColor(0.0, 0.8, 0.8, 1.0);

    let r = new THREE.Matrix4();

    let theta = 0;
    const radio = 0.75;
    const increment = toRadians(1);
    let degree = 0;

    var animate = function()
    {
        gl.clear(gl.COLOR_BUFFER_BIT);

        const x = radio * Math.cos(theta);
        const y = radio * Math.sin(theta);

        let m = new THREE.Matrix4().makeScale(0.5, 3.0, 1.0);
        m.premultiply(r.makeRotationZ(toRadians(degree += 4)));
        m.premultiply(new THREE.Matrix4().makeTranslation(x, y, 0.0));

        draw(m.elements);

        m.multiply(new THREE.Matrix4().makeRotationZ(toRadians(180)));
        draw(m.elements);
        if(toDegrees(theta) > 360)
        {
            theta = 0;
        }
        else
        {
            theta += increment;
        }

        requestAnimationFrame(animate);
    }

    animate();
}