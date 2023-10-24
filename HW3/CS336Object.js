/**
 * @author Sullivan Fair
 */

/**
 * Encapsulation of scale, rotation, and position of a 3D object.
 * The object's transformation matrix is defined as the product of
 * three transformations based on position * rotation * scale.
 */
var CS336Object = function()
{

  // Position of this object.
  this.position = new THREE.Vector3();

  // Rotation matrix.
  // The three columns of this matrix are the x, y, and z axes
  // of the object's current frame
  this.rotation = new THREE.Matrix4();

  // Scale for this object.
  this.scale = new THREE.Vector3(1, 1, 1);

  // The object's current transformation, to be calculated
  // as translate * rotate * scale.  Note that the matrix is saved
  // on call to getMatrix, to avoid recalculation at every frame unless needed.
  // Be sure to set the matrixNeedsUpdate flag whenever position, rotation, or
  // scale is changed.
  this.matrix = null;
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the position.
 * @param x
 * @param y
 * @param z
 */
CS336Object.prototype.setPosition = function(x, y, z)
{
  this.position = new THREE.Vector3(x, y, z);
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the scale.
 * @param x
 * @param y
 * @param z
 */
CS336Object.prototype.setScale = function(x, y, z)
{
  this.scale = new THREE.Vector3(x, y, z);
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the current rotation matrix to the given one.
 */
CS336Object.prototype.setRotation = function(rotationMatrix)
{
  this.rotation = new THREE.Matrix4().copy(rotationMatrix);
  this.matrixNeedsUpdate = true;
};

/**
 * Returns the current transformation matrix, defined as
 * translate * rotate * scale.
 */
CS336Object.prototype.getMatrix = function()
{
  // this method will get called every frame, so only recalculate the
  // matrix if necessary
  if (this.matrixNeedsUpdate)
  {
    // compose the scale, rotation, and translation components
    // and cache the resulting matrix
    var px, py, pz, sx, sy, sz;
    px = this.position.x;
    py = this.position.y;
    pz = this.position.z;
    sx = this.scale.x;
    sy = this.scale.y;
    sz = this.scale.z;

    this.matrix = new THREE.Matrix4().makeTranslation(px, py, pz)
        .multiply(this.rotation)
        .multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
    this.matrixNeedsUpdate = false;

  }
  return this.matrix;
};

/**
 * Moves the CS336Object along its negative z-axis by the given amount.
 */
CS336Object.prototype.moveForward = function(distance)
{
  this.position.x += -distance * this.rotation.elements[8];
  this.position.y += -distance * this.rotation.elements[9];
  this.position.z += -distance * this.rotation.elements[10];
  this.matrixNeedsUpdate = true;
};

/**
 * Moves the CS336Object along its positive z-axis by the given amount.
 */
CS336Object.prototype.moveBack = function(distance)
{
  this.moveForward(-distance);
};

/**
 * Moves the CS336Object along its positive x-axis by the given amount.
 */
CS336Object.prototype.moveRight = function(distance)
{
  this.position.x += -distance * this.rotation.elements[0];
  this.position.y += -distance * this.rotation.elements[1];
  this.position.z += -distance * this.rotation.elements[2];
  this.matrixNeedsUpdate = true;
};

/**
 * Moves the CS336Object along its negative x-axis by the given amount.
 */
CS336Object.prototype.moveLeft = function(distance)
{
  this.moveRight(-distance);
};

/**
 * Moves the CS336Object along its own y-axis by the given amount.
 */
CS336Object.prototype.moveUp = function(distance)
{
  this.position.x += -distance * this.rotation.elements[4];
  this.position.y += -distance * this.rotation.elements[5];
  this.position.z += -distance * this.rotation.elements[6];
  this.matrixNeedsUpdate = true;
};

/**
 * Moves the CS336Object along its own negative y-axis by the given amount.
 */
CS336Object.prototype.moveDown = function(distance)
{
  this.moveUp(-distance);
};

/**
 * Rotates the CS336Object ccw about its x-axis.
 */
CS336Object.prototype.rotateX = function(degrees)
{
  var radians = toRadians(degrees);
  this.rotation = new THREE.Matrix4().makeRotationAxis({x: 1, y: 0, z: 0,},
    radians).multiply(this.rotation);
  this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object ccw about its y-axis.
 */
CS336Object.prototype.rotateY = function(degrees)
{
  var radians = toRadians(degrees);
  this.rotation = new THREE.Matrix4().makeRotationAxis({x: 0, y: 1, z: 0,},
    radians).multiply(this.rotation);
  this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object ccw about its z-axis.
 */
CS336Object.prototype.rotateZ = function(degrees)
{
  var radians = toRadians(degrees);
  this.rotation = new THREE.Matrix4().makeRotationAxis({x: 0, y: 0, z: 1,},
    radians).multiply(this.rotation);
  this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object ccw about the given axis, specified as a vector.
 */
CS336Object.prototype.rotateOnAxis = function(degrees, x, y, z)
{
  var radians = toRadians(degrees);
  this.rotation.premultiply(new THREE.Matrix4().makeRotationAxis({x, y, z}, radians)); 
  this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object ccw about the given axis, specified in terms of
 * pitch and head angles (as in spherical coordinates).
 */
CS336Object.prototype.rotateOnAxisEuler = function(degrees, pitch, head)
{
  var m = new THREE.Matrix4()
    .makeRotationAxis({
      x: 0,
      y: 1,
      z: 0
    }, toRadians(head))
    .makeRotationAxis({
      x: 1,
      y: 0,
      z: 0
    }, toRadians(pitch))
    .makeRotationAxis({
      x: 0,
      y: 1,
      z: 0
    }, toRadians(degrees))
    .makeRotationAxis({
      x: 1,
      y: 0,
      z: 0
    }, toRadians(-pitch))
    .makeRotationAxis({
      x: 0,
      y: 1,
      z: 0
    }, toRadians(-head))

    this.setRotation(m.multiply(this.rotation));
    this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object counterclockwise about an axis through its center that is
 * parallel to the vector (0, 1, 0).
 */
CS336Object.prototype.turnLeft = function(degrees)
{
  var radians = toRadians(degrees);
  this.rotation.premultiply(new THREE.Matrix4().makeRotationY(radians));
  this.matrixNeedsUpdate = true;
};

/**
 * Rotates the CS336Object clockwise about an axis through its center that is
 * parallel to the vector (0, 1, 0).
 */
CS336Object.prototype.turnRight = function(degrees)
{
  this.turnLeft(-degrees);
};

/**
 * Performs a counterclockwise rotation about this object's
 * x-axis.
 */
CS336Object.prototype.lookUp = function(degrees)
{
   this.rotateX(degrees);
};

/**
 * Performs a clockwise rotation about this object's
 * x-axis.
 */
CS336Object.prototype.lookDown = function(degrees)
{
  this.lookUp(-degrees);
};


/**
 * Moves the CS336Object the given number of degrees along a great circle. The axis
 * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
 * negative z-axis the given distance in front of the CS336Object. (This operation is
 * equivalent to a moveForward, lookDown and then moveBack.
 */
CS336Object.prototype.orbitUp = function(degrees, distance)
{
  this.moveForward(distance);
  this.rotateX(degrees);
  this.moveBack(distance);
  this.matrixNeedsUpdate = true;
};

/**
 * Moves the CS336Object the given number of degrees along a great circle. The axis
 * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
 * negative z-axis the given distance in front of the CS336Object. (This operation is
 * equivalent to a moveForward, lookUp and then moveBack.
 */
CS336Object.prototype.orbitDown = function(degrees, distance)
{
  this.orbitUp(-degrees, distance);
};

/**
 * Moves the CS336Object the given number of degrees around a circle of latitude. The
 * axis of rotation is parallel to the world up vector and intersects the
 * CS336Object's negative z-axis the given distance in front of the CS336Object. (This
 * operation is equivalent to a moveForward, turnLeft, and moveBack.)
 */
CS336Object.prototype.orbitRight = function(degrees, distance)
{
  this.moveForward(distance);
  this.turnLeft(degrees);
  this.moveBack(distance);
  this.matrixNeedsUpdate = true;
};

/**
 * Moves the CS336Object the given number of degrees around a circle of latitude. The
 * axis of rotation is parallel to the world up vector and intersects the
 * CS336Object's negative z-axis the given distance in front of the CS336Object. (This
 * operation is equivalent to a moveForward, turnRight, and moveBack.)
 */
CS336Object.prototype.orbitLeft = function(degrees, distance)
{
  this.orbitRight(-degrees, distance);
};

/**
 * Orients the CS336Object at its current location to face the given position
 * using (0, 1, 0) as the up-vector.  That is, the given position will lie along
 * the object's negative z-axis, and this object's x-axis will be
 * parallel to the world x-z plane.  See the documentation for lookAt() in
 * THREE.Matrix4.
 */
CS336Object.prototype.lookAt = function(x, y, z)
{
  this.rotation = new THREE.Matrix4().lookAt(
    new THREE.Vector3(0.0, 0.0, 0.0),
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(0, 1, 0)
  );
  this.matrixNeedsUpdate = true;
};
