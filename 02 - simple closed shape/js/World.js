/*
=============================================================================
  World class

  DESCRIPTION:
  A World manages a set of Paths and provides some global control
  mechanisms, such as pausing the simulation.
=============================================================================
*/

class World {
  constructor(p5, paths) {
    this.p5 = p5;
    this.paths = paths;
    this.originalPaths = paths;

    this.paused = false;
    this.traceMode = false;
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
          path.draw();
        }
      }
    }
  }

  addPath(path) {
    this.paths.push(path);
    console.log(this.paths);
  }

  clearPaths() {
    this.paths = [];
  }

  restart() {
    this.clearPaths();
    for (let path of this.originalPaths) {
      this.addPath(path);
    }
  }
}

module.exports = World;