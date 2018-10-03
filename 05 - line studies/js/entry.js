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
    p5.rectMode(p5.CENTER);

    // Set up and start the simulation
    world = new World(p5, Settings);

    // Create random paths
    restartWorld();
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();

    // Draw canvas bounds for alignment with video recording software
    p5.noFill();
    p5.stroke(0);
    p5.rect(window.innerWidth/2, window.innerHeight/2, 900 - 100, 900 - 100);
  }

  function createLines(rows, columns, rowSpacing, columnSpacing, xDelta, yDelta) {
    let totalWidth = columnSpacing * columns;
    let totalHeight = rowSpacing * rows;

    for(let i = 0; i < rows; i++) {       // rows
      for(let j = 0; j < columns; j++) {  // columns
        let nodes = [];

        // Lower left node
        nodes.push(
          new Node(
            p5, 
            (j * columnSpacing) + (window.innerWidth / 2) - (totalWidth / 2), 
            (i * rowSpacing) + (window.innerHeight / 2) - (totalHeight / 2) + rowSpacing/2, 
            Settings
          )
        );

        // Upper right node
        nodes.push(
          new Node(
            p5, 
            (j * columnSpacing) + (window.innerWidth / 2) + xDelta - (totalWidth / 2),
            (i * rowSpacing) + (window.innerHeight / 2) + yDelta - (totalHeight / 2) + rowSpacing/2, 
            Settings
          )
        );

        // Construct path and add to world
        world.addPath(
          new Path(
            p5, 
            nodes, 
            Settings
          )
        );
      }
    }
  }

  function createHorizontalLines(rows, columns) {
    createLines(rows, columns, 20, 45, 30, 0);
  }

  function createVerticalLines(rows, columns) {
    createLines(rows, columns, 38, 20, 0, 30);
  }

  function createAngledLines(rows, columns) {
    createLines(rows, columns, 38, 20, -30, 30);
  }

  // Restart the simulation with a selected path type -------------------
  function restartWorld() {
    world.clearPaths();

    // Create a field of lines
    // createAngledLines(10, 10);
    createVerticalLines(10, 30);
    // createHorizontalLines(30, 10);

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
        world.toggleDrawNodes();
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