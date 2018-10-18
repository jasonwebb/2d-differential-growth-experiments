let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Bounds = require('../../core/Bounds'),
    Settings = require('./Settings');

let world;

const SQUARE = 0,
      CIRCLE = 1,
      MAZE = 2,
      TEXT = 3;
let currentBoundsType = SQUARE;

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
    p5.rectMode(p5.CENTER);

    // Set up and start the simulation
    world = new World(p5, Settings);

    restartWorldWith(currentBoundsType);
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();

    drawFrame();
  }
  
  function drawFrame() {
    p5.noFill();

    if(world.invertedColors) {
      p5.stroke(255);
    } else {
      p5.stroke(0);
    }

    p5.rect(window.innerWidth/2, window.innerHeight/2, 900 - 100, 900 - 100);
  }

  // Restart the simulation with a provided constraint type -------------------
  function restartWorldWith(boundsType) {
    world.clearPaths();

    currentBoundsType = boundsType;

    let cx = window.innerWidth/2;
    let cy = window.innerHeight/2;

    switch(currentBoundsType) {
      case SQUARE:
        // Create the bounds object
        let bounds = createPolygonPath(40, 200);

        // Create a path and pass bounds to it
        let path = createPolygonPath(3, 100);
        path.setBounds(new Bounds(p5, bounds.toArray()));

        world.addPath(path);
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

  // Create a generalized equilateral polygon
  function createPolygonPath(nodeCount, radius, rotation = 0) {
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

    let path = new Path(p5, nodes, Settings, true);

    return path;
  }

  
  /*
  =============================================================================
    Key handler
  =============================================================================
  */
  p5.keyReleased = function() {
    switch (p5.key) {
      // Toggle trace mode with 't'
      case 't':
        world.toggleTraceMode()
        break;
  
      // Toggle drawing of nodes with 'n'
      case 'n':
        world.toggleDrawNodes();
        break;
    
      // Reset simulation with current parameters with 'r'
      case 'r':
        restartWorldWith(currentBoundsType);
        break;

      // Toggle pause with Space
      case ' ':
        world.paused = !world.paused;
        break;

      // Invert colors with 'i'
      case 'i':
        world.toggleInvertedColors();
        drawFrame();
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

      // Toggle visibility of all bounds for all paths with 'b'
      case 'b':
        world.toggleDrawBounds();
        break;
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);