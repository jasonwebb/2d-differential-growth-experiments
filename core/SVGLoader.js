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

  static loadFromObject(p5, id, settings = Defaults) {
    return this.load(p5, document.getElementById(id), settings);
  }

  static load(p5, svgNode, settings = Defaults) {
    this.settings = Object.assign({}, Defaults, settings);

    let inputPaths = svgNode.querySelectorAll('path'),
        currentPath = new Path(p5, [], this.settings, true),
        paths = [];

    // Scrape all points from all points, and record breakpoints
    for(let inputPath of inputPaths) {
      let pathData = new SVGPathData(inputPath.getAttribute('d'));

      let previousCoords = {
        x: 0,
        y: 0
      };

      for(let [index, command] of pathData.commands.entries()) {
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

        // Unclosed paths never have CLOSE_PATH commands, so wrap up the current path when we're at the end of the path and have not found the command
        if(index == pathData.commands.length - 1 && command.type != SVGPathData.CLOSE_PATH) {
          let firstNode = currentPath.nodes[0],
              lastNode = currentPath.nodes[ currentPath.nodes.length - 1 ];

          // Automatically close the path if the first and last nodes are effectively the same, even if a CLOSE_PATH command doesn't exist
          if(lastNode.distance(firstNode) < .1) {
            currentPath.isClosed = true;
          } else {
            currentPath.isClosed = false;
          }

          paths.push(currentPath);

          currentPath = new Path(p5, [], this.settings, true);
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