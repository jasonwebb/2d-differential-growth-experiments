let knn = require('./node_modules/rbush-knn'),
    Node = require('./Node'),
    Defaults = require('./Defaults');

    
/*
=============================================================================
  Path class

  A Path manages a set of Nodes in a continuous, ordered
  data structure (an Array). 
=============================================================================
*/

class Path {
  constructor(
    p5, 
    nodes, 
    settings = Defaults, 
    isClosed = false, 
    fillColor = {h:0, s:0, b:0, a:255}, 
    strokeColor = {h:0, s:0, b:0, a:255}, 
    invertedFillColor = {h:0, s:0, b:255, a:255}, 
    invertedStrokeColor = {h:0, s:0, b:255, a:255}
  ) {
    this.p5 = p5;
    this.nodes = nodes;
    this.isClosed = isClosed;
    this.settings = Object.assign({}, Defaults, settings);

    this.injectionMode = "RANDOM";
    this.lastNodeInjectTime = 0;

    this.nodeHistory = [];

    this.drawNodes = this.settings.DrawNodes;
    this.invertedColors = this.settings.InvertedColors;
    this.traceMode = this.settings.TraceMode;
    this.debugMode = this.settings.DebugMode;
    this.fillMode = this.settings.FillMode;
    this.useBrownianMotion = this.settings.UseBrownianMotion;
    this.drawHistory = this.settings.DrawHistory;

    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.invertedFillColor = invertedFillColor;
    this.invertedStrokeColor = invertedStrokeColor;

    this.currentFillColor = this.fillColor;
    this.currentStrokeColor = this.strokeColor;

    if(this.invertedColors) {
      this.currentFillColor = this.invertedFillColor;
      this.currentStrokeColor = this.invertedStrokeColor;
    }
  }

  //------------------------------------------------------------------
  //  Iterate
  //  =======
  //  Run a single 'tick' of the simulation 
  //-----------------------------------------------------------------
  iterate(tree) {
    for (let [index, node] of this.nodes.entries()) {
      // Apply Brownian motion to realistically 'jiggle' nodes
      if(this.useBrownianMotion) {
        this.applyBrownianMotion(index);
      }

      // Move towards neighbors (attraction), if there is space to move
      this.applyAttraction(index);

      // Move away from any nodes that are too close (repulsion)
      this.applyRepulsion(index, tree);

      // Align with neighbors
      this.applyAlignment(index);

      // Constrain to the screen
      this.avoidWalls(index);

      // Move towards next position
      node.iterate();
    }

    // Split any edges that have become too long
    this.splitEdges();

    // Remove any nodes that are too close to other nodes
    this.pruneNodes();

    // Inject a new node to introduce asymmetry every so often
    if (this.p5.millis() - this.lastNodeInjectTime >= this.settings.NodeInjectionInterval) {
      this.injectNode();
      this.lastNodeInjectTime = this.p5.millis();
    }
  }

  //---------------------------------------------------------------------
  //  Brownian motion
  //  ===============
  //  Simulate the small random motions that real microscopic particles 
  //  experience from collisions with fast-moving molecules
  //----------------------------------------------------------------------
  applyBrownianMotion(index) {
    this.nodes[index].x += this.p5.random(-this.settings.BrownianMotionRange/2, this.settings.BrownianMotionRange/2);
    this.nodes[index].y += this.p5.random(-this.settings.BrownianMotionRange/2, this.settings.BrownianMotionRange/2);
  }

  //---------------------------------------------------------------------
  //  Attraction
  //  ==========
  //  Move the referenced node closer to it's connected neighbor nodes
  //---------------------------------------------------------------------
  applyAttraction(index) {
    let distance, leastMinDistance;
    let connectedNodes = this.getConnectedNodes(index);

    // Move towards next node, if there is one
    if (
      connectedNodes.nextNode != undefined && connectedNodes.nextNode instanceof Node && 
      !this.nodes[index].isFixed
    ) {
      distance = this.nodes[index].distance(connectedNodes.nextNode);
      leastMinDistance = Math.min(this.nodes[index].minDistance, connectedNodes.nextNode.minDistance);

      if (distance > leastMinDistance) {
        this.nodes[index].nextPosition.x = this.p5.lerp(this.nodes[index].nextPosition.x, connectedNodes.nextNode.x, this.settings.AttractionForce);
        this.nodes[index].nextPosition.y = this.p5.lerp(this.nodes[index].nextPosition.y, connectedNodes.nextNode.y, this.settings.AttractionForce);
      }
    }

    // Move towards previous node, if there is one
    if (
      connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node && 
      !this.nodes[index].isFixed
    ) {
      distance = this.nodes[index].distance(connectedNodes.previousNode);
      leastMinDistance = Math.min(this.nodes[index].minDistance, connectedNodes.previousNode.minDistance);

      if (distance > leastMinDistance) {
        this.nodes[index].nextPosition.x = this.p5.lerp(this.nodes[index].nextPosition.x, connectedNodes.previousNode.x, this.settings.AttractionForce);
        this.nodes[index].nextPosition.y = this.p5.lerp(this.nodes[index].nextPosition.y, connectedNodes.previousNode.y, this.settings.AttractionForce);
      }
    }
  }

