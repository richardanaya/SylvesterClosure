goog.provide('sylvester.Plane');
goog.require('sylvester.Vector');

/**
 * === Sylvester ===
 * Vector and Matrix mathematics modules for JavaScript
 * Copyright (c) 2007 James Coglan
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
 * A class representing a mathematical plane.
 * @constructor
 */
sylvester.Pane = function() {
};


/**
 * Returns true iff the plane occupies the same space as the argument.
 * @param {sylvester.Pane} plane sylvester.Pane to test equality.
 * @return {boolean} True if equal.
 */
sylvester.Pane.prototype.eql = function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
};

/**
 * Returns a copy of the plane
 * @return {sylvester.Pane} A duplicate of this plane.
 */
sylvester.Pane.prototype.dup = function() {
    return sylvester.Pane.create(this.anchor, this.normal);
};

/**
 * Returns the result of translating the plane by the given vector.
 * @param {sylvester.Vector} vector sylvester.Vector to translate plane by.
 * @return {sylvester.Pane} A translated plane.
 */
sylvester.Pane.prototype.translate = function(vector) {
    var V = vector.elements || vector;
    return sylvester.Pane.create([
        this.anchor.elements[0] + V[0],
        this.anchor.elements[1] + V[1],
        this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
};

/**
 * Returns true iff the plane is parallel to the argument. Will return true
 * if the planes are equal, or if you give a line and it lies in the plane.
 * @param {*} obj Object to test parallelism to.
 * @return {boolean} True if parallel to.
 */
sylvester.Pane.prototype.isParallelTo = function(obj) {
    var theta;
    if (obj.normal) {
        // obj is a plane
        theta = this.normal.angleFrom(obj.normal);
        return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
        // obj is a line
        return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
};

/**
 * Returns true iff the receiver is perpendicular to the argument.
 * @param {sylvester.Pane} plane sylvester.Pane to test perpendicularity to.
 * @return {boolean} True if perpendicular.
 */
sylvester.Pane.prototype.isPerpendicularTo = function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI / 2 - theta) <= Sylvester.precision);
};

/**
 * Returns the plane's distance from the given object (point, line or plane).
 * @param {*} obj Object to get distance from.
 * @return {number} Distance from object.
 */
sylvester.Pane.prototype.distanceFrom = function(obj) {
    if (this.intersects(obj) || this.contains(obj)) {
        return 0;
    }
    if (obj.anchor) {
        // obj is a plane or line
        var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
        return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
        // obj is a point
        var P = obj.elements || obj;
        var A = this.anchor.elements, N = this.normal.elements;
        return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
};

/**
 * Returns true iff the plane contains the given point or line.
 * @param {*} obj Object to see if contained in this plane.
 * @return {boolean} True if object is contained.
 */
sylvester.Pane.prototype.contains = function(obj) {
    if (obj.normal) {
        return null;
    }
    if (obj.direction) {
        return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
        var P = obj.elements || obj;
        var A = this.anchor.elements, N = this.normal.elements;
        var diff = Math.abs(N[0] * (A[0] - P[0]) + N[1] * (A[1] - P[1]) + N[2] * (A[2] - (P[2] || 0)));
        return (diff <= Sylvester.precision);
    }
};

/**
 * Returns true iff the plane has a unique point/line of intersection with the argument.
 * @param {*} obj Object to test intersection with.
 * @return {boolean} True if object intersects.
 */
sylvester.Pane.prototype.intersects = function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') {
        return null;
    }
    return !this.isParallelTo(obj);
};

/**
 * Returns the unique intersection with the argument, if one exists. The result
 * will be a vector if a line is supplied, and a line if a plane is supplied.
 * @param {*} obj Object to get the intersection with.
 * @return {*} Intersection with object.
 */
sylvester.Pane.prototype.intersectionWith = function(obj) {
    if (!this.intersects(obj)) {
        return null;
    }
    if (obj.direction) {
        // obj is a line
        var A = obj.anchor.elements, D = obj.direction.elements,
            P = this.anchor.elements, N = this.normal.elements;
        var multiplier = (N[0] * (P[0] - A[0]) + N[1] * (P[1] - A[1]) + N[2] * (P[2] - A[2])) / (N[0] * D[0] + N[1] * D[1] + N[2] * D[2]);
        return sylvester.Vector.create([A[0] + D[0] * multiplier, A[1] + D[1] * multiplier, A[2] + D[2] * multiplier]);
    } else if (obj.normal) {
        // obj is a plane
        var direction = this.normal.cross(obj.normal).toUnitVector();
        // To find an anchor point, we find one co-ordinate that has a value
        // of zero somewhere on the intersection, and remember which one we picked
        var N = this.normal.elements, A = this.anchor.elements,
            O = obj.normal.elements, B = obj.anchor.elements;
        var solver = sylvester.Matrix.Zero(2, 2), i = 0;
        while (solver.isSingular()) {
            i++;
            solver = sylvester.Matrix.create([
                [N[i % 3], N[(i + 1) % 3]],
                [O[i % 3], O[(i + 1) % 3]]
            ]);
        }
        // Then we solve the simultaneous equations in the remaining dimensions
        var inverse = solver.inverse().elements;
        var x = N[0] * A[0] + N[1] * A[1] + N[2] * A[2];
        var y = O[0] * B[0] + O[1] * B[1] + O[2] * B[2];
        var intersection = [
            inverse[0][0] * x + inverse[0][1] * y,
            inverse[1][0] * x + inverse[1][1] * y
        ];
        var anchor = [];
        for (var j = 1; j <= 3; j++) {
            // This formula picks the right element from intersection by
            // cycling depending on which element we set to zero above
            anchor.push((i == j) ? 0 : intersection[(j + (5 - i) % 3) % 3]);
        }
        return sylvester.Line.create(anchor, direction);
    }
};

