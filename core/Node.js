let Vec2 = require('./node_modules/vec2'),
    Defaults = require('./Defaults');

/*
=============================================================================
  Node class

  DESCRIPTION:
  A Node is a single point on the canvas whose only job is to manage
  it's position and movement towards new position. 
=============================================================================
*/

class Node extends Vec2 {
  constructor(p5, x, y, isFixed = false, settings = Defaults) {
    super(x,y);

    this.p5 = p5;
    this.isFixed = isFixed;
    this.settings = settings;

    this.velocity = 0;
    this.nextPosition = new Vec2(x, y);
  }

  // TODO: Add acceleration
  iterate() {
    this.x = this.p5.lerp(this.x, this.nextPosition.x, this.settings.MaxVelocity);
    this.y = this.p5.lerp(this.y, this.nextPosition.y, this.settings.MaxVelocity);
    
    // this.lerp(this.nextPosition, this.settings.MaxVelocity);
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
      this.p5.ellipse(this.x, this.y, 10);
    } else {
      this.p5.ellipse(this.x, this.y, 5);
    }
  }
}

module.exports = Node;