  //------------------------------------------------------------------------
  //  Repulsion
  //  =========
  //  Move the referenced node away from all nearby nodes within a radius
  //------------------------------------------------------------------------
  applyRepulsion(index, tree) {
    // Perform knn search to find all neighbors within certain radius
    var neighbors = knn(tree, 
                        this.nodes[index].x, 
                        this.nodes[index].y,
                        undefined,
                        undefined,
                        this.nodes[index].repulsionRadius * this.nodes[index].repulsionRadius); // radius must be squared as per https://github.com/mourner/rbush-knn/issues/13

    // Move this node away from all nearby neighbors
    // TODO: Make this proportional to distance?
    for(let node of neighbors) {
      this.nodes[index].nextPosition.x = this.p5.lerp(this.nodes[index].x, node.x, -this.settings.RepulsionForce);
      this.nodes[index].nextPosition.y = this.p5.lerp(this.nodes[index].y, node.y, -this.settings.RepulsionForce);
    }
  }

  //-------------------------------------------------------------
  //  Alignment
  //  =========
  //  Move the referenced node closer to the midpoint of it's
  //  neighbor connected nodes to minimize curvature
  //-------------------------------------------------------------
  applyAlignment(index) {
    let connectedNodes = this.getConnectedNodes(index);

    if (
      connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
      connectedNodes.nextNode != undefined && connectedNodes.nextNode instanceof Node &&
      !this.nodes[index].isFixed
    ) {
      // Find the midpoint between the neighbors of this node
      let midpoint = this.getMidpointNode(connectedNodes.previousNode, connectedNodes.nextNode);

      // Move this point towards this midpoint
      this.nodes[index].nextPosition.x = this.p5.lerp(this.nodes[index].nextPosition.x, midpoint.x, this.settings.AlignmentForce);
      this.nodes[index].nextPosition.y = this.p5.lerp(this.nodes[index].nextPosition.y, midpoint.y, this.settings.AlignmentForce);
    }
  }

  //--------------------------------------------------------------
  //  Split edges
  //  ===========
  //  Search for long edges, then inject a new node when found
  //--------------------------------------------------------------
  splitEdges() {
    for (let [index, node] of this.nodes.entries()) {
      let connectedNodes = this.getConnectedNodes(index);

      if (
        connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
        node.distance(connectedNodes.previousNode) >= this.settings.MaxDistance) 
      {
        let midpointNode = this.getMidpointNode(node, connectedNodes.previousNode);
        
        // Inject the new midpoint node into the global list
        if(index == 0) {
          this.nodes.splice(this.nodes.length, 0, midpointNode);
        } else {
          this.nodes.splice(index, 0, midpointNode);
        }
      }
    }
  }

  //------------------------------------------------------------
  //  Prune nodes
  //  ===========
  //  Remove nodes when they are too close to their neighbors
  //------------------------------------------------------------
  pruneNodes() {
    for(let [index, node] of this.nodes.entries()) {
      let connectedNodes = this.getConnectedNodes(index);

      if(
        connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
        node.distance(connectedNodes.previousNode) < this.settings.MinDistance) 
      {
        if(index == 0) {
          if(!this.nodes[this.nodes.length - 1].isFixed) {
            this.nodes.splice(this.nodes.length - 1, 1);
          }
        } else {
          if(!this.nodes[index - 1].isFixed) {
            this.nodes.splice(index - 1, 1);
          }
        }
      }
    }
  }

  //---------------------------------------------------
  //  Inject a node
  //  =============
  //  Create a new node between two existing nodes
  //---------------------------------------------------
  injectNode() {
    switch(this.injectionMode) {
      case "RANDOM":
        this.injectRandomNode();
        break;
      case "CURVATURE":
        this.injectNodeByCurvature();
        break;
    }
  }

