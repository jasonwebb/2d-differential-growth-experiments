let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Settings = require('./Settings'),
    MIDIControl = require('../../core/MIDIControl');

let world;

const HORIZONTAL = 0,
      VERTICAL = 1,
      ANGLED = 2,
      RADIAL = 3,
      OPPOSING_ARCS = 4,
      NUCLEATION = 5;
let currentLineType = OPPOSING_ARCS;


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

    // Set up MIDI controller as input
    this.midi = new MIDIControl();

    // Process MIDI 'noteon' events
    document.addEventListener('noteon', function(e) {
      console.log(e.detail);
    });

    // Process MIDI 'controlchange' events
    document.addEventListener('controlchange', function(e) {
      console.log(e.detail);
    });
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

  // Create a grid of lines as Paths consisting of two Nodes each with configurable deltas in position
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

  // Horizontal lines only have deltas along X axis
  function createHorizontalLines(rows, columns) {
    createLines(rows, columns, 20, 45, 30, 0);
  }

  // Vertical lines only have deltas along Y axis
  function createVerticalLines(rows, columns) {
    createLines(rows, columns, 38, 20, 0, 30);
  }

  // Angled lines have deltas along both X and Y axes
  function createAngledLines(rows, columns) {
    createLines(rows, columns, 38, 20, -30, 30);
  }

  // Create an arc composed of lines
  function createArcLines(centerX, centerY, degreesStart, degreesEnd, innerRadius, linesPerArc, lineLength) {
    let angleDelta = (degreesEnd - degreesStart) / linesPerArc;
    let outerRadius = innerRadius + lineLength;

    for(let i = degreesStart; i < degreesEnd; i += angleDelta) {
      let nodes = [];

      // Innermost Node
      nodes[0] = new Node(
        p5,
        innerRadius * Math.cos(i * (Math.PI / 180)),
        innerRadius * Math.sin(i * (Math.PI / 180)),
        Settings
      );

      // Outermost Node
      nodes[1] = new Node(
        p5,
        outerRadius * Math.cos(i * (Math.PI / 180)),
        outerRadius * Math.sin(i * (Math.PI / 180)),
        Settings
      );

      let path = new Path(p5, nodes, Settings);
      path.moveTo(centerX, centerY);

      world.addPath(path);
    }
  }

  // Create two arcs of lines in opposing corners of the canvas
  function createOpposingArcs() {
    createArcLines(window.innerWidth/2 - 900/2 + 100, window.innerHeight/2 + 900/2 - 75, 270, 360, 375, 66, 100);
    createArcLines(window.innerWidth/2 + 900/2 - 100, window.innerHeight/2 - 900/2 + 75, 90, 180, 375, 60, 100);
  }

  // Create a full ring of lines
  function createLineRing() {
    createArcLines(window.innerWidth/2, window.innerHeight/2, 0, 360, 75, 60, 50);
  }

  // Create radial arc arrangements at multiple spots
  function createNucleationSites() {
    var sites = [
      { x:-200, y:-210, ds:0, de:360, r:25, lpa:55, ll:100 },
      { x:60, y:-100, ds:0, de:360, r:25, lpa:30, ll:35 },
      { x:-80, y:-20, ds:0, de:360, r:50, lpa:45, ll:25 },
      { x:150, y:150, ds:0, de:360, r:100, lpa:60, ll:70 },
      { x:-40, y:-150, ds:0, de:360, r:15, lpa:18, ll:10 },
      { x:-400, y:400, ds:270, de:360, r:400, lpa:60, ll:30 },
      { x:-400, y:400, ds:270, de:360, r:350, lpa:15, ll:20 },
      { x:-400, y:400, ds:270, de:360, r:300, lpa:7, ll:40 },
      { x:-400, y:400, ds:270, de:360, r:200, lpa:30, ll:75 },
      { x:125, y:-400, ds:0, de:180, r:175, lpa:45, ll:30 },
      { x:275, y:-110, ds:0, de:360, r:75, lpa:45, ll:15 }
    ]

    for(let i = 0; i < sites.length; i++) {
      createArcLines(
        window.innerWidth/2 + sites[i].x,
        window.innerHeight/2 + sites[i].y,
        sites[i].ds,
        sites[i].de,
        sites[i].r,
        sites[i].lpa,
        sites[i].ll
      );
    }
  }

  // Restart the simulation with the selected path type -------------------
  function restartWorld() {
    world.clearPaths();

    // Create a field of lines
    switch(currentLineType) {
      case HORIZONTAL:
        createHorizontalLines(30, 10);
        break;
      case VERTICAL:
        createVerticalLines(10, 30);
        break;
      case ANGLED:
        createAngledLines(15, 20);
        break;
      case RADIAL:
        createLineRing();
        break;
      case OPPOSING_ARCS:
        createOpposingArcs();
        break;
      case NUCLEATION:
        createNucleationSites();
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
      // Switch to horizontal lines with '1'
      case '1':
        currentLineType = HORIZONTAL;
        restartWorld();
        break;

      // Switch to vertical lines with '2'
      case '2':
        currentLineType = VERTICAL;
        restartWorld();
        break;

      // Switch to angled lines with '3'
      case '3':
        currentLineType = ANGLED;
        restartWorld();
        break;

      // Switch to radial arrangement of lines with '4'
      case '4':
        currentLineType = RADIAL;
        restartWorld();
        break;

      // Switch to dual radial arcs with '5'
      case '5':
        currentLineType = OPPOSING_ARCS;
        restartWorld();
        break;

      // Switch to nucleation sites of arc lines with '6'
      case '6':
        currentLineType = NUCLEATION;
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
        let total = 0;
        for(let path of world.paths) {
          total += path.nodes.length;
        }
        console.log(total);
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