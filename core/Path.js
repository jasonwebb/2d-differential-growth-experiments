var rbush = require('./node_modules/rbush');
var knn = require('./node_modules/rbush-knn');
var Node = require('./Node');
var Defaults = require('./Defaults');


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
      distance = this.nodes[index].position.dist(connectedNodes.nextNode.position);

      if (distance > this.settings.MinDistance) {
        this.nodes[index].nextPosition = p5.Vector.lerp(this.nodes[index].position, connectedNodes.nextNode.position, this.settings.AttractionForce);
      }
    }

    // Move towards previous node, if there is one
    if (
      connectedNodes.previousNode != undefined && connectedNodes.previousNode instanceof Node && 
      !this.nodes[index].isFixed
    ) {
      distance = this.nodes[index].position.dist(connectedNodes.previousNode.position);

      if (distance > this.settings.MinDistance) {
        this.nodes[index].nextPosition = p5.Vector.lerp(this.nodes[index].position, connectedNodes.previousNode.position, this.settings.AttractionForce);
      }
    }
  }

  //------------------------------------------------------------------------
  //  Repulsion
  //  =========
  //  Move the referenced node away from all nearby nodes within a radius
  //------------------------------------------------------------------------
  applyRepulsion(index) {
    let thoseNodes = this.nodes;
    let rr = this.settings.RepulsionRadius;  // "this" doesn't work in custom predicates, so we this is needed for now

    // Perform knn search to find all neighbors within certain radius
    // TODO: Node class needs to be refactored to have [x,y] as top-level properties so that custom predicate isn't needed
    var neighbors = knn(this.tree, 
                        this.nodes[index].position.x, 
                        this.nodes[index].position.y, 
                        undefined,
                        function(node) {
                          return node.position.dist(thoseNodes[index].position) <= rr;
                        });

    // Move this node away from all nearby neighbors
    // TODO: Make this proportional to distance?
    for(let node of neighbors) {
      this.nodes[index].nextPosition = p5.Vector.lerp(this.nodes[index].position, node.position, -this.settings.RepulsionForce);
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
      let midpoint = this.p5.createVector(
        (connectedNodes.previousNode.position.x + connectedNodes.nextNode.position.x) / 2,
        (connectedNodes.previousNode.position.y + connectedNodes.nextNode.position.y) / 2
      );

      // Move this point towards this midpoint
      this.nodes[index].nextPosition = p5.Vector.lerp(midpoint, this.nodes[index].nextPosition, this.settings.AlignmentForce);
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
        node.position.dist(connectedNodes.previousNode.position) >= this.settings.MaxDistance && 
        this.nodes.length < this.settings.MaxNodes) 
      {
        let midpointNode = new Node(
          this.p5,
          this.p5.createVector(
            (node.position.x + connectedNodes.previousNode.position.x) / 2,
            (node.position.y + connectedNodes.previousNode.position.y) / 2
          )
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
      connectedNodes.previousNode.position.dist(connectedNodes.nextNode.position) > this.settings.MinDistance
    ) {
      // Create a new node in the middle
      let midpointNode = new Node(
        this.p5,
        this.p5.createVector(
          (connectedNodes.previousNode.position.x + this.nodes[index].position.x) / 2,
          (connectedNodes.previousNode.position.y + this.nodes[index].position.y) / 2
        )
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
      this.p5.line(this.nodes[i].position.x, this.nodes[i].position.y, this.nodes[i + 1].position.x, this.nodes[i + 1].position.y);
    }

    // Draw a line between last and first node to close the path, if needed
    if (this.isClosed) {
      this.p5.line(this.nodes[this.nodes.length - 1].position.x, this.nodes[this.nodes.length - 1].position.y, this.nodes[0].position.x, this.nodes[0].position.y);
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