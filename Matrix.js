goog.provide('sylvester.Matrix');

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
 * Class representing a mathematical Matrix
 */
Matrix = function() {
};

/**
 * Returns element (i,j) of the matrix.
 * @param {number} i Row.
 * @param {number} j Column.
 * @return {number} Element (i,j).
 */
Matrix.prototype.e = function(i, j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
        return null;
    }
    return this.elements[i - 1][j - 1];
};

/**
 * Returns row k of the matrix as a vector.
 * @param {number} i Row.
 * @return {Vector} Row as a vector.
 */
Matrix.prototype.row = function(i) {
    if (i > this.elements.length) {
        return null;
    }
    return Vector.create(this.elements[i - 1]);
};

/**
 * Returns column k of the matrix as a vector.
 * @param {number} j Column.
 * @return {Vector} Column as vector.
 */
Matrix.prototype.col = function(j) {
    if (j > this.elements[0].length) {
        return null;
    }
    var col = [], n = this.elements.length, k = n, i;
    do {
        i = k - n;
        col.push(this.elements[i][j - 1]);
    } while (--n);
    return Vector.create(col);
};

/**
 * Returns the number of rows/columns the matrix has
 * @return {Object.<string,number>} The dimensions {rows:<numrows>,cols:<numcols>}.
 */
Matrix.prototype.dimensions = function() {
    return {rows: this.elements.length, cols: this.elements[0].length};
};

/**
 * Returns the number of rows in the matrix.
 * @return {number} Number of rows.
 */
Matrix.prototype.rows = function() {
    return this.elements.length;
};

/**
 * Returns the number of columns in the matrix.
 * @return {number} Number of columns.
 */
Matrix.prototype.cols = function() {
    return this.elements[0].length;
};

/**
 * Returns true iff the matrix is equal to the argument. You can supply
 * a vector as the argument, in which case the receiver must be a
 * one-column matrix equal to the vector.
 * @param {Matrix} matrix Matrix to test equality.
 * @return {boolean} True if equal.
 */
Matrix.prototype.eql = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    if (this.elements.length != M.length ||
        this.elements[0].length != M[0].length) {
        return false;
    }
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do {
        i = ki - ni;
        nj = kj;
        do {
            j = kj - nj;
            if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) {
                return false;
            }
        } while (--nj);
    } while (--ni);
    return true;
};

/**
 * Returns a copy of the matrix
 * @return {Matrix} Duplicate of the matrix.
 */
Matrix.prototype.dup = function() {
    return Matrix.create(this.elements);
};

/**
 * Maps the matrix to another matrix (of the same dimensions) according to the given function.
 * @param {function(number,number,number)} fn Map function function(element,i,j).
 * @return {Matrix} Matrix created after map operation is applied.
 */
Matrix.prototype.map = function(fn) {
    var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do {
        i = ki - ni;
        nj = kj;
        els[i] = [];
        do {
            j = kj - nj;
            els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
        } while (--nj);
    } while (--ni);
    return Matrix.create(els);
};

/**
 * Returns true iff the argument has the same dimensions as the matrix.
 * @param {Matrix} matrix Matrix to compare size against.
 * @return {boolean} True if they are the same size.
 */
Matrix.prototype.isSameSizeAs = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    return (this.elements.length == M.length &&
        this.elements[0].length == M[0].length);
};

/**
 * Returns the result of adding the argument to the matrix.
 * @param {Matrix} matrix Matrix to add.
 * @return {Matrix} The resultant matrix.
 */
Matrix.prototype.add = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
        return null;
    }
    return this.map(function(x, i, j) {
        return x + M[i - 1][j - 1];
    });
};

/**
 * Returns the result of subtracting the argument from the matrix.
 * @param {Matrix} matrix Matrix to substract.
 * @return {Matrix} The resultant matrix.
 */
Matrix.prototype.subtract = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    if (!this.isSameSizeAs(M)) {
        return null;
    }
    return this.map(function(x, i, j) {
        return x - M[i - 1][j - 1];
    });
};

/**
 * Returns true iff the matrix can multiply the argument from the left.
 * @param {Matrix} matrix The matrix to test if can multiply.
 * @return {boolean} True if can multiply.
 */
