let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Settings = require('./Settings'),
    {SVGPathData, SVGPathDataTransformer, SVGPathDataEncoder, SVGPathDataParser} = require('../../core/node_modules/svg-pathdata');

let world;

const DIFFERENTIAL_GROWTH = 'differential-growth',
      HELLO_WORLD_SERIF = 'hello-world-serif',
      SUPERFORMULA = 'superformula';
let currentFile = HELLO_WORLD_SERIF;

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

    // Set up world and begin simulation
    world = new World(p5, Settings);
    restartWorld();
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();

    // Draw canvas bounds for alignment with video recording software
    p5.noFill();
    p5.stroke(0);
    p5.rect(window.innerWidth/2 - 1, window.innerHeight/2 - 1, 900 - 100, 900 - 100);
  }

  // Restart the simulation ---------------------------------------------
  function restartWorld() {
    world.clearPaths();

    // Load the default SVG file
    let svg = document.getElementById(currentFile);
    let inputPaths = svg.contentDocument.querySelectorAll('path');
    let currentPath = new Path(p5, [], Settings, true);

    // Scrape all points from all points, and record breakpoints
    for(let [pathIndex, inputPath] of inputPaths.entries()) {
      let pathData = new SVGPathData(inputPath.getAttribute('d'));

      let previousCoords = {
        x: 0,
        y: 0
      };

      for(let command of pathData.commands) {
        switch(command.type) {
          // Move ('M') and line ('L') commands have both X and Y
          case SVGPathData.MOVE_TO:
          case SVGPathData.LINE_TO:
            currentPath.addNode(new Node(p5, command.x, command.y, Settings));
            break;

          // Horizontal line ('H') commands only have X, using previous command's Y
          case SVGPathData.HORIZ_LINE_TO:
          currentPath.addNode(new Node(p5, command.x, previousCoords.y, Settings));
            break;

          // Vertical line ('V') commands only have Y, using previous command's X
          case SVGPathData.VERT_LINE_TO:
            currentPath.addNode(new Node(p5, previousCoords.x, command.y, Settings));
            break;

          // ClosePath ('Z') commands are a naive indication that the current path can be processed and added to the world
          case SVGPathData.CLOSE_PATH:
            switch(currentFile) {
              case DIFFERENTIAL_GROWTH:
                currentPath.scale(2.5);
                currentPath.moveTo(window.innerWidth/2 - 440, window.innerHeight/2 - 300);
                break;

              case HELLO_WORLD_SERIF:
                currentPath.scale(2.25);
                currentPath.moveTo(window.innerWidth/2 - 300, window.innerHeight/2 - 410);
                break;
            }

            // Add path to the world
            world.addPath(currentPath);

            // Set up a new empty Path for the next loop iterations
            currentPath = new Path(p5, [], Settings, true);
            currentPath.setInvertedColors(true);
            break;
        }

        // Capture X coordinate, if there was one
        if(command.hasOwnProperty('x')) {
          previousCoords.x = command.x;
        }

        // Capture Y coordinate, if there was one
        if(command.hasOwnProperty('y')) {
          previousCoords.y = command.y;
        }
      }

      // The superformula file does not have a ClosePath ('Z'), so we have to make do by watching for last iteration for now
      if(currentFile == SUPERFORMULA && pathIndex == inputPaths.length - 1) {
        currentPath.scale(.7);
        currentPath.moveTo(280, 150);
        world.addPath(currentPath);
        currentPath = new Path(p5, [], Settings, true);
      }
    }
    
    // Draw the first frame, then pause
    world.drawBackground();
    world.draw();
    world.pause();

    // Unpause simulation after 1s
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
      // Switch to first SVG with '1'
      case '1':
        currentFile = HELLO_WORLD_SERIF;
        restartWorld();
        break;

      // Switch to second SVG with '2'
      case '2':
        currentFile = DIFFERENTIAL_GROWTH;
        restartWorld();
        break;

      // Switch to third SVG with '3'
      case '3':
        currentFile = SUPERFORMULA;
        restartWorld();
        break;

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
      case 's':
        world.export();
        break;
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);