    // Inject a new node in a random location, if there is space for it
    injectRandomNode() {
      // Choose two connected nodes at random
      let index = parseInt(this.p5.random(1, this.nodes.length));
      let connectedNodes = this.getConnectedNodes(index);

      if (
        connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
        connectedNodes.nextNode != undefined && connectedNodes.nextNode instanceof Node &&
        this.nodes[index].distance(connectedNodes.previousNode) > this.settings.MinDistance
      ) {
        // Create a new node in the middle
        let midpointNode = this.getMidpointNode(this.nodes[index], connectedNodes.previousNode);
        
        // Splice new node into array
        this.nodes.splice(index, 0, midpointNode);
      }
    }

    // Inject new node nodes when curvature is too high
    // - When the angle between connected nodes is too high, remove
    //   the middle node and replace it with two nodes at the respective
    //   midpoints of the previous two lines. This "truncates" or "chamfers"
    //   the pointy node into two flatter nodes.
    injectNodeByCurvature() {
      console.log('test');
      for(let [index, node] of this.nodes.entries()) {
        let connectedNodes = this.getConnectedNodes(index);

        // Find angle between adjacent nodes
        let a = node.distance(connectedNodes.previousNode);
        let b = node.distance(connectedNodes.nextNode);
        let angle = Math.atan(a/b) * 180/Math.PI;
        
        // If angle is below a certain angle (high curvature), replace the current node with two nodes
        if(angle < 30) {
          console.log(index);
          let previousMidpointNode = this.getMidpointNode(node, connectedNodes.previousNode);
          let nextMidpointNode = this.getMidpointNode(node, connectedNodes.nextNode);
          console.log(previousMidpointNode);
          console.log(nextMidpointNode);
          this.p5.noLoop();
          // console.log(previousMidpointNode);
          // console.log(nextMidpointNode);

          // Replace this node with the two new nodes
          if(index == 0) {
            this.nodes.splice(this.nodes.length-1, 0, previousMidpointNode);
            this.nodes.splice(0, 1, nextMidpointNode);
          } else {
            // console.log(index);
            // console.log(this.nodes);
            this.nodes.splice(index, 1, previousMidpointNode, nextMidpointNode);
            // console.log(this.nodes);
            // this.p5.noLoop();
          }
        }
      }
    }

  //------------------------------------------------------------------
  //  Avoid walls
  //  ===========
  //  Clamp node position to the window to prevent "runaway" growth  
  //------------------------------------------------------------------
  avoidWalls(index) {
    this.nodes[index].x = this.p5.constrain(this.nodes[index].x, 0, window.innerWidth);
    this.nodes[index].y = this.p5.constrain(this.nodes[index].y, 0, window.innerHeight);
  }

  //------------------------------------------------------------
  //  Get connected nodes
  //  ===================
  //  For a given node, find and return the nodes that come 
  //  immediately before and after it.
  //------------------------------------------------------------
  getConnectedNodes(index) {
    let previousNode, nextNode;

    // Find previous node, if there is one
    if(index == 0 && this.isClosed) {
      previousNode = this.nodes[this.nodes.length - 1];
    } else if(index >= 1) {
      previousNode = this.nodes[index - 1];
    }

    // Find next node, if there is one
    if(index == this.nodes.length - 1 && this.isClosed) {
      nextNode = this.nodes[0];
    } else if(index <= this.nodes.length - 1) {
      nextNode = this.nodes[index + 1];
    }

    return {
      previousNode,
      nextNode
    };
  }

  //------------------------------------------------------------
  //  Get midpoint node
  //  =================
  //  Create and return a node exactly halfway between the
  //  two provided nodes.
  //------------------------------------------------------------
  getMidpointNode(node1, node2, fixed = false) {
    return new Node(
      this.p5,
      (node1.x + node2.x) / 2,
      (node1.y + node2.y) / 2,
      this.settings,
      fixed
    );
  }

  //--------------------------------------------
  //  Draw
  //  ====
  //  Draw all nodes and edges to the canvas
  //--------------------------------------------
  draw() {
    // Draw all the previous paths saved to the history array
    if(this.drawHistory) {
      this.drawPreviousEdges();
    }

    // Set shape fill 
    if(this.fillMode) {
      this.p5.fill(this.currentFillColor.h, this.currentFillColor.s, this.currentFillColor.b, this.currentFillColor.a);
    } else {
      this.p5.noFill();
    }

    // Set stroke color
    this.p5.stroke(this.currentStrokeColor.h, this.currentStrokeColor.s, this.currentStrokeColor.b, this.currentStrokeColor.a);

    // Draw current edges
    this.drawCurrentEdges();

    // Draw all nodes
    if(this.drawNodes) {
      this.drawCurrentNodes();
    }
  }

