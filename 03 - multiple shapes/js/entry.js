let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Settings = require('./Settings');

let world;


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

    // Set up and start the simulation
    world = new World(p5, Settings);

    // Create random paths
    restartWorld();
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();
  }

  // Create any generalized equilateral polygon -------------------------
  function createPolygon(xOffset, yOffset, nodeCount, radius, rotation = 0) {
    let nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      let angle = 2 * Math.PI * i / nodeCount + p5.radians(rotation);
      let nodeX = Math.floor(radius * Math.cos(angle));
      let nodeY = Math.floor(radius * Math.sin(angle));

      nodes.push(
        new Node(
          p5, 
          window.innerWidth/2 + xOffset + nodeX, 
          window.innerHeight/2 + yOffset + nodeY,
          Settings
        )
      );
    }

    return nodes;
  }

  // Create nodes in a circle -------------------------------------------
  // Remember a circle on a computer is just a polygon with many sides!
  function createCircle(xOffset, yOffset, radius) {
    return createPolygon(xOffset, yOffset, 60, radius);
  }

  // Create three nodes to form an equilateral triangle -----------------
  function createTriangle(xOffset, yOffset, radius, rotation) {
    return createPolygon(xOffset, yOffset, 3, radius, rotation);
  }

  // Create four nodes to form a square ---------------------------------
  function createSquare(xOffset, yOffset, radius, rotation) {
    return createPolygon(xOffset, yOffset, 4, radius, rotation);
  }

  // Restart the simulation with a selected path type -------------------
  function restartWorld() {
    world.clearPaths();

    // Create a circle
    world.addPath(
      new Path(
        p5,
        createCircle(-window.innerWidth/6, 0, 150),
        Settings,
        true
      )
    );
    
    // Create a triangle
    world.addPath(
      new Path(
        p5,
        createTriangle(
          0,
          0,
          150,
          30
        ),
        Settings,
        true
      )
    );

    // Create a square
    world.addPath(
      new Path(
        p5,
        createSquare(
          window.innerWidth/6,
          0,
          150,
          45
        ),
        Settings,
        true
      )
    );

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
        restartWorld();
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

      // Export SVG with 's'
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);