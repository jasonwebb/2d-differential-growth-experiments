let Node = require('./Node'),
    Path = require('./Path'),
    World = require('./World'),
    Settings = require('./Settings');

let world, path;

const TRIANGLE = 0,
      SQUARE = 1,
      CIRCLE = 2;
let currentPathType = CIRCLE;


/*
=============================================================================
  Main sketch
=============================================================================
*/

const sketch = function (p5) {
  // Setup -------------------------------------------------------------
  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    // p5.frameRate(1);
    // p5.noLoop();

    // Create path using nodes
    world = new World(p5);
    restartWorldWith(currentPathType);
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();
  }

  // Create any generalized equilateral polygon -------------------------
  function createPolygon(nodeCount, radius, rotation = 0) {
    let nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      let angle = 2 * Math.PI * i / nodeCount + p5.radians(rotation);
      let x = Math.floor(radius * Math.cos(angle));
      let y = Math.floor(radius * Math.sin(angle));

      nodes.push(new Node(p5, p5.createVector(window.innerWidth / 2 + x, window.innerHeight / 2 + y)));
    }

    return nodes;
  }

  // Create nodes in a circle -------------------------------------------
  // Remember a circle on a computer is just a polygon with many sides!
  function createCircle() {
    return createPolygon(11, 100);
  }

  // Create three nodes to form an equilateral triangle -----------------
  function createTriangle() {
    return createPolygon(3, 100, 30);
  }

  // Create four nodes to form a square ---------------------------------
  function createSquare() {
    return createPolygon(4, 100, 45);
  }

  // Restart the simulation with a selected path type -------------------
  function restartWorldWith(pathType) {
    currentPathType = pathType;
    world.clearPaths();

    switch(pathType) {
      case TRIANGLE:
        world.addPath(new Path(p5, createTriangle(), true));
        break;
      case SQUARE:
        world.addPath(new Path(p5, createSquare(), true));
        break;
      case CIRCLE:
        world.addPath(new Path(p5, createCircle(), true));
        break;
    }
  }


  /*
  =============================================================================
    Key handler
  =============================================================================
  */
  p5.keyReleased = function() {
    switch (p5.key) {
      // Restart simulation with a triangle path
      case '1':
        restartWorldWith(TRIANGLE);
        break;

      // Restart simulation with a square path
      case '2':
        restartWorldWith(SQUARE);
        break;

      // Restart simulation with a circle path
      case '3':
        restartWorldWith(CIRCLE);
        break;

      // Pause/unpause the world with 'p'
      case 'p':
        world.paused = !world.paused;
        break;
  
      // Toggle trace mode with 't'
      case 't':
        world.traceMode = !world.traceMode;
        restartWorldWith(currentPathType);
        break;
  
      // Toggle drawing of nodes with 'n'
      case 'n':
        world.drawNodes = !world.drawNodes;
        break;
    
      // Reset simulation with 'r'
      // Toggle debug mode with 'd'
      // Export SVG with 's'
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);