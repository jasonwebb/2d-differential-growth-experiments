//=========================================
// Node class
//=========================================
class Node {
  constructor(position, minDistance, maxDistance, repulsionRadius, isFixed = false) {
    this.position = position;
    this.nextPosition = position;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
    this.repulsionRadius = repulsionRadius;
    this.isFixed = isFixed;
  }

  iterate() {
    this.nextPosition.x = constrain(this.nextPosition.x, PADDING, window.innerWidth - PADDING);
    this.nextPosition.y = constrain(this.nextPosition.y, PADDING, window.innerHeight - PADDING);

    this.position = p5.Vector.lerp(this.position, this.nextPosition, VELOCITY);
  }

  draw() {
    if (this.isFixed) {
      fill(0, 255, 0);
    } else {
      fill(0);
    }

    ellipse(this.position.x, this.position.y, 5);
  }
}


//==========================================
// Path class
//==========================================
class Path {
  constructor(nodes, closed = false) {
    this.nodes = nodes;
    this.closed = closed;
  }

  isClosed() {
    this.closed = true;
  }
  isOpen() {
    this.closed = false;
  }

  //==================================================================
  //  Iterate
  //  -------
  //  - Run a single 'tick' of the simulation 
  //==================================================================
  iterate() {
    for (let [index, node] of this.nodes.entries()) {
      // Move towards neighbors (attraction), if there is space to move
      this.applyAttraction(index)

      // Move away from any nodes that are too close (repulsion)
      // this.applyRepulsion(index);

      // Align with neighbors
      this.applyAlignment(index);

      node.iterate();
    }

    // Split any edges that have become too long
    this.splitEdges();
  }

  //=======================================================================
  //  Attraction
  //  ----------
  //  - Move the referenced node closer to it's connected neighbor nodes
  //=======================================================================
  applyAttraction(index) {
    let lowerMinDistance, distance;

    // Move towards previous node, if there is one
    if (index - 1 > 0) {
      lowerMinDistance = min(this.nodes[index - 1].minDistance, this.nodes[index].minDistance);
      distance = this.nodes[index].position.dist(this.nodes[index - 1].position);

      if (distance > lowerMinDistance && !this.nodes[index].isFixed) {
        this.nodes[index].nextPosition = p5.Vector.lerp(this.nodes[index].position, this.nodes[index - 1].position, ATTRACTION_FORCE);
      }
    }

    // Move towards next node, if there is one
    if (index + 1 < this.nodes.length) {
      lowerMinDistance = min(this.nodes[index].minDistance, this.nodes[index + 1].minDistance);
      distance = this.nodes[index].position.dist(this.nodes[index + 1].position);

      if (distance > lowerMinDistance && !this.nodes[index].isFixed) {
        this.nodes[index].nextPosition = p5.Vector.lerp(this.nodes[index].position, this.nodes[index + 1].position, ATTRACTION_FORCE);
      }
    }
  }

  //=========================================================================
  //  Repulsion
  //  ---------
  //  - Move the referenced node away from all nearby nodes within a radius
  //==========================================================================
  applyRepulsion(index) {
    for (let node of this.nodes) {
      let lowerRepulsionRadius = min(this.nodes[index].repulsionRadius, node.repulsionRadius);

      if (this.nodes[index].position.dist(node.position) <= lowerRepulsionRadius && !this.nodes[index].isFixed) {
        // Push the current node away from the iterating node
        // this.nodes[index].nextPosition
      }
    }
  }

  //==================================================================
  //  Alignment
  //  ---------
  //  - Move the referenced node closer to the midpoint of it's
  //    neighbor connected nodes to minimize curvature
  //==================================================================
  applyAlignment(index) {
    let previousNode, nextNode;

    // Find previous node, if there is one
    if (index - 1 > 0) {
      previousNode = this.nodes[index - 1];
    } else {
      if (index == 0 && this.isClosed) {
        previousNode = this.nodes[this.nodes.length];
      }
    }

    // Find next node, if there is one
    if (index + 1 < this.nodes.length) {
      nextNode = this.nodes[index + 1]
    } else {
      if (index == this.nodes.length && this.isClosed) {
        nextNode = this.nodes[0];
      }
    }

    if (previousNode != undefined && previousNode instanceof Node && nextNode != undefined && nextNode instanceof Node) {
      // Find the midpoint between the neighbors of this node
      let midpoint = p5.Vector.lerp(previousNode.position, nextNode.position, 0.5);

      // Move this point towards this midpoint
      this.nodes[index].nextPosition = p5.Vector.lerp(midpoint, this.nodes[index].position, ALIGNMENT_FORCE);
    }
  }

