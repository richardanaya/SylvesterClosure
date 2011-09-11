goog.provide('sylvester');
goog.require('sylvester.Line');
goog.require('sylvester.Matrix');
goog.require('sylvester.Plane');
goog.require('sylvester.Vector');

/**
 * @preserve === Sylvester ===
 * Vector and Matrix mathematics modules for JavaScript
 * Copyright (c) 2007 James Coglan.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 *  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Modified by Richard Anaya for Google Closure compilation.
 */

/**
 * A static class representing sylvester variables and helper functions
 */
var Sylvester = {};

/**
 * The version number of sylvester
 * @type {string}
 */
Sylvester.version = '0.1.3';

/**
 * A variable used for determining the precision of our math we use
 */
Sylvester.precision = 1e-6;

/**
 * Convert a matrix to an html formated string. Useful for quick print outs.
 * @param {sylvester.Matrix} m The input matrix.
 * @return {string} The html string.
 */
Sylvester.matrixToHtml = function(m) {
    var s = '';
    if (m.length == 16) {
        for (var i = 0; i < 4; i++) {
            s += "<span style='font-family: monospace'>[" + m[i * 4 + 0].toFixed(4) + ',' + m[i * 4 + 1].toFixed(4) + ',' + m[i * 4 + 2].toFixed(4) + ',' + m[i * 4 + 3].toFixed(4) + ']</span><br>';
        }
    } else if (m.length == 9) {
        for (var i = 0; i < 3; i++) {
            s += "<span style='font-family: monospace'>[" + m[i * 3 + 0].toFixed(4) + ',' + m[i * 3 + 1].toFixed(4) + ',' + m[i * 3 + 2].toFixed(4) + ']</font><br>';
        }
    } else {
        return m.toString();
    }
    return s;
};

/**
 * Helper function for making a lookout matrix similar to the functionality of gluLookAt.
 * @param {number} ex TO BE FIXED.
 * @param {number} ey TO BE FIXED.
 * @param {number} ez TO BE FIXED.
 * @param {number} cx TO BE FIXED.
 * @param {number} cy TO BE FIXED.
 * @param {number} cz TO BE FIXED.
 * @param {number} ux TO BE FIXED.
 * @param {number} uy TO BE FIXED.
 * @param {number} uz TO BE FIXED.
 * @return {sylvester.Matrix} The look at matrix.
 */
Sylvester.makeLookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    var eye = $V([ex, ey, ez]);
    var center = $V([cx, cy, cz]);
    var up = $V([ux, uy, uz]);

    var mag;

    var z = eye.subtract(center).toUnitVector();
    var x = up.cross(z).toUnitVector();
    var y = z.cross(x).toUnitVector();

    var m = $M([
        [x.e(1), x.e(2), x.e(3), 0],
        [y.e(1), y.e(2), y.e(3), 0],
        [z.e(1), z.e(2), z.e(3), 0],
        [0, 0, 0, 1]
    ]);

    var t = $M([
        [1, 0, 0, -ex],
        [0, 1, 0, -ey],
        [0, 0, 1, -ez],
        [0, 0, 0, 1]
    ]);
    return m.x(t);
};

/**
 * Make a perspective matrix similar to the functionality of gluPerspective.
 * @param {number} fovy TO BE FIXED.
 * @param {number} aspect TO BE FIXED.
 * @param {number} znear TO BE FIXED.
 * @param {number} zfar TO BE FIXED.
 * @return {sylvester.Matrix} The perspective matrix.
 */
Sylvester.makePerspective = function(fovy, aspect, znear, zfar) {
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
};

/**
 * Make a frustrum matrix similar to the functionality of glFrustum.
 * @param {number} left TO BE FIXED.
 * @param {number} right TO BE FIXED.
 * @param {number} bottom TO BE FIXED.
 * @param {number} top TO BE FIXED.
 * @param {number} znear TO BE FIXED.
 * @param {number} zfar TO BE FIXED.
 * @return {sylvester.Matrix} The frustum matrix.
 */
Sylvester.makeFrustum = function(left, right, bottom, top, znear, zfar) {
    var X = 2 * znear / (right - left);
    var Y = 2 * znear / (top - bottom);
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(zfar + znear) / (zfar - znear);
    var D = -2 * zfar * znear / (zfar - znear);

    return $M([
        [X, 0, A, 0],
        [0, Y, B, 0],
        [0, 0, C, D],
        [0, 0, -1, 0]
    ]);
};

/**
 * Make an orthographic projection matrix similar to the functionality of glOrtho.
 * @param {number} left TO BE FIXED.
 * @param {number} right TO BE FIXED.
 * @param {number} bottom TO BE FIXED.
 * @param {number} top TO BE FIXED.
 * @param {number} znear TO BE FIXED.
 * @param {number} zfar TO BE FIXED.
 * @return {sylvester.Matrix} The orthographic projection matrix.
 */
Sylvester.makeOrtho = function(left, right, bottom, top, znear, zfar) {
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return $M([
        [2 / (right - left), 0, 0, tx],
        [0, 2 / (top - bottom), 0, ty],
        [0, 0, -2 / (zfar - znear), tz],
        [0, 0, 0, 1]
    ]);
};
