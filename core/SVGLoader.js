let Node = require('./Node'),
    Path = require('./Path'),
    Defaults = require('./Defaults'),
    {SVGPathData} = require('./node_modules/svg-pathdata');

  
/*
=============================================================================
  SVGLoader class

  Utility class to load an external SVG file and produce Path(s) 
=============================================================================
*/

class SVGLoader {
  constructor() {}

  static load(p5, svg, settings = Defaults) {
    this.settings = Object.assign({}, Defaults, settings);

    // Load the default SVG file
    let svgEl = document.getElementById(svg),
        inputPaths = svgEl.contentDocument.querySelectorAll('path'),
        currentPath = new Path(p5, [], this.settings, true),
        paths = [];

    // Scrape all points from all points, and record breakpoints
    for(let inputPath of inputPaths) {
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
            currentPath.addNode(new Node(p5, command.x, command.y, this.settings));
            break;

          // Horizontal line ('H') commands only have X, using previous command's Y
          case SVGPathData.HORIZ_LINE_TO:
          currentPath.addNode(new Node(p5, command.x, previousCoords.y, this.settings));
            break;

          // Vertical line ('V') commands only have Y, using previous command's X
          case SVGPathData.VERT_LINE_TO:
            currentPath.addNode(new Node(p5, previousCoords.x, command.y, this.settings));
            break;

          // ClosePath ('Z') commands are a naive indication that the current path can be processed and added to the world
          case SVGPathData.CLOSE_PATH:
            // Capture path in return object
            paths.push(currentPath);

            // Set up a new empty Path for the next loop iterations
            currentPath = new Path(p5, [], this.settings, true);
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
    }

    return paths;
  }
}

module.exports = SVGLoader;