Matrix.prototype.canMultiplyFromLeft = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    // this.columns should equal matrix.rows
    return (this.elements[0].length == M.length);
};

/**
 * Returns the result of multiplying the matrix from the right by the argument.
 * If the argument is a scalar then just multiply all the elements. If the argument is
 * a vector, a vector is returned, which saves you having to remember calling
 * col(1) on the result.
 * @param {Matrix} matrix The matrix to multily.
 * @return {Matrix} The resultant matrix.
 */
Matrix.prototype.multiply = function(matrix) {
    if (!matrix.elements) {
        return this.map(function(x) {
            return x * matrix;
        });
    }
    var returnVector = matrix.modulus ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    if (!this.canMultiplyFromLeft(M)) {
        return null;
    }
    var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    var cols = this.elements[0].length, elements = [], sum, nc, c;
    do {
        i = ki - ni;
        elements[i] = [];
        nj = kj;
        do {
            j = kj - nj;
            sum = 0;
            nc = cols;
            do {
                c = cols - nc;
                sum += this.elements[i][c] * M[c][j];
            } while (--nc);
            elements[i][j] = sum;
        } while (--nj);
    } while (--ni);
    var M = Matrix.create(elements);
    return returnVector ? M.col(1) : M;
};

/**
 * Shorthand for multiply.
 * @param {Matrix} matrix The matrix to multily.
 * @return {Matrix} The resultant matrix.
 */
Matrix.prototype.x = function(matrix) {
    return this.multiply(matrix);
};

/**
 * Returns a submatrix taken from the matrix
 * Argument order is: start row, start col, nrows, ncols
 * Element selection wraps if the required index is outside the matrix's bounds, so you could
 * use this to perform row/column cycling or copy-augmenting.
 * @param {number} startRow Starting row.
 * @param {number} startColumn Starting column.
 * @param {number} numberOfRows Number of rows to grab.
 * @param {number} numberOfColumns Number of columns to grab.
 * @return {Matrix} The resultant matrix.
 */
