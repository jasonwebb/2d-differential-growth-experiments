var Defaults = require('./Defaults');

/*
=============================================================================
  Node class

  DESCRIPTION:
  A Node is a single point on the canvas whose only job is to manage
  it's position and movement towards new position. 
=============================================================================
*/

class Node {
  constructor(p5, position, isFixed = false, settings = Defaults) {
    this.p5 = p5;
    this.position = position;
    this.isFixed = isFixed;

    this.velocity = 0;
    this.nextPosition = this.position;
    this.settings = settings;
  }

  // TODO: Add acceleration
  iterate() {
    this.position = p5.Vector.lerp(this.position, this.nextPosition, this.settings.MaxVelocity);
    // this.position = this.nextPosition;

    // if(this.velocity < Defaults.MaxVelocity) {
    //   this.velocity += Defaults.Acceleration;
    // }
  }

  draw() {
    if (this.isFixed) {
      this.p5.fill(255, 0, 0);
    } else {
      this.p5.fill(0);
    }

    if (this.isFixed) {
      this.p5.ellipse(this.position.x, this.position.y, 10);
    } else {
      this.p5.ellipse(this.position.x, this.position.y, 5);
    }
  }
}

module.exports = Node;