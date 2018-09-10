let rbush = require('./node_modules/rbush'),
    knn = require('./node_modules/rbush-knn'),
    Vec2 = require('./node_modules/vec2'),
    Node = require('./Node'),
    Defaults = require('./Defaults');


/*
=============================================================================
  Path class

  DESCRIPTION:
  A Path manages a set of Nodes in a continuous, ordered
  data structure (an Array). 
=============================================================================
*/

class Path {
  constructor(p5, nodes, isClosed = false, settings = Defaults) {
    this.p5 = p5;
    this.nodes = nodes;
    this.isClosed = isClosed;
    this.settings = settings;

    this.tree = rbush();
    this.buildTree();

    this.lastNodeInjectTime = 0;
  }

  //------------------------------------------------------------------
  //  Iterate
  //  =======
  //  Run a single 'tick' of the simulation 
  //-----------------------------------------------------------------
  iterate() {
    for (let [index, node] of this.nodes.entries()) {
      // Apply Brownian motion to realistically 'jiggle' nodes
      // this.applyBrownianMotion(index);

      // Move towards neighbors (attraction), if there is space to move
      this.applyAttraction(index);

      // Move away from any nodes that are too close (repulsion)
      this.applyRepulsion(index);

      // Align with neighbors
      this.applyAlignment(index);

      // Move towards next position with velocity and acceleration
      node.iterate();
    }

    // Split any edges that have become too long
    this.splitEdges();

    // Inject a new node to introduce asymmetry every so often
    if (this.p5.millis() - this.lastNodeInjectTime >= this.settings.NodeInjectionInterval && this.nodes.length < this.settings.MaxNodes) {
      // this.injectNode();
      this.lastNodeInjectTime = this.p5.millis();
    }

    // Rebuild the spatial index
    this.buildTree();
  }

  //---------------------------------------------------------------------
  //  Attraction
  //  ==========
  //  Move the referenced node closer to it's connected neighbor nodes
  //---------------------------------------------------------------------
  applyAttraction(index) {
    let distance;
    let connectedNodes = this.getConnectedNodes(index);

    // Move towards next node, if there is one
    if (
      connectedNodes.nextNode != undefined && connectedNodes.nextNode instanceof Node && 
      !this.nodes[index].isFixed
    ) {
      distance = this.nodes[index].distance(connectedNodes.nextNode);

      if (distance > this.settings.MinDistance) {
        this.nodes[index].nextPosition = this.nodes[index].lerp(connectedNodes.nextNode, this.settings.AttractionForce, true);
      }
    }

    // Move towards previous node, if there is one
    if (
      connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node && 
      !this.nodes[index].isFixed
    ) {
      distance = this.nodes[index].distance(connectedNodes.previousNode);

      if (distance > this.settings.MinDistance) {
        this.nodes[index].nextPosition = this.nodes[index].lerp(connectedNodes.previousNode, this.settings.AttractionForce, true);
      }
    }
  }

  //------------------------------------------------------------------------
  //  Repulsion
  //  =========
  //  Move the referenced node away from all nearby nodes within a radius
  //------------------------------------------------------------------------
  applyRepulsion(index) {
    // Perform knn search to find all neighbors within certain radius
    var neighbors = knn(this.tree, 
                        this.nodes[index].x, 
                        this.nodes[index].y);

    // Move this node away from all nearby neighbors
    // TODO: Make this proportional to distance?
    for(let node of neighbors) {
      this.nodes[index].nextPosition = this.nodes[index].lerp(node, -this.settings.RepulsionForce, true);
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
      let midpoint = new Vec2(
        (connectedNodes.previousNode.x + connectedNodes.nextNode.x) / 2,
        (connectedNodes.previousNode.y + connectedNodes.nextNode.y) / 2
      );

      // Move this point towards this midpoint
      this.nodes[index].nextPosition = midpoint.lerp(this.nodes[index].nextPosition, this.settings.AlignmentForce);
    }
  }

  //--------------------------------------------------------------
  //  Split edges
  //  ===========
  //  Search for long edges, then inject a new node when found
  //
  //  TODO:
  //  - Collect new nodes and inject all at once, not one at a time, to prevent asymmetric recursive splitting
  //--------------------------------------------------------------
  splitEdges() {
    for (let [index, node] of this.nodes.entries()) {
      let connectedNodes = this.getConnectedNodes(index);

      if (
        connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
        node.distance(connectedNodes.previousNode) >= this.settings.MaxDistance && 
        this.nodes.length < this.settings.MaxNodes) 
      {
        let midpointNode = new Node(
          this.p5,
          (node.x + connectedNodes.previousNode.x) / 2,
          (node.y + connectedNodes.previousNode.y) / 2,
          false,
          this.settings
        );
        
        if(index == 0) {
          this.nodes.splice(this.nodes.length, 0, midpointNode);
        } else {
          this.nodes.splice(index, 0, midpointNode);
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
    // Choose two connected nodes at random
    let index = parseInt(this.p5.random(this.nodes.length));
    let connectedNodes = this.getConnectedNodes(index);

    if (
      connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node &&
      connectedNodes.nextNode != undefined && connectedNodes.nextNode instanceof Node &&
      connectedNodes.previousNode.distance(connectedNodes.nextNode) > this.settings.MinDistance
    ) {
      // Create a new node in the middle
      let midpointNode = new Node(
        this.p5,
        (connectedNodes.previousNode.x + this.nodes[index].x) / 2,
        (connectedNodes.previousNode.y + this.nodes[index].y) / 2,
        false,
        this.settings
      );    

      // Splice new node into array
      this.nodes.splice(index, 0, midpointNode);
    }
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

  // Rebuild the spatial index
  buildTree() {
    this.tree.clear();
    this.tree.load(this.nodes);
  }

  //--------------------------------------------
  //  Draw
  //  ====
  //  Draw all nodes and edges to the canvas
  //--------------------------------------------
  draw(drawNodes) {
    // Draw edges between nodes
    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.p5.line(this.nodes[i].x, this.nodes[i].y, this.nodes[i + 1].x, this.nodes[i + 1].y);
    }

    // Draw a line between last and first node to close the path, if needed
    if (this.isClosed) {
      this.p5.line(this.nodes[this.nodes.length - 1].x, this.nodes[this.nodes.length - 1].y, this.nodes[0].x, this.nodes[0].y);
    }

    // Draw all nodes
    if(drawNodes) {
      this.p5.fill(0);
      this.p5.noStroke();

      for (let node of this.nodes) {
        node.draw();
      }
    }
  }
}

module.exports = Path;