Matrix.prototype.minor = function(startRow, startColumn, numberOfRows, numberOfColumns) {
    var elements = [], ni = numberOfRows, i, nj, j;
    var rows = this.elements.length, cols = this.elements[0].length;
    do {
        i = numberOfRows - ni;
        elements[i] = [];
        nj = numberOfColumns;
        do {
            j = numberOfColumns - nj;
            elements[i][j] = this.elements[(startRow + i - 1) % rows][(startColumn + j - 1) % cols];
        } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
};

/**
 * Returns the transpose of the matrix.
 * @return {Matrix} The transpose of this matrix.
 */
Matrix.prototype.transpose = function() {
    var rows = this.elements.length, cols = this.elements[0].length;
    var elements = [], ni = cols, i, nj, j;
    do {
        i = cols - ni;
        elements[i] = [];
        nj = rows;
        do {
            j = rows - nj;
            elements[i][j] = this.elements[j][i];
        } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
};

/**
 * Returns true iff the matrix is square
 * @return {boolean} True if square matrix.
 */
Matrix.prototype.isSquare = function() {
    return (this.elements.length == this.elements[0].length);
};

/**
 * Returns the (absolute) largest element of the matrix
 * @return {number} The largest element in this matrix.
 */
Matrix.prototype.max = function() {
    var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do {
        i = ki - ni;
        nj = kj;
        do {
            j = kj - nj;
            if (Math.abs(this.elements[i][j]) > Math.abs(m)) {
                m = this.elements[i][j];
            }
        } while (--nj);
    } while (--ni);
    return m;
};

/**
 * Returns the index of the first match found by reading row-by-row from left to right.
 * @param {number} elementToFind Element to find.
 * @return {number} First index of matching element or -1.
 */
Matrix.prototype.indexOf = function(elementToFind) {
    var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do {
        i = ki - ni;
        nj = kj;
        do {
            j = kj - nj;
            if (this.elements[i][j] == elementToFind) {
                return {i: i + 1, j: j + 1};
            }
        } while (--nj);
    } while (--ni);
    return null;
};

/**
 * If the matrix is square, returns the diagonal elements as a vector.
 * Otherwise, returns null.
 * @return {Vector} The diagonal of this matrix as a vector.
 */
Matrix.prototype.diagonal = function() {
    if (!this.isSquare) {
        return null;
    }
    var els = [], n = this.elements.length, k = n, i;
    do {
        i = k - n;
        els.push(this.elements[i][i]);
    } while (--n);
    return Vector.create(els);
};

/**
 * Make the matrix upper (right) triangular by Gaussian elimination.
 * This method only adds multiples of rows to other rows. No rows are
 * scaled up or switched, and the determinant is preserved.
 * @return {Matrix} A upper right triangular form of this matrix.
 */
Matrix.prototype.toRightTriangular = function() {
    var M = this.dup(), els;
    var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
    do {
        i = k - n;
        if (M.elements[i][i] == 0) {
            for (j = i + 1; j < k; j++) {
                if (M.elements[j][i] != 0) {
                    els = [];
                    np = kp;
                    do {
                        p = kp - np;
                        els.push(M.elements[i][p] + M.elements[j][p]);
                    } while (--np);
                    M.elements[i] = els;
                    break;
                }
            }
        }
        if (M.elements[i][i] != 0) {
            for (j = i + 1; j < k; j++) {
                var multiplier = M.elements[j][i] / M.elements[i][i];
                els = [];
                np = kp;
                do {
                    p = kp - np;
                    // Elements with column numbers up to an including the number
                    // of the row that we're subtracting can safely be set straight to
                    // zero, since that's the point of this routine and it avoids having
                    // to loop over and correct rounding errors later
                    els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
                } while (--np);
                M.elements[j] = els;
            }
        }
    } while (--n);
    return M;
};

/**
 * Helper function to make the matrix upper (right) triangular by Gaussian elimination.
 * @return {Matrix} A upper right triangular form of this matrix.
 */
Matrix.prototype.toUpperTriangular = function() {
    return this.toRightTriangular();
};

/**
 * Returns the determinant for square matrices.
 * @return {number} The determinant.
 */
Matrix.prototype.determinant = function() {
    if (!this.isSquare()) {
        return null;
    }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
    do {
        i = k - n + 1;
        det = det * M.elements[i][i];
    } while (--n);
    return det;
};

/**
 * Helper function for the determinant.
 * @return {number} The determinant.
 */
Matrix.prototype.det = function() {
    return this.determinant();
};

/**
 * Returns true iff the matrix is singular.
 * @return {number} True if matrix is singular.
 */
Matrix.prototype.isSingular = function() {
    return (this.isSquare() && this.determinant() === 0);
};

/**
 * Returns the trace for square matrices.
 * @return {number} The trace.
 */
Matrix.prototype.trace = function() {
    if (!this.isSquare()) {
        return null;
    }
    var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
    do {
        i = k - n + 1;
        tr += this.elements[i][i];
    } while (--n);
    return tr;
};

/**
 * Helper function for finding the trace.
 * @return {number} The trace.
 */
Matrix.prototype.tr = function() {
    return this.trace();
};

/**
 * Returns the rank of the matrix.
 * @return {number} The rank of this matrix.
 */
Matrix.prototype.rank = function() {
    var M = this.toRightTriangular(), rank = 0;
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do {
        i = ki - ni;
        nj = kj;
        do {
            j = kj - nj;
            if (Math.abs(M.elements[i][j]) > Sylvester.precision) {
                rank++;
                break;
            }
        } while (--nj);
    } while (--ni);
    return rank;
};

/**
 * Helper function for returning rank.
 * @return {number} The rank of this matrix.
 */
Matrix.prototype.rk = function() {
    return this.rank();
};

/**
 * Returns the result of attaching the given argument to the right-hand side of the matrix.
 * @param {Matrix} matrix Matrix to augment with.
 * @return {Matrix} The resultant augmented matrix.
 */
Matrix.prototype.augment = function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') {
        M = Matrix.create(M).elements;
    }
    var T = this.dup(), cols = T.elements[0].length;
    var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    if (ni != M.length) {
        return null;
    }
    do {
        i = ki - ni;
        nj = kj;
        do {
            j = kj - nj;
            T.elements[i][cols + j] = M[i][j];
        } while (--nj);
    } while (--ni);
    return T;
};

