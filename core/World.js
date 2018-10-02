let rbush = require('./node_modules/rbush'),
    knn = require('./node_modules/rbush-knn'),
    Defaults = require('./Defaults');


/*
=============================================================================
  World class

  A World manages a set of Paths and provides some global control
  mechanisms, such as pausing the simulation.
=============================================================================
*/

class World {
  constructor(p5, settings = Defaults, paths = []) {
    this.p5 = p5;
    this.paths = paths;

    this.paused = false;
    this.settings = settings;

    this.traceMode = this.settings.TraceMode;
    this.drawNodes = this.settings.DrawNodes;
    this.debugMode = this.settings.DebugMode;
    this.invertedColors = this.settings.InvertedColors;
    this.fillMode = this.settings.FillMode;
    this.useBrownianMotion = this.settings.UseBrownianMotion;

    this.tree = rbush(9, ['.x','.y','.x','.y']);  // use custom accessor strings per https://github.com/mourner/rbush#data-format
    this.buildTree();
  }

  // Run a single tick for all paths -----------------
  iterate() {
    this.buildTree();

    if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0 && !this.paused) {
      for (let path of this.paths) {
        path.iterate(this.tree);
      }
    }
  }

  // Draw all paths ----------------------------------
  draw() {
    if (!this.paused) {
      if (!this.traceMode) {
        this.drawBackground();
      }

      for (let path of this.paths) {
        path.draw();
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

  // Build an R-tree spatial index with all paths ----
  buildTree() {
    this.tree.clear();
    
    for(let path of this.paths) {
      this.tree.load(path.nodes);
    }
  }

  // Add a new path to the world ---------------------
  addPath(path) {
    // Cascade all current World settings to new path
    path.drawNodes = this.drawNodes;
    path.debugMode = this.debugMode;
    path.fillMode = this.fillMode;
    path.useBrownianMotion = this.useBrownianMotion;
    path.setInvertedColors(this.invertedColors);
    path.setTraceMode(this.traceMode);

    this.paths.push(path);
  }

  addPaths(paths) {
    for(let path of paths) {
      this.addPath(path);
    }
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

  getDebugMode() {
    return this.debugMode;
  }

  getFillMode() {
    return this.fillMode;
  }

  // Setters -----------------------------------------
  setDrawNodes(state) {
    this.drawBackground();

    for (let path of this.paths) {
      path.drawNodes = state;
      path.draw();
    }

    this.drawNodes = state;
  }

  setDebugMode(state) {
    this.drawBackground();

    for (let path of this.paths) {
      path.debugMode = state;
      path.draw();
    }

    this.debugMode = state;
  }

  setFillMode(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.fillMode = state;
      path.draw();
    }

    this.fillMode = state;
  }

  // Toggles ----------------------------------
  toggleDrawNodes() {
    this.setDrawNodes(!this.getDrawNodes());
  }

  toggleTraceMode() {
    this.traceMode = !this.traceMode;
    this.drawBackground();

    for(let path of this.paths) {
      path.toggleTraceMode();
      path.draw();
    }
  }

  toggleInvertedColors() {
    this.invertedColors = !this.invertedColors;

    this.drawBackground();

    for(let path of this.paths) {
      path.toggleInvertedColors();
      path.draw();
    }
  }

  toggleDebugMode() {
    this.setDebugMode(!this.getDebugMode());
  }

  toggleFillMode() {
    this.setFillMode(!this.getFillMode());
  }
}

module.exports = World;