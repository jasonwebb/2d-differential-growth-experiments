let Node = require('../../core/Node'),
    Path = require('../../core/Path'),
    World = require('../../core/World'),
    Bounds = require('../../core/Bounds'),
    SVGLoader = require('../../core/SVGLoader'),
    Settings = require('./Settings');

let world,
    path,
    nodes = [];

const FREEHAND = 0,
      RECTANGLE = 1,
      CIRCLE = 2;
let activeTool = FREEHAND;

let distanceToClose = 15;

let startX, startY, endX, endY, deltaX, deltaY;

let allButtonEls = document.querySelectorAll('button'),
    svgImportInputEl = document.querySelector('.svgImportInput'),
    playButtonEl = document.querySelector('.play');


/*
=============================================================================
  Main sketch
=============================================================================
*/


function setActiveTool(tool) {
  for(let button of allButtonEls) {
    button.classList.remove('is-active');
  }

  switch(tool) {
    case FREEHAND:
      document.querySelector('.freehand').classList.add('is-active');
      break;
    case RECTANGLE:
      document.querySelector('.rectangle').classList.add('is-active');
      break;
    case CIRCLE:
      document.querySelector('.circle').classList.add('is-active');
      break;
  }

  activeTool = tool;
}

// Set active tool based on which tool icon was clicked
function handleToolClick(e) {
  if(e.target.classList.contains('freehand')) {
    setActiveTool(FREEHAND);
  } else if(e.target.classList.contains('rectangle')) {
    setActiveTool(RECTANGLE);
  } else if(e.target.classList.contains('circle')) {
    setActiveTool(CIRCLE);
  }
}

// Import SVG - open file input dialog
function openFileImport() {
  svgImportInputEl.click();
}

// Eraser - clear all paths from the world
function clearPaths() {
  world.clearPaths();
  world.drawBackground();
}

// Download SVG - export world contents as SVG
function exportSVG() {
  world.export();
}


// Play button - toggle pause/unpause of world
function togglePause() {
  world.togglePause();

  let icon = playButtonEl.querySelector('.icon');

  if(world.paused) {
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
  } else {
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
  }
}


// View source - go to Github repo
function viewSource(e) {
  window.location.href = e.target.getAttribute('data-href');
}

// Keyboard icon - toggle keyboard controls modal window
function toggleKeyboardControls() {
  console.log('toggling keyboard control modal');
}

// Question mark icon - toggle 'about' modal window
function toggleAbout() {
  console.log('toggling help modal window');
}


// Sliders icon - toggle parameters modal window
function toggleParameters() {
  console.log('toggling parameters modal window');
}


function importSVG() {
  let file = this.files[0];
  
  if(file.type === 'image/svg+xml') {
    let objectEl = document.querySelector('#user-file');
    objectEl.data = URL.createObjectURL(file);
    objectEl.onload = function() {
      let thing = SVGLoader.load(p5, 'user-file', Settings);
      console.log(thing);
    }
  }
}


