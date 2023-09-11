/**
 * @author Sullivan Fair
 */

/**
 * Represents an RGBA color. Values should normally be in the range [0.0, 1.0].
 * @constructor
 * @param {Number} r - red value (default 0.0)
 * @param {Number} g - green value (default 0.0)
 * @param {Number} b - blue value (default 0.0)
 * @param {Number} a - alpha value (default 1.0)
 */
function Color(r, g, b, a)
{
	this.r = (r ? r : 0.0);
	this.g = (g ? g : 0.0);
	this.b = (b ? b : 0.0);
	this.a = (a ? a : 1.0);
}

/**
 * Interpolates a color value within an isoceles triangle based on an
 * x, y offset from the lower left corner.  The base of the triangle is
 * always aligned with the bottom of the canvas.  Returns null if the given
 * offset does not lie within the triangle.
 * @param {Number} x - offset from left side
 * @param {Number} y - offset from bottom
 * @param {Number} base - base of triangle
 * @param {Number} height - height of triangle
 * @param {Color[]} colors - colors of the three corners, counterclockwise
 *   from lower left
 * @return {Color} interpolated color at offset (x, y)
 */
function findRGB(x, y, base, height, colors)
{
	const topVert =
	{
		x: base / 2,
		y: height
	}

	const botLeftVert =
	{
		x: 0,
		y: 0
	}

	const botRightVert =
	{
		x: base,
		y: 0
	}

	const point =
	{
		x,
		y
	}

	const denom = (((botLeftVert.y - botRightVert.y) * (topVert.x - botRightVert.x))
				  + 
				  ((botRightVert.x - botLeftVert.x) * (topVert.y - botRightVert.y)));

	const w1 = (((botLeftVert.y - botRightVert.y) * (point.x - botRightVert.x))
			   + ((botRightVert.x - botLeftVert.x) * (point.y - botRightVert.y))) / denom;

	const w2 = (((botRightVert.y - topVert.y) * (point.x - botRightVert.x))
			   + ((topVert.x - botRightVert.x) * (point.y - botRightVert.y))) / denom;

	const w3 = 1 - w1 - w2;

	let r = ((w1 * colors[8]) + (w2 * colors[0]) + (w3 * colors[4])) / (w1 + w2 + w3);
	let g = ((w1 * colors[9]) + (w2 * colors[1]) + (w3 * colors[5])) / (w1 + w2 + w3);
	let b = ((w1 * colors[10]) + (w2 * colors[2]) + (w3 * colors[6])) / (w1 + w2 + w3);;

	return [r, g, b, 1];
}
