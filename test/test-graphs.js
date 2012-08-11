require('./test-env');

var node1 = new dig.DiGraph();
node1.addNode(1);
exports.node1 = node1;

var node2 = new dig.DiGraph();
node2.addNodes(1, 2);
exports.node2 = node2;

var edge1 = new dig.DiGraph();
edge1.addNodes(1, 2);
edge1.addEdge(1, 2);
exports.edge1 = edge1;

var edge2 = new dig.DiGraph();
edge2.addNodes(1, 2, 3);
edge2.addPath(1, 2, 3);
exports.edge2 = edge2;

var selfLoop = new dig.DiGraph();
selfLoop.addNode(1);
selfLoop.addEdge(1, 1);
exports.selfLoop = selfLoop;

var cycle2 = new dig.DiGraph();
cycle2.addNodes(1, 2);
cycle2.addPath(1, 2, 1);
exports.cycle2 = cycle2;

var nestedCycle2 = cycle2.copy();
nestedCycle2.addNodes(0, 3);
nestedCycle2.addEdge(0, 1);
nestedCycle2.addEdge(2, 3);
exports.nestedCycle2 = nestedCycle2;

var cycle3 = new dig.DiGraph();
cycle3.addNodes(1, 2, 3);
cycle3.addPath(1, 2, 3, 1);
exports.cycle3 = cycle3;

var nestedCycle3 = cycle3.copy();
nestedCycle3.addNodes(0, 4);
nestedCycle3.addEdge(0, 1);
nestedCycle3.addEdge(3, 4);
exports.nestedCycle3 = nestedCycle3;

var bridgedCycle = new dig.DiGraph();
bridgedCycle.addNodes(1, 2, 3);
bridgedCycle.addPath(1, 2, 3, 2, 1);
exports.bridgedCycle = bridgedCycle;

// 2 cycle3's connected by a single directed edge
var twoCycle3 = new dig.DiGraph();
twoCycle3.addNodes(1, 2, 3, 4, 5, 6);
twoCycle3.addPath(1, 2, 3, 1);
twoCycle3.addPath(4, 5, 6, 4);
twoCycle3.addEdge(3, 4);
exports.twoCycle3 = twoCycle3;

// 3 strongly-connected components a la
// http://en.wikipedia.org/wiki/File:Scc.png, using numbers instead of
// letters.
var scc3 = new dig.DiGraph();
scc3.addNodes(1, 2, 3, 4, 5, 6, 7, 8);
scc3.addPath(1, 2, 5, 1);
scc3.addPath(6, 7, 6);
scc3.addPath(3, 4, 8, 4, 3);
scc3.addEdge(2, 3);
scc3.addEdge(2, 6);
scc3.addEdge(3, 7);
scc3.addEdge(5, 6);
scc3.addEdge(8, 7);
exports.scc3 = scc3;

var diamond = new dig.DiGraph();
diamond.addNodes(1, 2, 3, 4);
diamond.addPath(1, 2, 4);
diamond.addPath(1, 3, 4);
exports.diamond = diamond;