const sketch = function (p5) {
  // Setup -------------------------------------------------------------
  p5.setup = function () {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.colorMode(p5.HSB, 255);
    p5.rectMode(p5.CENTER);
    p5.smooth();

    // Set up and start the simulation
    world = new World(p5, Settings);
    world.pause();

    // Left menu ----------------------
    // Drawing tools
    document.querySelector('.freehand').addEventListener('click', handleToolClick);
    document.querySelector('.rectangle').addEventListener('click', handleToolClick);
    document.querySelector('.circle').addEventListener('click', handleToolClick);

    // Import, export, and clear
    document.querySelector('.import').addEventListener('click', openFileImport);
    document.querySelector('.reset').addEventListener('click', clearPaths);
    document.querySelector('.export').addEventListener('click', exportSVG);

    // Center controls ----------------
    document.querySelector('.play').addEventListener('click', togglePause);

    // Right menu ---------------------
    document.querySelector('.viewSource').addEventListener('click', viewSource);
    document.querySelector('.keyboard').addEventListener('click', toggleKeyboardControls);
    document.querySelector('.about').addEventListener('click', toggleAbout);

    document.querySelector('.svgImportInput').addEventListener('change', importSVG);
  }

  // Draw ---------------------------------------------------------------
  p5.draw = function () {
    if (!world.paused) {
      world.iterate();
      world.draw();
    }
  }


  /*
  =============================================================================
    Mouse handlers
  =============================================================================
  */

  p5.mousePressed = function() {
    switch(activeTool) {
      // Rectangle tool -----------------------------------
      case RECTANGLE:
      case CIRCLE:
        startX = p5.mouseX;
        startY = p5.mouseY;
        break;
    }
  }

  p5.mouseReleased = function () {
    switch (activeTool) {
      // Freehand tool ------------------------------------
      case FREEHAND:
        if (p5.mouseButton == p5.LEFT) {
          if(nodes.length == 0) {
            return;
          }

          let isClosed = false,
            x1 = nodes[nodes.length - 1].x,
            y1 = nodes[nodes.length - 1].y,
            x2 = nodes[0].x,
            y2 = nodes[0].y;

          // If end point is very close to starting point, make the path closed
          if (Math.sqrt(Math.pow(x2 - x1, 2), Math.pow(y2 - y1, 2)) <= distanceToClose) {
            isClosed = true;
          }

          // Create and add Path to the World
          path = new Path(p5, nodes, Settings, isClosed);
          world.addPath(path);

          nodes = [];
        }

        break;

      // Rectangle tool -----------------------------------
      case RECTANGLE:
        endX = p5.mouseX;
        endY = p5.mouseY;

        nodes.push(new Node(p5, startX, startY, Settings));  // top left
        nodes.push(new Node(p5, endX, startY, Settings));    // top right
        nodes.push(new Node(p5, endX, endY, Settings));      // bottom right
        nodes.push(new Node(p5, startX, endY, Settings));    // bottom left

        path = new Path(p5, nodes, Settings, true);
        world.addPath(path);

        nodes = [];
        break;

      // Circle tool --------------------------------------
      case CIRCLE:
        endX = p5.mouseX;
        endY = p5.mouseY;
        deltaX = endX - startX;
        deltaY = endY - startY;

        for(let i = 0; i < 360; i++) {
          nodes.push(
            new Node(
              p5,
              startX + deltaX/2 + deltaX/2 * Math.cos(i * Math.PI/180),
              startY + deltaY/2 + deltaY/2 * Math.sin(i * Math.PI/180),
              Settings
            )
          )
        }

        path = new Path(p5, nodes, Settings, true);
        world.addPath(path);

        nodes = [];
        break;
    }

    world.draw();
  }

  p5.mouseDragged = function () {
    if(!world.paused) {
      world.pause();
    }

    world.draw();

    switch (activeTool) {
      // Freehand tool ------------------------------------
      case FREEHAND:
        if (p5.mouseButton == p5.LEFT) {
          nodes.push(new Node(p5, p5.mouseX, p5.mouseY, Settings));

          if (nodes.length > 0) {
            for (let [index, node] of nodes.entries()) {
              if (index > 0) {
                p5.stroke(0);
                p5.line(nodes[index - 1].x, nodes[index - 1].y, node.x, node.y);
              }
            }
          }

          let x1 = nodes[nodes.length - 1].x,
              y1 = nodes[nodes.length - 1].y,
              x2 = nodes[0].x,
              y2 = nodes[0].y;

          // If current point is very near the starting point, highlight the starting point to indicate that the path will close
          if (Math.sqrt(Math.pow(x2 - x1, 2), Math.pow(y2 - y1, 2)) <= distanceToClose) {
            p5.fill(150);
            p5.noStroke();
            p5.ellipseMode(p5.CENTER);
            p5.ellipse(nodes[0].x, nodes[0].y, distanceToClose);
          }
        }

        break;

      // Rectangle tool -----------------------------------
      case RECTANGLE:
        if(p5.mouseButton == p5.LEFT) {
          p5.stroke(0);
          p5.line(startX, startY, p5.mouseX, startY);        // top
          p5.line(p5.mouseX, startY, p5.mouseX, p5.mouseY);  // right
          p5.line(p5.mouseX, p5.mouseY, startX, p5.mouseY);  // bottom
          p5.line(startX, p5.mouseY, startX, startY);        // left
        }

        break;

      // Circle tool --------------------------------------
      case CIRCLE:
        if(p5.mouseButton == p5.LEFT && startX != undefined && startY != undefined) {
          p5.stroke(0);
          p5.noFill();
          p5.ellipseMode(p5.CORNERS);
          p5.ellipse(startX, startY, p5.mouseX, p5.mouseY);
        }
    }
  }


  /*
  =============================================================================
    Key handler
  =============================================================================
  */
  p5.keyReleased = function () {
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
        world.clearPaths();
        world.drawBackground();
        break;

        // Toggle pause with Space
      case ' ':
        togglePause()
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

        // Toggle visibility of all bounds for all paths with 'b'
      case 'b':
        world.toggleDrawBounds();
        break;
    }
  }
}

// Launch the sketch using p5js in instantiated mode
new p5(sketch);