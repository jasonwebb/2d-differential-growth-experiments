let Node = require('./Node'),
    Path = require('./Path'),
    World= require('./World'),
    Settings = require('./Settings');

let world, paths = [];


/*
=============================================================================
  Main sketch
=============================================================================
*/

const sketch = function (p5) {
  // Setup -------------------------------------------------------------
  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    // p5.frameRate(5);
    // p5.noLoop();

    // Create path using nodes
    paths.push(new Path(p5, createCircle(), true));
    world = new World(p5, paths);
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    world.iterate();
    world.draw();
  }

  // Create nodes in a circle -------------------------------------------
  function createCircle() {
    let nodes = [];
    let NUM_START_NODES = 11;
    let RADIUS = 5;

    for (let i = 0; i < NUM_START_NODES; i++) {
      let angle = 2 * Math.PI * i / NUM_START_NODES;
      let x = Math.floor(RADIUS * Math.cos(angle));
      let y = Math.floor(RADIUS * Math.sin(angle));

      nodes.push(new Node(p5, p5.createVector(window.innerWidth / 2 + x, window.innerHeight / 2 + y)));
    }

    return nodes;
  }

  // Create three nodes to form an equilateral triangle ----------------
  function createTriangle() {}

  // Create four nodes to form a rectangle -----------------------------
  function createRectangle() {}
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);


/*
=============================================================================
  Key handler
=============================================================================
*/

document.onkeyup = function (e) {
  // Pause/unpause the world with 'p'
  if (e.key == 'p') {
    world.paused = !world.paused;

  // Toggle trace mode with 't'
  } else if(e.key == 't') {
    world.traceMode = !world.traceMode;
    world.clearPaths();
    paths = [];
    paths.push(new Path(p5, createCircle(), true));
  }
}