/**
 * Returns the inverse (if one exists) using Gauss-Jordan
 * @return {Matrix} The inverse of this matrix.
 */
Matrix.prototype.inverse = function() {
    if (!this.isSquare() || this.isSingular()) {
        return null;
    }
    var ni = this.elements.length, ki = ni, i, j;
    var M = this.augment(Matrix.I(ni)).toRightTriangular();
    var np, kp = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do {
        i = ni - 1;
        // First, normalise diagonal elements to 1
        els = [];
        np = kp;
        inverse_elements[i] = [];
        divisor = M.elements[i][i];
        do {
            p = kp - np;
            new_element = M.elements[i][p] / divisor;
            els.push(new_element);
            // Shuffle of the current row of the right hand side into the results
            // array as it will not be modified by later runs through this loop
            if (p >= ki) {
                inverse_elements[i].push(new_element);
            }
        } while (--np);
        M.elements[i] = els;
        // Then, subtract this row from those above it to
        // give the identity matrix on the left hand side
        for (j = 0; j < i; j++) {
            els = [];
            np = kp;
            do {
                p = kp - np;
                els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
            } while (--np);
            M.elements[j] = els;
        }
    } while (--ni);
    return Matrix.create(inverse_elements);
};

/**
 * Helper function for getting an inverse.
 * @return {Matrix} The inverse of this matrix.
 */
Matrix.prototype.inv = function() {
    return this.inverse();
};

/**
 * Returns the result of rounding all the elements
 * @return {Matrix} The matrix with rounded element.
 */
Matrix.prototype.round = function() {
    return this.map(function(x) {
        return Math.round(x);
    });
};

/**
 * Returns a copy of the matrix with elements set to the given value if they
 * differ from it by less than Sylvester.precision.
 * @param {number} x The element to snap to.
 * @return {Matrix} The matrix with snapped to values.
 */
Matrix.prototype.snapTo = function(x) {
    return this.map(function(p) {
        return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
    });
};

/**
 * Returns a string representation of the matrix
 * @return {string} String form of a matrix.
 */
Matrix.prototype.inspect = function() {
    var matrix_rows = [];
    var n = this.elements.length, k = n, i;
    do {
        i = k - n;
        matrix_rows.push(Vector.create(this.elements[i]).inspect());
    } while (--n);
    return matrix_rows.join('\n');
};

/**
 * Set the matrix's elements from an array. If the argument passed
 * is a vector, the resulting matrix will be a single column.
 * @param {Array.<number>} els Elements.
 * @return {Matrix} This.
 */
Matrix.prototype.setElements = function(els) {
    var i, elements = els.elements || els;
    if (typeof(elements[0][0]) != 'undefined') {
        var ni = elements.length, ki = ni, nj, kj, j;
        this.elements = [];
        do {
            i = ki - ni;
            nj = elements[i].length;
            kj = nj;
            this.elements[i] = [];
            do {
                j = kj - nj;
                this.elements[i][j] = elements[i][j];
            } while (--nj);
        } while (--ni);
        return this;
    }
    var n = elements.length, k = n;
    this.elements = [];
    do {
        i = k - n;
        this.elements.push([elements[i]]);
    } while (--n);
    return this;
};

/**
 * Create a new matrix from elements.
 * @param {Array.<number>} elements Elements.
 * @return {Matrix} New Matrix.
 */
Matrix.create = function(elements) {
    var M = new Matrix();
    return M.setElements(elements);
};

/**
 * Identity matrix of size n.
 * @param {number} n Size of identity matrix.
 * @return {Matrix} Identity matrix.
 */
Matrix.I = function(n) {
    var els = [], k = n, i, nj, j;
    do {
        i = k - n;
        els[i] = [];
        nj = k;
        do {
            j = k - nj;
            els[i][j] = (i == j) ? 1 : 0;
        } while (--nj);
    } while (--n);
    return Matrix.create(els);
};

/**
 * Diagonal matrix - all off-diagonal elements are zero.
 * @param {Array.<number>} elements Elements to put along the diagonal.
 * @return {Matrix} Diagonal matrix.
 */
Matrix.Diagonal = function(elements) {
    var n = elements.length, k = n, i;
    var M = Matrix.I(n);
    do {
        i = k - n;
        M.elements[i][i] = elements[i];
    } while (--n);
    return M;
};

