let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Bounds = require('../../core/Bounds'),
    SVGLoader = require('../../core/SVGLoader'),
    Settings = require('./Settings');

let world;

const SQUARE = 0,
      CIRCLE = 1,
      MULTIPLE_SHAPES = 2,
      SVG_TEXT = 3,
      SVG_MAZE = 4;
let currentBoundsType = CIRCLE;

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
    let bounds,
        path,
        paths = [];

    let cx = window.innerWidth/2,
        cy = window.innerHeight/2;

    switch(currentBoundsType) {
      case SQUARE:
        bounds = createPolygonPath(4, 200, 45).toArray();
        path = createPolygonPath(3, 100);
        path.setBounds(new Bounds(p5, bounds));
        paths.push(path);
        break;

      case CIRCLE:
        bounds = createPolygonPath(40, 200).toArray();
        path = createPolygonPath(4, 100);
        path.setBounds(new Bounds(p5, bounds));
        paths.push(path);
        break;

      case MULTIPLE_SHAPES:
        // Top left - line
        bounds = createPolygonPath(30, 160);
        bounds.moveTo(-175, -175);
        path = createLinePath(cx + -175, cy + -135, cx + -175, cy + -225);
        path.setBounds(new Bounds(p5, bounds.toArray()));
        paths.push(path);

        // Top right - triangle
        bounds = createPolygonPath(30, 160);
        bounds.moveTo(175, -175);
        path = createPolygonPath(3, 75);
        path.moveTo(175, -175);
        path.setBounds(new Bounds(p5, bounds.toArray()));
        paths.push(path);

        // Bottom left - square
        bounds = createPolygonPath(30, 160);
        bounds.moveTo(-175, 175);
        path = createPolygonPath(4, 75, 45);
        path.moveTo(-175, 175);
        path.setBounds(new Bounds(p5, bounds.toArray()));
        paths.push(path);
        
        // Bottom right - square
        bounds = createPolygonPath(30, 160);
        bounds.moveTo(175, 175);
        path = createPolygonPath(5, 75, -18);
        path.moveTo(175, 175);
        path.setBounds(new Bounds(p5, bounds.toArray()));
        paths.push(path);
        break;

      case SVG_TEXT:
        let letters = SVGLoader.load(p5, 'text', Settings);

        for(let [index, letter] of letters.entries()) {
          letter.scale(3.5);
          letter.moveTo(window.innerWidth/2 - 425, -200);
          bounds = new Bounds(p5, letter.toArray());

          switch(index) {
            // 'S'
            case 0:
              path = createPolygonPath(3, 5);
              path.moveTo(-295, -140);
              path.setBounds(bounds);
              paths.push(path);

              path = createPolygonPath(10, 8);
              path.moveTo(-210, -70);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'U'
            case 1:
              path = createPolygonPath(3, 5);
              path.moveTo(-170, -120);
              path.setBounds(bounds);
              paths.push(path);

              path = createPolygonPath(4, 7);
              path.moveTo(-80, -150);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'P'
            case 2:
              path = createPolygonPath(7, 10);
              path.moveTo(-30, -120);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'D'
            case 3:
              path = createPolygonPath(4, 10);
              path.moveTo(-250, 50);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'A'
            case 4:
              path = createPolygonPath(3, 13);
              path.moveTo(-100, 75);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'W'
            case 5:
              path = createPolygonPath(4, 6);
              path.moveTo(10, 140);
              path.setBounds(bounds);
              paths.push(path);

              path = createPolygonPath(6, 10);
              path.moveTo(60, 20);
              path.setBounds(bounds);
              paths.push(path);

              path = createPolygonPath(3, 6);
              path.moveTo(110, 130);
              path.setBounds(bounds);
              paths.push(path);
              break;

            // 'G'
            case 6:
              path = createPolygonPath(3, 6);
              path.moveTo(180, 50);
              path.setBounds(bounds);
              paths.push(path);

              path = createPolygonPath(4, 5);
              path.moveTo(260, 140);
              path.setBounds(bounds);
              paths.push(path);
              break;
          }
        }
        
        break;

      case SVG_MAZE:
        bounds = SVGLoader.load(p5, 'maze', Settings);
        
        for(let bound of bounds) {
          bound.scale(.8);
          bound.moveTo(cx - 360, cy - 185);
        }

        path = createPolygonPath(10, 10);
        path.moveTo(-220, -75);
        path.setBounds(new Bounds(p5, bounds[1].toArray()));
        paths.push(path);
        break;
    }

    // Add all paths with bounds to World
    world.addPaths(paths);

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

  // Create a path with a single line made of two nodes
  function createLinePath(x1, y1, x2, y2) {
    let nodes = [];

    nodes.push(new Node(p5, x1, y1, Settings));
    nodes.push(new Node(p5, x2, y2, Settings));

    let path = new Path(p5, nodes, Settings);

    return path;
  }

  
  /*
  =============================================================================
    Key handler
  =============================================================================
  */
  p5.keyReleased = function() {
    switch (p5.key) {
      // Restart with square with '1'
      case '1':
        restartWorldWith(SQUARE);
        break;

      // Restart with circle with '2'
      case '2':
        restartWorldWith(CIRCLE);
        break;

      // Restart with multiple shapes with '3'
      case '3':
        restartWorldWith(MULTIPLE_SHAPES);
        break;

      // Restart with SVG text with '4'
      case '4':
        restartWorldWith(SVG_TEXT);
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