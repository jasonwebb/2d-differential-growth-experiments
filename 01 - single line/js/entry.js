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
    restartWorld();
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();
  }
  
  // Create line
  function createLine() {
    let nodes = [];

    nodes.push(new Node(p5, 200, window.innerHeight / 2, Settings, true));
    nodes.push(new Node(p5, window.innerWidth - 200, window.innerHeight / 2, Settings, true));

    return nodes;
  }

  // Restart the simulation with a selected path type -------------------
  function restartWorld() {
    // Draw line
    world.clearPaths();
    world.addPath(new Path(p5, createLine(), Settings));

    // Draw the first frame, then pause
    world.drawBackground();
    world.draw();
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
        restartWorld();
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
        break;

      // Toggle debug mode with 'd'
      case 'd':
        world.toggleDebugMode()
        break;

      // Export SVG with 's'
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);