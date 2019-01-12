/** @module Defaults */

module.exports = {
  /**
   * Minimum distance between nodes. Used in attraction, pruning, and injection
   * @type {number}
   */
  MinDistance: 20,

  /**
   * Maximum distance between nodes before they are split
   * @type {number}
   */
  MaxDistance: 30,

  /**
   * Radius to search for nearby nodes for repulsion force 
   * @type {number}
   */
  RepulsionRadius: 20,

  /**
   * Maximum velocity at which a node can move per frame 
   * @type {number}
   */
  MaxVelocity: .1,

  /**
   * Maximum attraction force between connected nodes
   * @type {number}
   */
  AttractionForce: .001,

  /**
   * Maximum repulsion force between nearby nodes
   * @type {number}
   */
  RepulsionForce: 500,

  /**
   * Maximum alignment force between connected nodes
   * @type {number}
   */
  AlignmentForce: .001,

  /**
   * Interval (in ms) between call to node injection routine
   * @type {number}
   */
  NodeInjectionInterval: 100,

  /**
   * Show/hide circles for each node
   * @type {boolean}
   */
  DrawNodes: false,

  /**
   * Allow accumulation of path growth by disabling background repaints
   * @type {boolean}
   */
  TraceMode: false,

  /**
   * Turn on/off inverted colors
   * @type {boolean}
   */
  InvertedColors: false,

  /**
   * Turn on/off debug mode (per-edge colors)
   * @type {boolean}
   */
  DebugMode: false,

  /**
   * Turn on/off shape fills for closed paths
   * @type {boolean}
   */
  FillMode: false,

  /**
   * Turn on/off capturing and rendering of previous node positions to create a "tree ring" effect
   * @type {boolean}
   */
  DrawHistory: false,

  /**
   * Interval (in ms) between capture of paths for history effect
   * @type {number}
   */
  HistoryCaptureInterval: 1000,

  /**
   * Maximum number of previous paths to capture for history effect
   * @type {number}
   */
  MaxHistorySize: 10,

  /**
   * Turn on/off Brownian motion
   * @type {boolean}
   */
  UseBrownianMotion: true,

  /**
   * Amount to 'jiggle' nodes when Brownian motion is enabled
   * @type {number}
   */
  BrownianMotionRange: 0.01,

  /**
   * Draw all boundaries
   * @type {boolean}
   */
  ShowBounds: true
}