/**
 * Rotation matrix about some axis. If no axis is
 * supplied, assume we're after a 2D transform.
 * @param {number} theta Angle to rotate.
 * @param {Vector=} a Axis to rotate around.
 * @return {Matrix} Rotation matrix.
 */
Matrix.Rotation = function(theta, a) {
    if (!a) {
        return Matrix.create([
            [Math.cos(theta), -Math.sin(theta)],
            [Math.sin(theta), Math.cos(theta)]
        ]);
    }
    var axis = a.dup();
    if (axis.elements.length != 3) {
        return null;
    }
    var mod = axis.modulus();
    var x = axis.elements[0] / mod, y = axis.elements[1] / mod, z = axis.elements[2] / mod;
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
    // That proof rotates the co-ordinate system so theta
    // becomes -theta and sin becomes -sin here.
    return Matrix.create([
        [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
        [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
        [t * x * z - s * y, t * y * z + s * x, t * z * z + c]
    ]);
};

//Special case rotations

/**
 * Create an X rotation matrix.
 * @param {number} t Angle to rotate.
 * @return {Matrix} Rotation matrix.
 */
Matrix.RotationX = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
        [1, 0, 0],
        [0, c, -s],
        [0, s, c]
    ]);
};

/**
 * Create an Y rotation matrix.
 * @param {number} t Angle to rotate.
 * @return {Matrix} Rotation matrix.
 */
Matrix.RotationY = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
        [c, 0, s],
        [0, 1, 0],
        [-s, 0, c]
    ]);
};

/**
 * Create an Z rotation matrix.
 * @param {number} t Angle to rotate.
 * @return {Matrix} Rotation matrix.
 */
Matrix.RotationZ = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
        [c, -s, 0],
        [s, c, 0],
        [0, 0, 1]
    ]);
};

/**
 * Random matrix of n rows, m columns.
 * @param {number} n Number of rows.
 * @param {number} m Number of columns.
 * @return {Matrix} Random matrix.
 */
Matrix.Random = function(n, m) {
    return Matrix.Zero(n, m).map(
        function() {
            return Math.random();
        }
    );
};

/**
 * Matrix filled with zeros
 * @param {number} n Number of rows.
 * @param {number} m Number of columns.
 * @return {Matrix} Zero matrix.
 */
Matrix.Zero = function(n, m) {
    var els = [], ni = n, i, nj, j;
    do {
        i = n - ni;
        els[i] = [];
        nj = m;
        do {
            j = m - nj;
            els[i][j] = 0;
        } while (--nj);
    } while (--ni);
    return Matrix.create(els);
};


/**
 * Create a translation matrix.
 * @param {Vector} v Vector to translate by.
 * @return {Matrix} Translation matrix.
 */
Matrix.Translation = function(v) {
    if (v.elements.length == 2) {
        var r = Matrix.I(3);
        r.elements[2][0] = v.elements[0];
        r.elements[2][1] = v.elements[1];
        return r;
    }

    if (v.elements.length == 3) {
        var r = Matrix.I(4);
        r.elements[0][3] = v.elements[0];
        r.elements[1][3] = v.elements[1];
        r.elements[2][3] = v.elements[2];
        return r;
    }

    throw 'Invalid length for Translation';
};

/**
 * Flatten a matrix down to a 2D array.
 * @return {Array.<number>} Matrix as a 2d array.
 */
Matrix.prototype.flatten = function() {
    var result = [];
    if (this.elements.length == 0)
        return [];


    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
};

/**
 * Ensure that a matrix is 4x4.
 * @return {Matrix} This.
 */
Matrix.prototype.ensure4x4 = function() {
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

/**
 * Ensure that a matrix is 3x3.
 * @return {Matrix} This.
 */
Matrix.prototype.make3x3 = function() {
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([
        [this.elements[0][0], this.elements[0][1], this.elements[0][2]],
        [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
        [this.elements[2][0], this.elements[2][1], this.elements[2][2]]
    ]);
};

/**
 * Shorthand for matrix creation.
 * @param {Array.<number>} elements Elements.
 * @return {Matrix} New Matrix.
 */
var $M = Matrix.create;