  // Draw the current edges (leading edge) of the path
  drawCurrentEdges() {
    this.drawEdges(this.nodes);
  }

  // Draw all previous edges of the path saved to history array
  drawPreviousEdges() {
    for(let [index, nodes] of this.nodeHistory.entries()) {
      this.p5.stroke(
        this.currentStrokeColor.h, 
        this.currentStrokeColor.s, 
        this.currentStrokeColor.b,
        index * 30
      );

      this.drawEdges(nodes);
    }
  }

  // Draw edges for a given set of nodes - can be either the current or previous nodes
  drawEdges(nodes) {
    // Begin capturing vertices
    if(!this.debugMode) {
      this.p5.beginShape();
    }

    // Create vertices or lines (if debug mode)
    for (let i = 0; i < nodes.length; i++) {
      if(!this.debugMode) {
        this.p5.vertex(nodes[i].x, nodes[i].y);
      } else {

        // In debug mode each line has a unique stroke color, which isn't possible with begin/endShape(). Instead we'll use line()
        if(i > 0) {
          if(!this.traceMode) {
            this.p5.stroke( this.p5.map(i, 0, nodes.length-1, 0, 255, true), 255, 255, 255 );
          } else {
            this.p5.stroke( this.p5.map(i, 0, nodes.length-1, 0, 255, true), 255, 255, 2 );
          }

          this.p5.line(nodes[i-1].x, nodes[i-1].y, nodes[i].x, nodes[i].y);
        }
      }
    }

    // For closed paths, connect the last and first nodes
    if(this.isClosed) {
      if(!this.debugMode) {
        this.p5.vertex(nodes[0].x, nodes[0].y);
      } else {
        this.p5.line(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y, nodes[0].x, nodes[0].y);
      }
    }

    // Stop capturing vertices
    if(!this.debugMode) {
      this.p5.endShape();
    }
  }

  // Draw circles for every node
  drawCurrentNodes() {
    this.p5.noStroke();

    if(!this.invertedColors) {
      this.p5.fill(0);
    } else {
      this.p5.fill(255);
    }

    for (let [index, node] of this.nodes.entries()) {
      if(this.debugMode) {
        this.p5.fill( this.p5.map(index, 0, this.nodes.length-1, 0, 255, true), 255, 255, 255 );
      }

      node.draw();
    }
  }

  // Take a snapshot of the current nodes by saving a dereferenced clone of them to the history array
  addToHistory() {
    if(this.nodeHistory.length == this.settings.MaxHistorySize) {
      this.nodeHistory.shift();
    }

    this.nodeHistory.push(Object.assign([], JSON.parse(JSON.stringify(this.nodes))));
  }

  // Translate this path by the provided offsets
  moveTo(xOffset, yOffset) {
    for(let node of this.nodes) {
      node.x += xOffset;
      node.y += yOffset;
    }
  }

  // Scale (multiply) all Nodes by the provided factor
  scale(factor) {
    for(let node of this.nodes) {
      node.x *= factor;
      node.y *= factor;
    }
  }

  // Add a new node from outside this class
  addNode(node) {
    this.nodes.push(node);
  }

  // Getters ------------------------------------
  getTraceMode() {
    return this.traceMode;
  }

  getInvertedColors() {
    return this.invertedColors;
  }

  // Setters ------------------------------------
  setTraceMode(state) {
    this.traceMode = state;

    if(!this.traceMode) {
      this.currentFillColor.a = 255;
      this.currentStrokeColor.a = 255;
    } else {
      this.currentFillColor.a = 255;
      this.currentStrokeColor.a = 255;
    }
  }

  setInvertedColors(state) {
    this.invertedColors = state;

    if(!this.invertedColors) {
      this.currentFillColor = this.fillColor;
      this.currentStrokeColor = this.strokeColor;
    } else {
      this.currentFillColor = this.invertedFillColor;
      this.currentStrokeColor = this.invertedStrokeColor;
    }

    // Reapply the current trace mode state to make sure opacity is adjusted when colors are inverted
    this.setTraceMode(this.traceMode);
  }

  // Toggles ------------------------------------
  toggleTraceMode() {
    this.setTraceMode(!this.getTraceMode());
  }

  toggleInvertedColors() {
    this.setInvertedColors(!this.getInvertedColors());
  }
}

module.exports = Path;