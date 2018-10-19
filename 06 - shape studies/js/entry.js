let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Settings = require('./Settings'),
    overlap = require('../node_modules/polygon-overlap');

let world;

const TRIANGLES = 0,
      SQUARES = 1,
      CIRCLES = 2,
      MIXED = 3,
      PHYLLOTAXIS = 4;
let currentShapeType = TRIANGLES;
let useRotation = false;


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
    restartWorldWith(currentShapeType);
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

  // Restart the simulation with the selected path type -------------------
  function restartWorldWith(shapeType) {
    world.clearPaths();

    currentShapeType = shapeType;

    switch(shapeType) {
      case TRIANGLES:
        createPolygons(3);
        break;
      case SQUARES:
        createPolygons(4);
        break;
      case CIRCLES:
        createPolygons(30);
        break;
      case MIXED:
        createPolygons();
        break;
      case PHYLLOTAXIS:
        createPhyllotaxis();
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

  
  // Create a randomized assortment of non-overlapping polygons and add them to the World
  function createPolygons(nodesPerPolygon = -1) {
    let nodeCount = nodesPerPolygon;
    let angle;

    for(let i = 0; i < 5000; i++) {
      // In 'mixed' mode, create triangles, squares, and circles
      if(nodesPerPolygon == -1) {
        nodeCount = Math.round(p5.random(3,5));

        // Fuck pentagons. Circles all da way!
        if(nodeCount == 5) {
          nodeCount = 30;
        }
      }

      // Randomize rotation, if enabled
      if(useRotation) {
        angle = p5.random(360);
      }

      // Generate a path and extract it's points for overlap check
      let path = createPolygon(nodeCount, p5.random(10,200), angle);
      let polygon = getPointsFromPath(path);

      // Only add path to world if it does not overlap with any other paths
      if(!overlapsAny(polygon)) {
        world.addPath(path);
      }
    }
  }

  // Create a generalized equilateral polygon
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

    let path = new Path(p5, nodes, Settings, true);
    path.moveTo(
      p5.random(-300,300),
      p5.random(-300,300)
    );

    return path;
  }

  // Create an arrangement of circles using the phyllotaxis algorithm
  function createPhyllotaxis() {
    let numCircles = 300,
        goldenRatio = (Math.sqrt(5)+1)/2 - 1,
        goldenAngle = goldenRatio * (Math.PI * 2);

    for(let i = 1; i < numCircles; i++) {
      let ratio = i / numCircles,
          angle = i * goldenAngle,
          spiralRadius = ratio * 200,
          x = 1.5 * Math.cos(angle) * spiralRadius,
          y = 1.5 * Math.sin(angle) * spiralRadius,
          nodes = [];

      if(Math.sqrt(x*x + y*y) > 50) {
        for(let j = 0; j < 10; j++) {
          let nodeAngle = 2 * Math.PI * j / 10;
          let offsetX = Math.floor(5 * Math.cos(nodeAngle));
          let offsetY = Math.floor(5 * Math.sin(nodeAngle));
    
          nodes.push(new Node(p5, window.innerWidth/2 + x + offsetX, window.innerHeight/2 + y + offsetY, Settings));
        }

        world.addPath(new Path(p5, nodes, Settings, true));
      }
    }
  }

  // Compile an barebones array of arrays containing path coodinates (ex: [[x1,y1], [x2,y2], ...])  
  function getPointsFromPath(path) {
    let points = [];

    for(let node of path.nodes) {
      points.push([node.x, node.y]);
    }

    return points;
  }

  // Check if the provided polygon overlaps with any other polygon
  function overlapsAny(polygon) {
    let overlapFound = false;

    if(world.paths && world.paths.length > 0) {
      for(let path of world.paths) {
        if(overlap(polygon, getPointsFromPath(path))) {
          overlapFound = true;
        }
      }
    }

    return overlapFound;
  }


  /*
  =============================================================================
    Key handler
  =============================================================================
  */
  p5.keyReleased = function() {
    switch (p5.key) {
      case '1':
        restartWorldWith(TRIANGLES);
        break;

      case '2':
        restartWorldWith(SQUARES);
        break;

      case '3':
        restartWorldWith(CIRCLES);
        break;

      case '4':
        restartWorldWith(MIXED);
        break;

      case '5':
        restartWorldWith(PHYLLOTAXIS);
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
        restartWorldWith(currentShapeType);
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
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);