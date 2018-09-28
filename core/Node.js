let Vec2 = require('./node_modules/vec2'),
    Defaults = require('./Defaults');

/*
=============================================================================
  Node class

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

  iterate() {
    if(!this.isFixed) {
      this.x = this.p5.lerp(this.x, this.nextPosition.x, this.settings.MaxVelocity);
      this.y = this.p5.lerp(this.y, this.nextPosition.y, this.settings.MaxVelocity);
    }
  }

  draw() {
    if (this.isFixed) {
      this.p5.ellipse(this.x, this.y, 20);
    } else {
      this.p5.ellipse(this.x, this.y, 5);
    }
  }
}

module.exports = Node;