  //==================================================================
  //  Split edges
  //  -----------
  //  - Search for long edges, then inject a new node when found
  //==================================================================
  splitEdges() {
    for (let [index, node] of this.nodes.entries()) {
      if (index + 1 < this.nodes.length) {
        let lowerMaxDistance = min(this.nodes[index].maxDistance, this.nodes[index + 1].maxDistance);

        if (this.nodes[index].position.dist(this.nodes[index + 1].position) > lowerMaxDistance && this.nodes.length < MAX_NODES) {
          let newNode = new Node(p5.Vector.lerp(this.nodes[index].position, this.nodes[index + 1].position, 0.5), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS);
          this.nodes.splice(index + 1, 0, newNode);
        }
      }
    }
  }

  //==================================================================
  //  Inject a node
  //  -------------
  //  - Create a new node between two existing nodes
  //==================================================================
  injectNode() {
    // Choose two connected nodes at random
    let index = parseInt(random(0, this.nodes.length));
    let nextIndex = index + 1;

    // If the path is closed, wrap the index. Otherwise skip injecting this node.
    if (index == this.nodes.length - 1 && !this.closed) {
      return;
    } else if (index == this.nodes.length - 1 && this.closed) {
      nextIndex = 0;
    }

    // Create a new node with a slight vertical deviation to induce asymmetry
    let newNode = new Node(p5.Vector.lerp(this.nodes[index].position, this.nodes[nextIndex].position, 0.5).add(createVector(0, random(5, 100))), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS)

    // Splice new node into array
    this.nodes.splice(index, 0, newNode);
  }

  //==================================================================
  //  Draw
  //  ----
  //  - Draw all nodes and edges to the canvas
  //==================================================================
  draw() {
    fill(0);
    noStroke();

    // Draw all nodes
    for (let node of this.nodes) {
      node.draw();
    }

    stroke(0);

    // Draw edges between nodes
    for (let i = 0; i < this.nodes.length - 1; i++) {
      line(this.nodes[i].position.x, this.nodes[i].position.y, this.nodes[i + 1].position.x, this.nodes[i + 1].position.y);
    }

    // Draw a line between last and first node to close the path, if needed
    if (this.closed) {
      line(this.nodes[this.nodes.length - 1].position.x, this.nodes[this.nodes.length - 1].position.y, this.nodes[0].position.x, this.nodes[0].position.y);
    }
  }
}


//====================================
// Global variables
//====================================
const MIN_DISTANCE = 100;
const MAX_DISTANCE = 200;
const REPULSION_RADIUS = 100;
const NODE_INJECT_INTERVAL = 100;
const MAX_NODES = 50;
const VELOCITY = .1;

const ATTRACTION_FORCE = 1.25;
const REPULSION_FORCE = 0.001;
const ALIGNMENT_FORCE = 0.1;

const PADDING = 100;

let path;
let lastNodeInjectTime = 0;


//====================================
// Sketch
//====================================
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  // frameRate(10);

  // Create nodes
  let nodes = [
    new Node(createVector(window.innerWidth / 5, window.innerHeight / 2), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS, true),
    new Node(createVector(4 * window.innerWidth / 5, window.innerHeight / 2), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS, true)
  ];

  // Create path using nodes
  path = new Path(nodes);
}

function draw() {
  background(250);

  path.iterate();
  path.draw();

  // Inject a new node to introduce asymmetry every so often
  if (millis() - lastNodeInjectTime >= NODE_INJECT_INTERVAL && path.nodes.length < MAX_NODES) {
    path.injectNode();
    lastNodeInjectTime = millis();
  }
}