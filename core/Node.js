/** @module Node */

let Vec2 = require('./node_modules/vec2'),
    Defaults = require('./Defaults');


/** 
 * Single point (node) within a Path, whose only job is to manage it's position and movement towards new position. 
 * @extends Vec2
 */
class Node extends Vec2 {
  /**
   * Create a new Node object
   * @param {object} p5 Reference to global instance of p5.js for drawing 
   * @param {number} x Initial X coordinate
   * @param {number} y Initial Y coordinate
   * @param {object} [settings] Object of local override Settings to merge with Defaults
   * @param {boolean} [isFixed] Whether or not this Node is allowed to move
   * @param {number} [minDistance] Minimum distance this Node wants to be to nearby Nodes
   * @param {number} [repulsionRadius] Radius around Node that will affect movement of other Nodes
   */
  constructor(p5, x, y, settings = Defaults, isFixed = false, minDistance, repulsionRadius) {
    super(x,y);

    this.p5 = p5;
    this.isFixed = isFixed;
    this.settings = Object.assign({}, Defaults, settings);

    this.velocity = 0;
    this.nextPosition = new Vec2(x, y);

    this.minDistance = minDistance || settings.MinDistance;
    this.repulsionRadius = repulsionRadius || settings.RepulsionRadius;
  }

  /** Moves Node by one "step */
  iterate() {
    if(!this.isFixed) {
      this.x = this.p5.lerp(this.x, this.nextPosition.x, this.settings.MaxVelocity);
      this.y = this.p5.lerp(this.y, this.nextPosition.y, this.settings.MaxVelocity);
    }
  }

  /** Draw this Node to the canvas */
  draw() {
    if (this.isFixed) {
      this.p5.ellipse(this.x, this.y, 20);
    } else {
      this.p5.ellipse(this.x, this.y, 5);
    }
  }
}

module.exports = Node;