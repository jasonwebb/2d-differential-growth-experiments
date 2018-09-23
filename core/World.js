let Defaults = require('./Defaults');


/*
=============================================================================
  World class

  A World manages a set of Paths and provides some global control
  mechanisms, such as pausing the simulation.
=============================================================================
*/

class World {
  constructor(p5, paths = [], settings = Defaults) {
    this.p5 = p5;
    this.paths = paths;

    this.paused = false;
    this.settings = settings;

    this.traceMode = this.settings.TraceMode;
    this.drawNodes = this.settings.DrawNodes;
    this.debugMode = this.settings.DebugMode;
    this.invertedColors = this.settings.InvertedColors;
    this.fillMode = this.settings.FillMode;
  }

  // Run a single tick for all paths -----------------
  iterate() {
    if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0 && !this.paused) {
      for (let path of this.paths) {
        path.iterate();
      }
    }
  }

  // Draw all paths ----------------------------------
  draw() {
    if (!this.paused) {
      if (!this.traceMode) {
        this.drawBackground();
      }

      if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0) {
        for (let path of this.paths) {
          path.draw();
        }
      }
    }
  }

  // Draw the background -----------------------------
  drawBackground() {
    if(!this.invertedColors) {
      this.p5.background(255);
    } else {
      this.p5.background(0);
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

  // Pause the simulation ----------------------------
  pause() {
    this.paused = true;
  }

  // Unpause the simulation --------------------------
  unpause() {
    this.paused = false;
  }

  // Getters -----------------------------------------
  getDrawNodes() {
    return this.drawNodes;
  }

  getTraceMode() {
    return this.traceMode;
  }

  getInvertedColors() {
    return this.invertedColors;
  }

  getDebugMode() {
    return this.debugMode;
  }

  getFillMode() {
    return this.fillMode;
  }

  // Setters -----------------------------------------
  setDrawNodes(state) {
    for (let path of this.paths) {
      path.drawNodes = state;
    }

    this.drawNodes = state;
  }

  setTraceMode(state) {
    for (let path of this.paths) {
      path.traceMode = state;
    }

    this.traceMode = state;
  }

  setInvertedColors(state) {
    for (let path of this.paths) {
      path.invertedColors = state;
    }

    this.invertedColors = state;
  }

  setDebugMode(state) {
    for (let path of this.paths) {
      path.debugMode = state;
    }

    this.debugMode = state;
  }

  setFillMode(state) {
    for(let path of this.paths) {
      path.fillMode = state;
    }

    this.fillMode = state;
  }

  // Toggles ----------------------------------
  toggleDrawNodes() {
    this.setDrawNodes(!this.getDrawNodes());
  }

  toggleTraceMode() {
    this.setTraceMode(!this.getTraceMode());
  }

  toggleInvertedColors() {
    this.setInvertedColors(!this.getInvertedColors());
  }

  toggleDebugMode() {
    this.setDebugMode(!this.getDebugMode());
  }

  toggleFillMode() {
    this.setFillMode(!this.getFillMode());
  }
}

module.exports = World;