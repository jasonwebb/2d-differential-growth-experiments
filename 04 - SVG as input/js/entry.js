let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Settings = require('./Settings'),
    {SVGPathData, SVGPathDataTransformer, SVGPathDataEncoder, SVGPathDataParser} = require('../../core/node_modules/svg-pathdata');

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

    // Set up world and begin simulation
    world = new World(p5, Settings);
    restartWorld();
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();

    // Draw canvas bounds for alignment with video recording software
    // p5.noFill();
    // p5.stroke(200);
    // p5.rect(window.innerWidth/2 - 1, window.innerHeight/2 - 1, 720 + 2, 900 + 4);
  }

  // Restart the simulation ---------------------------------------------
  function restartWorld() {
    world.clearPaths();

    // Load the default SVG file
    let svg = document.getElementById('differential-growth');
    let inputPaths = svg.contentDocument.querySelectorAll('path');
    let currentPath = new Path(p5, [], Settings, true);

    // Scrape all points from all points, and record breakpoints
    for(let i = 0; i < 4; i++) {
      for(let inputPath of inputPaths) {
        let pathData = new SVGPathData(inputPath.getAttribute('d'));

        let previousCoords = {
          x: 500,
          y: 500
        };

        for(let command of pathData.commands) {
          switch(command.type) {
            case SVGPathData.MOVE_TO:
            case SVGPathData.LINE_TO:
              currentPath.addNode(new Node(p5, command.x, command.y, Settings));
              break;
            case SVGPathData.HORIZ_LINE_TO:
            currentPath.addNode(new Node(p5, command.x, previousCoords.y, Settings));
              break;
            case SVGPathData.VERT_LINE_TO:
              currentPath.addNode(new Node(p5, previousCoords.x, command.y, Settings));
              break;
            case SVGPathData.CLOSE_PATH:
              currentPath.scale(2.25);
              currentPath.moveTo(window.innerWidth/2 - 400, i*210 - 70);
              world.addPath(currentPath);
              currentPath = new Path(p5, [], Settings, true);
              break;
          }

          if(command.hasOwnProperty('x')) {
            previousCoords.x = command.x;
          }

          if(command.hasOwnProperty('y')) {
            previousCoords.y = command.y;
          }
        }
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