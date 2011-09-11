goog.provide('sylvester.Vector');


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
 * Class representation of a mathematical vector.
 * @constructor
 */
sylvester.Vector = function() {
};

/**
 * Returns element i of the vector.
 * @param {number} i Element index.
 * @return {number} The ith element.
 */
sylvester.Vector.prototype.e = function(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
};

/**
 * Returns the number of elements the vector has
 * @return {number} The vector dimension.
 */
sylvester.Vector.prototype.dimensions = function() {
    return this.elements.length;
};

/**
 * Returns the modulus ('length') of the vector
 * @return {number} The vector modulus.
 */
sylvester.Vector.prototype.modulus = function() {
    return Math.sqrt(this.dot(this));
};

/**
 * Returns true iff the vector is equal to the argument
 * @param {sylvester.Vector} vector The vector to test equality against.
 * @return {boolean} True if they are equal.
 */
sylvester.Vector.prototype.eql = function(vector) {
    var n = this.elements.length;
    var V = vector.elements || vector;
    if (n != V.length) {
        return false;
    }
    do {
        if (Math.abs(this.elements[n - 1] - V[n - 1]) > Sylvester.precision) {
            return false;
        }
    } while (--n);
    return true;
};

/**
 * Returns a copy of the vector
 * @return {sylvester.Vector} Duplicate of this vector.
 */
sylvester.Vector.prototype.dup = function() {
    return sylvester.Vector.create(this.elements);
};

/**
 * Maps the vector to another vector according to the given function.
 * @param {function(number, number)} fn The map function.
 * @return {sylvester.Vector} The result.
 */
sylvester.Vector.prototype.map = function(fn) {
    var elements = [];
    this.each(function(x, i) {
        elements.push(fn(x, i));
    });
    return sylvester.Vector.create(elements);
};

/**
 * Calls the iterator for each element of the vector in turn.
 * @param {function(number, number)} fn Iterator.
 */
sylvester.Vector.prototype.each = function(fn) {
    var n = this.elements.length, k = n, i;
    do {
        i = k - n;
        fn(this.elements[i], i + 1);
    } while (--n);
};

/**
 * Returns a new vector created by normalizing the receiver.
 * @return {sylvester.Vector} Unit vector form of this vector.
 */
sylvester.Vector.prototype.toUnitVector = function() {
    var r = this.modulus();
    if (r === 0) {
        return this.dup();
    }
    return this.map(function(x) {
        return x / r;
    });
};

/**
 *  Returns the angle between the vector and the argument (also a vector).
 * @param {sylvester.Vector} vector sylvester.sylvester.Vector to find the angle between.
 * @return {number} The angle between.
 */
sylvester.Vector.prototype.angleFrom = function(vector) {
    var V = vector.elements || vector;
    var n = this.elements.length, k = n, i;
    if (n != V.length) {
        return null;
    }
    var dot = 0, mod1 = 0, mod2 = 0;
    // Work things out in parallel to save time
    this.each(function(x, i) {
        dot += x * V[i - 1];
        mod1 += x * x;
        mod2 += V[i - 1] * V[i - 1];
    });
    mod1 = Math.sqrt(mod1);
    mod2 = Math.sqrt(mod2);
    if (mod1 * mod2 === 0) {
        return null;
    }
    var theta = dot / (mod1 * mod2);
    if (theta < -1) {
        theta = -1;
    }
    if (theta > 1) {
        theta = 1;
    }
    return Math.acos(theta);
};

/**
 * Returns true iff the vector is parallel to the argument.
 * @param {sylvester.Vector} vector Vector to test parallelism against.
 * @return {boolean} True if parallel.
 */
sylvester.Vector.prototype.isParallelTo = function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= Sylvester.precision);
};

/**
 * Returns true iff the vector is antiparallel to the argument.
 * @param {sylvester.Vector} vector Vector to test antiparallelism against.
 * @return {boolean} True of antiparallel.
 */
sylvester.Vector.prototype.isAntiparallelTo = function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
};

/**
 * Returns true iff the vector is perpendicular to the argument
 * @param {sylvester.Vector} vector Vector to test perpendicularism.
 * @return {boolean} True if perpendicular.
 */
sylvester.Vector.prototype.isPerpendicularTo = function(vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
};

/**
 * Returns the result of adding the argument to the vector.
 * @param {sylvester.Vector} vector Vector to add.
 * @return {sylvester.Vector} The added vector.
 */
sylvester.Vector.prototype.add = function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) {
        return null;
    }
    return this.map(function(x, i) {
        return x + V[i - 1];
    });
};

