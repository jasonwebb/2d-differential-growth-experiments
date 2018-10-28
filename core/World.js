let rbush = require('./node_modules/rbush'),
    toPath = require('./node_modules/svg-points/').toPath,
    saveAs = require('./node_modules/file-saver').saveAs,
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
    this.settings = Object.assign({}, Defaults, settings);

    this.traceMode = this.settings.TraceMode;
    this.drawNodes = this.settings.DrawNodes;
    this.debugMode = this.settings.DebugMode;
    this.invertedColors = this.settings.InvertedColors;
    this.fillMode = this.settings.FillMode;
    this.drawHistory = this.settings.DrawHistory;
    this.useBrownianMotion = this.settings.UseBrownianMotion;
    this.showBounds = this.settings.ShowBounds;

    this.tree = rbush(9, ['.x','.y','.x','.y']);  // use custom accessor strings per https://github.com/mourner/rbush#data-format
    this.buildTree();
    
    // Begin capturing path history
    let _this = this;
    setInterval(function() {
      _this.addToHistory(); 
    }, this.settings.HistoryCaptureInterval);
  }

  // Run a single tick for all paths -----------------
  iterate() {
    this.prunePaths();
    this.buildTree();

    if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0 && !this.paused) {
      for (let path of this.paths) {
        path.iterate(this.tree);
      }
    }
  }

  // Draw all paths ----------------------------------
  draw() {
    if (!this.traceMode) {
      this.drawBackground();
    }

    for (let path of this.paths) {
      path.draw();
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

  addToHistory() {
    if(!this.paused) {
      for(let path of this.paths) {
        path.addToHistory();
      }
    }
  }

  // Clean up (remove) any paths that have gotten too small
  prunePaths() {
    for(let i = 0; i < this.paths.length; i++) {
      if(this.paths[i].nodes.length <= 1) {
        this.paths.splice(i, 1);
      }
    }
  }

  // Export an SVG and force a download prompt -----------------
  export() {
    let svg = document.createElement('svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);

    // Add a <path> node for every Path in this World
    for(let path of this.paths) {

      // If history is enabled, create a new <path> node for each snapshot
      if(this.drawHistory) {
        for(let nodes of path.nodeHistory) {
          svg.appendChild( this.createPathElFromNodes(nodes, path.isClosed) );
        }
      }

      svg.appendChild( this.createPathElFromNodes(path.nodes), path.isClosed );
    }

    // Force download of SVG based on https://jsfiddle.net/ch77e7yh/1
    let svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
    let svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
    svgDoc.replaceChild(svg, svgDoc.documentElement);
    let svgData = (new XMLSerializer()).serializeToString(svgDoc);

    let blob = new Blob([svgData.replace(/></g, '>\n\r<')]);
    saveAs(blob, 'differential-growth-' + Date.now() + '.svg');
  }

  // Create and return a new SVG <path> element from a given set of nodes
  createPathElFromNodes(nodes, isClosed) {
    let pointsString = '';

    for(let [index, node] of nodes.entries()) {
      pointsString += node.x + ',' + node.y;

      if(index < nodes.length - 1) {
        pointsString += ' ';
      }
    }

    let d = toPath({
      type: 'polyline',
      points: pointsString
    });

    if(isClosed) {
      d += ' Z';
    }

    let pathEl = document.createElement('path');
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('style', 'fill: none; stroke: black; stroke-width: 1');

    return pathEl;
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

  getDrawHistory() {
    return this.drawHistory;
  }

  getDrawBounds() {
    return this.showBounds;
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

  setDrawHistory(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.drawHistory = state;
      path.draw();
    }

    this.drawHistory = state;
  }

  setDrawBounds(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.showBounds = state;
      path.draw();
    }

    this.showBounds = state;
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

  toggleDrawHistory() {
    this.setDrawHistory(!this.getDrawHistory());
  }

  toggleDrawBounds() {
    this.setDrawBounds(!this.getDrawBounds());
  }

  togglePause() {
    if(this.paused) {
      this.unpause();
    } else {
      this.pause();
    }
  }
}

module.exports = World;