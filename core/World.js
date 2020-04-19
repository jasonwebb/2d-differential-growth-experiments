/** @module World */

let rbush = require('./node_modules/rbush'),
    toPath = require('./node_modules/svg-points/').toPath,
    saveAs = require('./node_modules/file-saver').saveAs,
    Defaults = require('./Defaults');

/** Manages a set of Paths and provides some global control mechanisms, such as pausing the simulation. */
class World {
  /**
   * Create a new World object
   * @param {object} p5 Reference to global p5.js instance
   * @param {object} [settings] Object containing local override Settings to be merged with Defaults
   * @param {array} [paths] Array of Path objects that belong to this World
   */
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

  /** Run a single "tick" of the simulation by iterating on all Paths */
  iterate() {
    this.prunePaths();
    this.buildTree();

    if (this.paths != undefined && this.paths instanceof Array && this.paths.length > 0 && !this.paused) {
      for (let path of this.paths) {
        path.iterate(this.tree);
      }
    }
  }

  /** Draw the background and all Paths */
  draw() {
    if (!this.traceMode) {
      this.drawBackground();
    }

    for (let path of this.paths) {
      path.draw();
    }
  }

  /** Draw the background to the canvas */
  drawBackground() {
    if(!this.invertedColors) {
      this.p5.background(255);
    } else {
      this.p5.background(0);
    }
  }

  /** Build an R-tree spatial index with all Nodes of all Paths in this World */
  buildTree() {
    this.tree.clear();

    for(let path of this.paths) {
      this.tree.load(path.nodes);
    }
  }

  /**
   * Add a new Path to the World from outside this class
   * @param {object} path Path object to add to this World
   */
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

  /**
   * Add multiple Path objects to this World
   * @param {array} paths
   */
  addPaths(paths) {
    for(let path of paths) {
      this.addPath(path);
    }
  }

  /** Add another snapshot to each Path */
  addToHistory() {
    if(!this.paused) {
      for(let path of this.paths) {
        path.addToHistory();
      }
    }
  }

  /** Remove any Paths that have gotten too small */
  prunePaths() {
    for(let i = 0; i < this.paths.length; i++) {
      if(this.paths[i].nodes.length <= 1) {
        this.paths.splice(i, 1);
      }
    }
  }

  /** Generate an SVG file using the current canvas contents and open up a download prompt on the user's machine */
  export() {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
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
    const svgDoctype = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
    const serializedSvg = (new XMLSerializer()).serializeToString(svg);
    const blob = new Blob([svgDoctype, serializedSvg], { type: 'image/svg+xml;' })
    saveAs(blob, 'differential-growth-' + Date.now() + '.svg');
  }

  /**
   * Create a new SVG path element from a provided set of Node objects
   * @param {array} nodes Array of Node objects
   * @param {boolean} isClosed Whether this path should be closed (true) or open (false)
   * @returns SVG path DOM node with a `d` attribute generated from the provided Nodes array.
   */
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

    let pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('style', 'fill: none; stroke: black; stroke-width: 1');

