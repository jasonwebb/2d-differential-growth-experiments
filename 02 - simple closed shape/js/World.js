let Settings = require('./Settings');


/*
=============================================================================
  World class

  DESCRIPTION:
  A World manages a set of Paths and provides some global control
  mechanisms, such as pausing the simulation.
=============================================================================
*/

class World {
  constructor(p5, paths = []) {
    this.p5 = p5;
    this.paths = paths;

    this.paused = false;
    this.traceMode = Settings.TraceMode;
    this.drawNodes = Settings.DrawNodes;
  }

  // Run a single tick for all paths ----------------
  iterate() {
    if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0 && !this.paused) {
      for (let path of this.paths) {
        path.iterate();
      }
    }
  }

  // Draw all paths ---------------------------------
  draw() {
    if (!this.paused) {
      if (!this.traceMode) {
        this.p5.background(255);
      }

      if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0) {
        if (this.traceMode) {
          this.p5.stroke(0, 0, 0, 2);
        } else {
          this.p5.stroke(0, 0, 0, 255);
        }

        for (let path of this.paths) {
          path.draw(this.drawNodes);
        }
      }
    }
  }

  // Add a new path to the world ---------------------
  addPath(path) {
    this.paths.push(path);
  }

  // Remove all paths from the world -----------------
  clearPaths() {
    this.paths = [];
  }
}

module.exports = World;