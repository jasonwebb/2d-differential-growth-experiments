let Node = require('../../../core/Node'),
    Path = require('../../../core/Path'),
    World = require('../../../core/World'),
    Settings = require('./Settings');

let world;

const TRIANGLE = 0,
      SQUARE = 1,
      CIRCLE = 2;
let currentPathType = TRIANGLE;


/*
=============================================================================
  Main sketch
=============================================================================
*/

const sketch = function (p5) {
  // Setup -------------------------------------------------------------
  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.colorMode(p5.HSB, 255);

    // Set up and start the simulation with a random shape
    world = new World(p5, Settings);
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

      nodes.push(
        new Node(
          p5,
          window.innerWidth / 2 + x,
          window.innerHeight / 2 + y,
          Settings
        )
      );
    }

    return nodes;
  }

  // Create nodes in a circle -------------------------------------------
  // Remember a circle on a computer is just a polygon with many sides!
  function createCircle() {
    return createPolygon(60, Settings.SeedRadius);
  }

  // Create three nodes to form an equilateral triangle -----------------
  function createTriangle() {
    return createPolygon(3, Settings.SeedRadius, 30);
  }

  // Create four nodes to form a square ---------------------------------
  function createSquare() {
    return createPolygon(4, Settings.SeedRadius, 45);
  }

  // Restart the simulation with a selected path type -------------------
  function restartWorldWith(pathType) {
    currentPathType = pathType;
    world.clearPaths();

    switch(pathType) {
      case TRIANGLE:
        world.addPath(new Path(p5, createTriangle(), Settings, true));
        break;
      case SQUARE:
        world.addPath(new Path(p5, createSquare(), Settings, true));
        break;
      case CIRCLE:
        world.addPath(new Path(p5, createCircle(), Settings, true));
        break;
    }

    // Draw the first frame, then pause
    world.drawBackground();
    world.draw();
    world.pause();

    // Restart simulation after 1s
    setTimeout(function() {
      world.unpause();
    }, 1000);
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

      // Toggle trace mode with 't'
      case 't':
        world.toggleTraceMode()
        break;

      // Toggle drawing of nodes with 'n'
      case 'n':
        world.setDrawNodes(!world.getDrawNodes());
        break;

      // Reset simulation with current parameters with 'r'
      case 'r':
        restartWorldWith(currentPathType);
        break;

      // Toggle pause with Space
      case ' ':
        world.paused = !world.paused;
        break;

      // Invert colors with 'i'
      case 'i':
        world.toggleInvertedColors();
        world.drawBackground();
        break;

      // Toggle debug mode with 'd'
      case 'd':
        world.toggleDebugMode()
        break;

      // Toggle fill for all shapes with 'f'
      case 'f':
        world.toggleFillMode();
        break;

      // Toggle path history with 'h'
      case 'h':
        world.toggleDrawHistory();
        break;

      // Export SVG with 's'
      case 's':
        world.export();
        break;
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);