    return pathEl;
  }

  /** Remove all Paths from this World */
  clearPaths() {
    this.paths = [];
  }

  /** Pause the simulation */
  pause() {
    this.paused = true;
  }

  /** Unpause the simulation */
  unpause() {
    this.paused = false;
  }

  /**
   * Get the current state of the Nodes visibility flag
   * @returns {boolean} Current state of Node visibility flag
   */
  getDrawNodes() {
    return this.drawNodes;
  }

  /**
   * Get the current state of the debug mode flag
   * @returns {boolean} Current state of debug mode flag
   */
  getDebugMode() {
    return this.debugMode;
  }

  /**
   * Get the current state of the fill mode flag
   * @returns {boolean} Current state of the fill mode flag
   */
  getFillMode() {
    return this.fillMode;
  }

  /**
   * Get the current state of the history effect visibility flag
   * @returns {boolean} Current state of the history effect visibility flag
   */
  getDrawHistory() {
    return this.drawHistory;
  }

  /**
   * Get the current state of the Bounds visibility flag
   * @returns {boolean} Current state of the Bounds visibility flag
   */
  getDrawBounds() {
    return this.showBounds;
  }

  /**
   * Set the minimum distance that each Node wants to be from it's connected neighbors
   * @param {number} minDistance Distance that each Node wants to be from it's neighbors
   */
  setMinDistance(minDistance) {
    this.settings.MinDistance = minDistance;

    for(let path of this.paths) {
      path.setMinDistance(minDistance);
    }
  }

  /**
   * Set the maximum distance an edge can be before it is split
   * @param {number} maxDistance Distance between each Node
   */
  setMaxDistance(maxDistance) {
    this.settings.MaxDistance = maxDistance;

    for(let path of this.paths) {
      path.setMaxDistance(maxDistance);
    }
  }

  /**
   * Set the distance around each Node that it can affect other Nodes through repulsion
   * @param {number} repulsionRadius Distance around each Node
   */
  setRepulsionRadius(repulsionRadius) {
    this.settings.RepulsionRadius = repulsionRadius;

    for(let path of this.paths) {
      path.setRepulsionRadius(repulsionRadius);
    }
  }

  /**
   * Set the force scalar that is used when Nodes pull each other closer
   * @param {number} attractionForce Scalar value used for attraction force
   */
  setAttractionForce(attractionForce) {
    this.settings.AttractionForce = attractionForce;

    for(let path of this.paths) {
      path.setAttractionForce(attractionForce);
    }
  }

  /**
   * Set the force scalar that is used when Nodes are pushing others away
   * @param {number} repulsionForce Scalar value used for repulsion force
   */
  setRepulsionForce(repulsionForce) {
    this.settings.RepulsionForce = repulsionForce;

    for(let path of this.paths) {
      path.setRepulsionForce(repulsionForce);
    }
  }

  /**
   * Set the force scalar that is used when Nodes trying to align with their neighbors to reduce curvature
   * @param {number} alignmentForce Scalar value used for alignment force
   */
  setAlignmentForce(alignmentForce) {
    this.settings.AlignmentForce = alignmentForce;

    for(let path of this.paths) {
      path.setAlignmentForce(alignmentForce);
    }
  }

  /**
   * Set the state of the Node visibility flag
   * @param {boolean} state Next state for the Node visibility flag
   */
  setDrawNodes(state) {
    this.drawBackground();

    for (let path of this.paths) {
      path.drawNodes = state;
      path.draw();
    }

    this.drawNodes = state;
    this.settings.DrawNodes = state;
  }

  /**
   * Set the state of the "debug mode" flag
   * @param {boolean} state Next state for the "debug mode" flag
   */
  setDebugMode(state) {
    this.drawBackground();

    for (let path of this.paths) {
      path.debugMode = state;
      path.draw();
    }

    this.debugMode = state;
    this.settings.DebugMode = state;
  }

  /**
   * Set the state of the "fill mode" flag
   * @param {boolean} state Next state for the "fill mode" flag
   */
  setFillMode(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.fillMode = state;
      path.draw();
    }

    this.fillMode = state;
    this.settings.FillMode = state;
  }

  /**
   * Set the state of the "history" effect flag
   * @param {boolean} state Next state for the "history" effect flag
   */
  setDrawHistory(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.drawHistory = state;
      path.draw();
    }

    this.drawHistory = state;
    this.settings.DrawHistory = state;
  }

  /**
   * Set the state of the "trace mode" flag
   * @param {boolean} state Next state for the "trace mode" flag
   */
  setTraceMode(state) {
    this.traceMode = state;
    this.settings.TraceMode = state;
    this.drawBackground();

    for(let path of this.paths) {
      path.traceMode = state;
    }
  }

  /**
   * Set the state of the "invert colors" flag
   * @param {boolean} state Next state for the "invert colors" flag
   */
  setInvertedColors(state) {
    this.invertedColors = state;
    this.settings.InvertedColors = state;
    this.drawBackground();

    for(let path of this.paths) {
      path.invertedColors = state;
    }
  }

  /**
   * Set the state of the Bounds visibility flag
   * @param {boolean} state Next state for the Bounds visibility flag
   */
  setDrawBounds(state) {
    this.drawBackground();

    for(let path of this.paths) {
      path.showBounds = state;
      path.draw();
    }

    this.showBounds = state;
  }

  /** Toggle the state of the Node visibility flag */
  toggleDrawNodes() {
    this.setDrawNodes(!this.getDrawNodes());
  }

  /** Toggle the state of the "trace mode" effect flag */
  toggleTraceMode() {
    this.traceMode = !this.traceMode;
    this.drawBackground();

    for(let path of this.paths) {
      path.toggleTraceMode();
      path.draw();
    }
  }

  /** Toggle the state of the "invert colors" flag */
  toggleInvertedColors() {
    this.invertedColors = !this.invertedColors;

    this.drawBackground();

    for(let path of this.paths) {
      path.toggleInvertedColors();
      path.draw();
    }
  }

  /** Toggle the state of the "debug mode" flag */
  toggleDebugMode() {
    this.setDebugMode(!this.getDebugMode());
  }

  /** Toggle the state of the "fill mode" flag */
  toggleFillMode() {
    this.setFillMode(!this.getFillMode());
  }

  /** Toggle the state of the "history" effect flag */
  toggleDrawHistory() {
    this.setDrawHistory(!this.getDrawHistory());
  }

  /** Toggle the state of the Bounds visibility flag */
  toggleDrawBounds() {
    this.setDrawBounds(!this.getDrawBounds());
  }

  /** Toggle the pause/unpause state of the simulation */
  togglePause() {
    if(this.paused) {
      this.unpause();
    } else {
      this.pause();
    }
  }
}

module.exports = World;