> [Read my Medium article](https://medium.com/@jason.webb/2d-differential-growth-in-js-1843fd51b0ce) to learn more about differential growth and this project.
>
> [Additional media is available on my portfolio](https://jasonwebb.io/2019/05/differential-growth-experiments-in-javascript)

This repo contains a series of visual experiments built with JavaScript that explore the topic of __differential growth__ as a method for generating interesting 2D forms.

I am particularly interested in the application of such techniques in the context of digital fabrication, so these experiments will be more focused on schematic representations (colorless, vector-based, SVG/STL exports) over purely visual effects.

## About differential growth

_Differential growth_ is a process that uses simple rules to produce undulating, buckling forms that mimic or simulate similar forms found in the natural world. Meandering rivers, rippled surface textures of plants/seeds/fruits, space-filling behaviors of worms, snakes, intestines, and more are all reminiscent of this process, perhaps even making use of some of the same principles through physical and organic components.

The process itself can be described algorithmically at a high level by first supposing that we are starting with a single continuous path consisting of points (called __nodes__) connected by lines (called __edges__). In such a system, we apply the following rules:

1. Each node wants to be closer to it's connected neighbors, and will experience an attraction force towards them.
2. Each node wants to sit on a straight line between it's neighbors to minimize curvature.
3. Each node must never be too close to any other node to prevent pinching or breaking of the overall continuity of the line.
4. When the distance between two nodes exceeds a predefined distance (due to the influence of the other rules), a new node must be injected between them to _split_ the line.
5. New nodes are introduced to the system according to some growth scheme in order to induce asymmetry.
    * Without this rule the entire system would just uniformly expand and reach an equilibrium state.

Within these rules you can see several opportunities for customization that enable a certain amount of creative direction to be imposed by the developer. These include:

* The __maximum distance__ between connected nodes before their shared edge is split.
* The __minimum distance__ between all nodes.
* The __attraction force__ between connected nodes.
* The __repulsion force__ between nearby nodes.
* The __radius__ around each node used to calculate which nearby nodes have an influence on it.
* A __growth scheme__ that determines when and how new nodes are introduced to the system to induce interesting asymmetry.

## Global keyboard controls
All of these keyboard controls are available in each experiment.

| Key     | Result                                         |
| ------- | ---------------------------------------------- |
| `1`-`9` | Change initial seed path shape (if available)  |
| `t`     | Toggle trace mode                              |
| `n`     | Toggle visibility of nodes                     |
| `r`     | Reset simulation with same parameters          |
| `Space` | Pause or unpause the simulation                |
| `i`     | Toggle inverting of colors                     |
| `d`     | Toggle "debug mode"                            |
| `f`     | Toggle shape fills                             |
| `h`     | Toggle drawing of periodic path history        |
| `s`     | Download an SVG of current geometry            |
| `b`     | Toggle visibility of path bounds               |

## Going further
This repository is more like a sketchbook, meant to contain some thematic scribbles on the topic of differential growth. I did not take a very rigorous approach in these experiments, opting to focus more on curiosity and effects than sheer performance and broader applications.

There are a lot of ways that the code I've written can be improved, or the algorithm itself explored more deeply, and I encourage you to take the next steps to expand upon what I've provided and create something new and awesome! Here are a few ideas that I've thought about exploring:

1. Tune forces (attraction, repulsion, and alignment) to identify stable and interesting regions of the parameter space.
2. Make optimization improvements to enable larger scales, without compromising too much in code readability.
    * Maybe a more efficient spatial index or nearest-neighbor algorithm can be found?
3. Move into the third dimension. Many routes to explore here, including:
   1. Keep the simulation focused on 2D, but take snapshots on intervals and increment Z position for next iteration.
   2. Use a 3D package like ThreeJS and map the same 2D simulation onto the surfaces of 3D meshes.
   3. Explore professional-grade VFX and CAD options like Houdini, Unity, and Rhino + Grasshopper to achieve extreme performance.
4. Port the code into a more performant language / framework like openFrameworks or Cinder. Even the Java-based Processing environment may show some performance gains!


## References

* [Differential line growth with Processing](http://www.codeplastic.com/2017/07/22/differential-line-growth-with-processing/) by [Alberto Giachino (CodePlastic)](http://www.codeplastic.com/)
* [Differential line](https://inconvergent.net/generative/differential-line/) by [inconvergent](https://inconvergent.net/)
* [Sheparding Random Growth](https://inconvergent.net/2016/shepherding-random-growth/) by [inconvergent](https://inconvergent.net/)
* [Real-time differential growth in JavaScript](http://adrianton3.github.io/blog/art/differential-growth/differential-growth.html) by [Adrian Toncean](https://github.com/adrianton3)
* [Differential Line Growth](http://www.entagma.com/differential-line-growth/) by [Maritz Schwind](https://cargocollective.com/moritzschwind) of [Entagma](http://www.entagma.com/)
* [Differential Mesh Growth discussion thread](https://forums.odforce.net/topic/25534-differential-curve-growth/) on od|force forums
* [Differential Growth](https://codepen.io/MAKIO135/pen/EwYPmb) by [Lionel Radisson](http://makio135.com/) via CodePen
* [Organic Labrynths and Mazes](http://www.dgp.toronto.edu/~karan/artexhibit/mazes.pdf) (PDF) paper by Hans Pederson and Karen Singh

## Local install instructions

1. Run `npm install` in both the root (`/`) and `core/` folders.
2. Run `gulp` to kick off a watch process and a browser window with LiveReload enabled.
3. Keep Gulp running and the browser window open while making changes. If all goes well, new builds will kick off when you save your changes and the browser will refresh!

## Packages used

* [p5js](https://www.npmjs.com/package/p5) for canvas drawing and miscellaneous helper functions (like `lerp` and `map`).
* [rbush](https://www.npmjs.com/package/rbush) for a fast R-tree spatial index implementation
* [rbush-knn](https://www.npmjs.com/package/rbush-knn) for k-nearest neighbors searching of rbush index
* [point-in-polygon](https://www.npmjs.com/package/point-in-polygon) for constraining nodes inside of bounding paths
* [svg-pathdata](https://www.npmjs.com/package/svg-pathdata) for extracting X,Y coordinates out of SVG `<path>` elements. Used to import SVG files.
* [svg-points](https://www.npmjs.com/package/svg-points) for generating the `d` attribute of SVG `<path>` elements. Used to export SVG files from paths.
* [file-saver](https://www.npmjs.com/package/file-saver) for initiating a download prompt when exporting SVG files
* [browserify](https://www.npmjs.com/package/browserify), [babel](https://www.npmjs.com/package/babel-core), and others for working with modern ES6 and module patterns.

## Samples

![Single line growth process](https://raw.githubusercontent.com/jasonwebb/2d-differential-growth-experiments/master/experiments/01%20-%20single%20line/images/01-growth-process.gif)

![Triangle](https://raw.githubusercontent.com/jasonwebb/2d-differential-growth-experiments/master/experiments/02%20-%20simple%20closed%20shape/images/02-triangle-growth.gif)

![Multiple shapes](https://raw.githubusercontent.com/jasonwebb/2d-differential-growth-experiments/master/experiments/03%20-%20multiple%20shapes/images/03-growth-normal.gif)

![SVG supershape as input](https://raw.githubusercontent.com/jasonwebb/2d-differential-growth-experiments/master/experiments/04%20-%20SVG%20as%20input/images/04-superformula-growth-process-inverted.gif)

![Opposing arcs converging](https://raw.githubusercontent.com/jasonwebb/2d-differential-growth-experiments/master/experiments/05%20-%20line%20studies/images/08-opp-arcs-solid-trace.png)