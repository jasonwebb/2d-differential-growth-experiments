let inside = require('./node_modules/point-in-polygon');

class Bounds {
  constructor(p5, polygon) {
    this.p5 = p5;
    this.polygon = polygon;
  }

  contains(point) {
    return inside(point, this.polygon);
  }

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