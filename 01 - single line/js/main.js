//=========================================
// Node
//=========================================
class Node {
  constructor(position, minDistance, maxDistance, repulsionRadius, isFixed = false) {
    this.position = position;
    this.currentPosition = position;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
    this.repulsionRadius = repulsionRadius;
    this.isFixed = isFixed;
  }

  draw() {
    ellipse(this.position.x, this.position.y, 5);
  }
}


//==========================================
// Path
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

  iterate() {
    for (let [index, node] of this.nodes.entries()) {
      // Move towards neighbors (attraction), if there is space to move
      this.applyAttraction(index)

      // Move away from any nodes that are too close (repulsion)
      // this.applyRepulsion(index);

      // Align with neighbors
      // this.applyAlignment(index);
    }

    // Split edge if too long
    this.splitEdges();

    // Inject node to produce asymmetry, if needed
    // - Only do this at specific time intervals?
    // this.injectNode();
  }

  applyAttraction(index) {
    let lowerMinDistance, distance;

    // Move towards previous node, if there is one
    if (index - 1 >= 0) {
      lowerMinDistance = min(this.nodes[index - 1].minDistance, this.nodes[index].minDistance);
      distance = this.nodes[index].position.dist(this.nodes[index - 1].position);

      if (distance > lowerMinDistance && !this.nodes[index].isFixed) {
        this.nodes[index].position = p5.Vector.lerp(this.nodes[index].position, this.nodes[index - 1].position, 0.25);
      }
    }

    // Move towards next node, if there is one
    if (index + 1 < this.nodes.length) {
      lowerMinDistance = min(this.nodes[index].minDistance, this.nodes[index + 1].minDistance);
      distance = this.nodes[index].position.dist(this.nodes[index + 1].position);

      if (distance > lowerMinDistance && !this.nodes[index].isFixed) {
        this.nodes[index].position = p5.Vector.lerp(this.nodes[index].position, this.nodes[index + 1].position, 0.25);
      }
    }
  }

  applyRepulsion(index) {
    for(let node of this.nodes) {
      let lowerRepulsionRadius = min(this.nodes[index].repulsionRadius, node.repulsionRadius);

      if(this.nodes[index].position.dist(node.position) <= lowerRepulsionRadius && !this.nodes[index].isFixed) {
        // Push the current node away from the iterating node
        this.nodes[index].position.mult(1.001);
      }
    }
  }

  applyAlignment(index) {
    // Find the midpoint between the neighbors of this node
    // Move this point towards this midpoint
  }

  splitEdges() {
    for (let [index, node] of this.nodes.entries()) {
      if (index + 1 < this.nodes.length) {
        let lowerMaxDistance = min(this.nodes[index].maxDistance, this.nodes[index + 1].maxDistance);

        if (this.nodes[index].position.dist(this.nodes[index+1].position) > lowerMaxDistance) {
          let newNode = new Node(p5.Vector.lerp(this.nodes[index].position, this.nodes[index+1].position, 0.5), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS);
          this.nodes.splice(index+1, 0, newNode);
        }
      }
    }
  }

  injectNode() {
    // Choose two connected nodes at random
    let index = parseInt(random(0, this.nodes.length));
    let nextIndex = index + 1;

    // If the path is closed, wrap the index. Otherwise skip injecting this node.
    if(index == this.nodes.length-1 && !this.closed) {
      return;
    } else if(index == this.nodes.length && this.closed) {
      nextIndex = 0;
    }

    // Create a new node with a slight vertical deviation to induce asymmetry
    let newNode = new Node( p5.Vector.lerp(this.nodes[index].position, this.nodes[nextIndex].position, 0.5).add(createVector(0,random(5,100))), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS)
    
    // Splice new node into array
    this.nodes.splice(index, 0, newNode);
  }

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
const REPULSION_RADIUS = 200;

let path;


//====================================
// Sketch
//====================================
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(1);

  // Create nodes
  let nodes = [
    new Node(createVector(window.innerWidth / 2 - 200, window.innerHeight / 2), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS, true),
    new Node(createVector(window.innerWidth / 2 + 200, window.innerHeight / 2), MIN_DISTANCE, MAX_DISTANCE, REPULSION_RADIUS, true)
  ];

  // Create path using nodes
  path = new Path(nodes);
  // path.isClosed();
}

function draw() {
  background(250);

  path.iterate();
  path.draw();
}