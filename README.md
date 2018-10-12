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

## References

* [Differential line growth with Processing](http://www.codeplastic.com/2017/07/22/differential-line-growth-with-processing/) by [Alberto Giachino (CodePlastic)](http://www.codeplastic.com/)
* [Differential line](https://inconvergent.net/generative/differential-line/) by [inconvergent](https://inconvergent.net/)
* [Sheparding Random Growth](https://inconvergent.net/2016/shepherding-random-growth/) by [inconvergent](https://inconvergent.net/)
* [Real-time differential growth in JavaScript](http://adrianton3.github.io/blog/art/differential-growth/differential-growth.html) by [Adrian Toncean](https://github.com/adrianton3)
* [Differential Line Growth](http://www.entagma.com/differential-line-growth/) by [Maritz Schwind](https://cargocollective.com/moritzschwind) of [Entagma](http://www.entagma.com/)
* [Differential Mesh Growth discussion thread](https://forums.odforce.net/topic/25534-differential-curve-growth/) on od|force forums
* [Differential Growth](https://codepen.io/MAKIO135/pen/EwYPmb) by [Lionel Radisson](http://makio135.com/) via CodePen
* [Organic Labrynths and Mazes](http://www.dgp.toronto.edu/~karan/artexhibit/mazes.pdf) (PDF) paper by Hans Pederson and Karen Singh

## Samples


![Single line growth process](01%-%20single%20line/images/01-growth-process.gif)