/**
 * Returns the result of subtracting the argument from the vector.
 * @param {sylvester.Vector} vector The vector to substract.
 * @return {sylvester.Vector} The subtracted vector.
 */
sylvester.Vector.prototype.subtract = function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) {
        return null;
    }
    return this.map(function(x, i) {
        return x - V[i - 1];
    });
};

/**
 * Returns the result of multiplying the elements of the vector by the argument
 * @param {number} k Scalar to multiply the vector by.
 * @return {sylvester.Vector} The multiplied vector.
 */
sylvester.Vector.prototype.multiply = function(k) {
    return this.map(function(x) {
        return x * k;
    });
};

/**
 * Multiplication short hand.
 * @param {number} k Scalar to multiply the vector by.
 * @return {sylvester.Vector} The multiplied vector.
 */
sylvester.Vector.prototype.x = function(k) {
    return this.multiply(k);
};


//

/**
 * Returns the scalar product of the vector with the argument
 * Both vectors must have equal dimensionality.
 * @param {sylvester.Vector} vector Vector to scalar product with.
 * @return {number} The scalar product;.
 */
sylvester.Vector.prototype.dot = function(vector) {
    var V = vector.elements || vector;
    var i, product = 0, n = this.elements.length;
    if (n != V.length) {
        return null;
    }
    do {
        product += this.elements[n - 1] * V[n - 1];
    } while (--n);
    return product;
};

//
/**
 * Returns the vector product of the vector with the argument
 * Both vectors must have dimensionality 3.
 * @param {sylvester.Vector} vector Vector to vector product with.
 * @return {sylvester.Vector} Vector product result.
 */
sylvester.Vector.prototype.cross = function(vector) {
    var B = vector.elements || vector;
    if (this.elements.length != 3 || B.length != 3) {
        return null;
    }
    var A = this.elements;
    return sylvester.Vector.create([
        (A[1] * B[2]) - (A[2] * B[1]),
        (A[2] * B[0]) - (A[0] * B[2]),
        (A[0] * B[1]) - (A[1] * B[0])
    ]);
};

/**
 * Returns the (absolute) largest element of the vector.
 * @return {number} the max element.
 */
sylvester.Vector.prototype.max = function() {
    var m = 0, n = this.elements.length, k = n, i;
    do {
        i = k - n;
        if (Math.abs(this.elements[i]) > Math.abs(m)) {
            m = this.elements[i];
        }
    } while (--n);
    return m;
};

/**
 * Returns the index of the first match found.
 * @param {number} x Element to search for.
 * @return {number} Index of first element found.
 */
sylvester.Vector.prototype.indexOf = function(x) {
    var index = null, n = this.elements.length, k = n, i;
    do {
        i = k - n;
        if (index === null && this.elements[i] == x) {
            index = i + 1;
        }
    } while (--n);
    return index;
};

/**
 * Returns a diagonal matrix with the vector's elements as its diagonal elements.
 * @return {sylvester.Matrix} Diagonal matrix based on this vector.
 */
sylvester.Vector.prototype.toDiagonalMatrix = function() {
    return sylvester.Matrix.Diagonal(this.elements);
};

/**
 * Returns the result of rounding the elements of the vector
 * @return {sylvester.Vector} Vector with rounded elements.
 */
sylvester.Vector.prototype.round = function() {
    return this.map(function(x) {
        return Math.round(x);
    });
};

/**
 * Returns a copy of the vector with elements set to the given value if they
 * differ from it by less than Sylvester.precision.
 * @param {number} x Number to set to if less than precision.
 * @return {sylvester.Vector} Snapped to vector.
 */
sylvester.Vector.prototype.snapTo = function(x) {
    return this.map(function(y) {
        return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
    });
};

/**
 * Returns the vector's distance from the argument, when considered as a point in space.
 * @param {*} obj Object to get the distance from.
 * @return {number} Distance from object.
 */
sylvester.Vector.prototype.distanceFrom = function(obj) {
    if (obj.anchor) {
        return obj.distanceFrom(this);
    }
    var V = obj.elements || obj;
    if (V.length != this.elements.length) {
        return null;
    }
    var sum = 0, part;
    this.each(function(x, i) {
        part = x - V[i - 1];
        sum += part * part;
    });
    return Math.sqrt(sum);
};

/**
 * Returns true if the vector is point on the given line.
 * @param {sylvester.Line} line sylvester.Line to compare to.
 * @return {boolean} True if the vector is a point on the line.
 */
sylvester.Vector.prototype.liesOn = function(line) {
    return line.contains(this);
};

/**
 * Return true iff the vector is a point in the given plane.
 * @param {sylvester.Pane} plane sylvester.Pane to test against.
 * @return {boolean} True if the vector is a point on the plane.
 */
