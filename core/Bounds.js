/** @module Bounds */

let inside = require('./node_modules/point-in-polygon');

/** A polygonal containment vessel of sorts for Paths that can constrain them to particular shapes */
class Bounds {
  /**
   * Create a new Bounds object
   * @param {object} p5 Reference to global instance of p5.js for drawing
   * @param {array} polygon Array of sequential points in the format of [polygon_n][x1][y1], ...  
   */
  constructor(p5, polygon) {
    this.p5 = p5;
    this.polygon = polygon;
  }

  /**
   * Test if a given point is within this Bounds polygon
   * @param {array} point Coordinates of point to test ([x,y])
   * @returns {boolean}
   */
  contains(point) {
    return inside(point, this.polygon);
  }

  /**
   * Draws this Bounds polygon to the canvas
   */
  draw() {
    this.p5.beginShape();

      for(let i = 0; i < this.polygon.length; i++) {
        this.p5.vertex(this.polygon[i][0], this.polygon[i][1]);
      }

      this.p5.vertex(this.polygon[0][0], this.polygon[0][1]);

    this.p5.endShape();
  }
}

module.exports = Bounds;