module.exports = {
  // Minimum distance between nodes
  // - used in attraction, pruning, and injection
  MinDistance: 20,

  // Maximum distance between nodes before they are split
  MaxDistance: 30,

  // Radius to search for nearby nodes for repulsion force 
  RepulsionRadius: 20,

  // Maximum velocity at which a node can move per frame 
  MaxVelocity: .1,

  // Maximum attraction force between connected nodes
  AttractionForce: .001,

  // Maximum repulsion force between nearby nodes
  RepulsionForce: 500,

  // Maximum alignment force between connected nodes
  AlignmentForce: .001,

  // Interval (in ms) between call to node injection routine
  NodeInjectionInterval: 100,

  // Show/hide circles for each node
  DrawNodes: false,

  // Allow accumulation of path growth by disabling background repaints
  TraceMode: false,

  // Turn on/off inverted colors
  // - false = black on white, true = white on black
  InvertedColors: false,

  // Turn on/off debug mode (per-edge colors)
  DebugMode: false,

  // Turn on/off shape fills for closed paths
  FillMode: false,

  // Turn on/off capturing and rendering of previous node positions to create a "tree ring" effect
  DrawHistory: true,

  // Turn on/off Brownian motion
  UseBrownianMotion: true,

  // Amount to 'jiggle' nodes when Brownian motion is enabled
  BrownianMotionRange: 0.01
}