sylvester.Vector.prototype.liesIn = function(plane) {
    return plane.contains(this);
};

/**
 * Rotates the vector about the given object. The object should be a
 * point if the vector is 2D, and a line if it is 3D. Be careful with line directions.
 * @param {number} t Radians around the object.
 * @param {*} obj The object to rotate around.
 * @return {sylvester.Vector} Rotated vector.
 */
sylvester.Vector.prototype.rotate = function(t, obj) {
    var V, R, x, y, z;
    switch (this.elements.length) {
        case 2:
            V = obj.elements || obj;
            if (V.length != 2) {
                return null;
            }
            R = sylvester.Matrix.Rotation(t).elements;
            x = this.elements[0] - V[0];
            y = this.elements[1] - V[1];
            return sylvester.Vector.create([
                V[0] + R[0][0] * x + R[0][1] * y,
                V[1] + R[1][0] * x + R[1][1] * y
            ]);
            break;
        case 3:
            if (!obj.direction) {
                return null;
            }
            var C = obj.pointClosestTo(this).elements;
            R = sylvester.Matrix.Rotation(t, obj.direction).elements;
            x = this.elements[0] - C[0];
            y = this.elements[1] - C[1];
            z = this.elements[2] - C[2];
            return sylvester.Vector.create([
                C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
                C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
                C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
            ]);
            break;
        default:
            return null;
    }
};

/**
 * Returns the result of reflecting the point in the given point, line or plane.
 * @param {*} obj Object to reflect against.
 * @return {sylvester.Vector} Reflected vector.
 */
sylvester.Vector.prototype.reflectionIn = function(obj) {
    if (obj.anchor) {
        // obj is a plane or line
        var P = this.elements.slice();
        var C = obj.pointClosestTo(P).elements;
        return sylvester.Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
        // obj is a point
        var Q = obj.elements || obj;
        if (this.elements.length != Q.length) {
            return null;
        }
        return this.map(function(x, i) {
            return Q[i - 1] + (Q[i - 1] - x);
        });
    }
};

/**
 * Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added.
 * @return {sylvester.Vector} Vector ensured to be 3D.
 */
sylvester.Vector.prototype.to3D = function() {
    var V = this.dup();
    switch (V.elements.length) {
        case 3:
            break;
        case 2:
            V.elements.push(0);
            break;
        default:
            return null;
    }
    return V;
};

/**
 * Returns a string representation of the vector.
 * @return {string} String representation.
 */
sylvester.Vector.prototype.inspect = function() {
    return '[' + this.elements.join(', ') + ']';
};

/**
 * Set vector's elements from an array.
 * @param {Array.<number>} els Elements to set of the vector.
 * @return {sylvester.Vector} This vector.
 */
sylvester.Vector.prototype.setElements = function(els) {
    this.elements = (els.elements || els).slice();
    return this;
};

/**
 * Constructor function.
 * @param {Array.<number>} elements Elements.
 * @return {sylvester.Vector} This vector.
 */
sylvester.Vector.create = function(elements) {
    var V = new sylvester.Vector();
    return V.setElements(elements);
};

// i, j, k unit vectors

/**
 * I sylvester.Vector.
 * @type {sylvester.Vector}
 */
sylvester.Vector.i = sylvester.Vector.create([1, 0, 0]);

/**
 * J sylvester.Vector.
 * @type {sylvester.Vector}
 */
sylvester.Vector.j = sylvester.Vector.create([0, 1, 0]);

/**
 * K sylvester.Vector.
 * @type {sylvester.Vector}
 */
sylvester.Vector.k = sylvester.Vector.create([0, 0, 1]);

/**
 * Random vector of size n.
 * @param {number} n Number of elements.
 * @return {sylvester.Vector} Randomized vector.
 */
sylvester.Vector.Random = function(n) {
    var elements = [];
    do {
        elements.push(Math.random());
    } while (--n);
    return sylvester.Vector.create(elements);
};

/**
 * Vector filled with zeros.
 * @param {number} n Number of elements.
 * @return {sylvester.Vector} Vector filled with zeroes.
 */
sylvester.Vector.Zero = function(n) {
    var elements = [];
    do {
        elements.push(0);
    } while (--n);
    return sylvester.Vector.create(elements);
};

/**
 * Flatten vector to array.
 * @return {Array.<number>} Array of numbers.
 */
sylvester.Vector.prototype.flatten = function() {
    return this.elements;
};

/**
 * Constructor function helper.
 * @param {Array.<number>} elements Elements.
 * @return {sylvester.Vector} This vector.
 */
var $V = sylvester.Vector.create;