/**
 * Returns the point in the plane closest to the given point.
 * @param {sylvester.Vector} point Point to get closest point to.
 * @return {sylvester.Vector} Point on plane closest to point.
 */
sylvester.Pane.prototype.pointClosestTo = function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return sylvester.Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
};

/**
 * Returns a copy of the plane, rotated by t radians about the given line
 * See notes on Line#rotate.
 * @param {number} t Radians around the line.
 * @param {sylvester.Line} line sylvester.Line to rotate about.
 * @return {sylvester.Pane} The rotated plane.
 */
sylvester.Pane.prototype.rotate = function(t, line) {
    var R = sylvester.Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return sylvester.Pane.create([
        C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
        C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
        C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
        R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
        R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
        R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
};

/**
 * Returns the reflection of the plane in the given point, line or plane.
 * @param {*} obj Object to reflect against.
 * @return {sylvester.Pane} The reflected plane.
 */
sylvester.Pane.prototype.reflectionIn = function(obj) {
    if (obj.normal) {
        // obj is a plane
        var A = this.anchor.elements, N = this.normal.elements;
        var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
        var newA = this.anchor.reflectionIn(obj).elements;
        // Add the plane's normal to its anchor, then mirror that in the other plane
        var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
        var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
        var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
        return sylvester.Pane.create(newA, newN);
    } else if (obj.direction) {
        // obj is a line
        return this.rotate(Math.PI, obj);
    } else {
        // obj is a point
        var P = obj.elements || obj;
        return sylvester.Pane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
};

/**
 * Sets the anchor point and normal to the plane. If three arguments are specified,
 * the normal is calculated by assuming the three points should lie in the same plane.
 * If only two are sepcified, the second is taken to be the normal. Normal vector is
 * normalised before storage.
 * @param {Array.<number>} anchor The anchor of the plane.
 * @param {Array.<number>} v1 See notes.
 * @param {Array.<number>=} v2 See notes.
 * @return {sylvester.Pane} This plane.
 */
sylvester.Pane.prototype.setVectors = function(anchor, v1, v2) {
    anchor = sylvester.Vector.create(anchor);
    anchor = anchor.to3D();
    if (anchor === null) {
        return null;
    }
    v1 = sylvester.Vector.create(v1);
    v1 = v1.to3D();
    if (v1 === null) {
        return null;
    }
    if (typeof(v2) == 'undefined') {
        v2 = null;
    } else {
        v2 = sylvester.Vector.create(v2);
        v2 = v2.to3D();
        if (v2 === null) {
            return null;
        }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
        var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
        normal = sylvester.Vector.create([
            (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
            (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
            (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
        ]);
        mod = normal.modulus();
        if (mod === 0) {
            return null;
        }
        normal = sylvester.Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
        mod = Math.sqrt(v11 * v11 + v12 * v12 + v13 * v13);
        if (mod === 0) {
            return null;
        }
        normal = sylvester.Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
};

/**
 * Constructor function.
 * @param {Array.<number>} anchor The anchor of the plane.
 * @param {Array.<number>} v1 See notes.
 * @param {Array.<number>=} v2 See notes.
 * @return {sylvester.Pane} This plane.
 */
sylvester.Pane.create = function(anchor, v1, v2) {
    var P = new sylvester.Pane();
    return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes

/**
 * XY Pane
 * @type {sylvester.Pane}
 */
sylvester.Pane.XY = sylvester.Pane.create(sylvester.Vector.Zero(3), sylvester.Vector.k);

/**
 * YZ Plane
 * @type {sylvester.Pane}
 */
sylvester.Pane.YZ = sylvester.Pane.create(sylvester.Vector.Zero(3), sylvester.Vector.i);

/**
 * ZX Plane
 * @type {sylvester.Pane}
 */
sylvester.Pane.ZX = sylvester.Pane.create(sylvester.Vector.Zero(3), sylvester.Vector.j);

/**
 * YX Plane
 * @type {sylvester.Pane}
 */
sylvester.Pane.YX = sylvester.Pane.XY;

/**
 * ZY Plane
 * @type {sylvester.Pane}
 */
sylvester.Pane.ZY = sylvester.Pane.YZ;

/**
 * XZ Plane
 * @type {sylvester.Pane}
 */
sylvester.Pane.XZ = sylvester.Pane.ZX;

/**
 * Constructor function helper.
 * @param {Array.<number>} anchor The anchor of the plane.
 * @param {Array.<number>} v1 See notes.
 * @param {Array.<number>=} v2 See notes.
 * @return {sylvester.Pane} This plane.
 */
var $P = sylvester.Pane.create;
