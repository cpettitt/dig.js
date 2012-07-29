require('./test-env');

var singleton = new dig.Graph();
singleton.addNode(1);
exports.singleton = singleton;

var twoNodeDisjoint = new dig.Graph();
twoNodeDisjoint.addNodes(1, 2);
exports.twoNodeDisjoint = twoNodeDisjoint;

var singleEdge = new dig.Graph();
singleEdge.addNodes(1, 2);
singleEdge.addEdge(1, 2);
exports.singleEdge = singleEdge;

var twoEdge = new dig.Graph();
twoEdge.addNodes(1, 2, 3);
twoEdge.addPath(1, 2, 3);
exports.twoEdge = twoEdge;

var selfLoop = new dig.Graph();
selfLoop.addNode(1);
selfLoop.addEdge(1, 1);
exports.selfLoop = selfLoop;

var shortCycle = new dig.Graph();
shortCycle.addNodes(1, 2);
shortCycle.addPath(1, 2, 1);
exports.shortCycle = shortCycle;

var diamond = new dig.Graph();
diamond.addNodes(1, 2, 3, 4);
diamond.addPath(1, 2, 4);
diamond.addPath(1, 3, 4);
exports.diamond = diamond;

var nestedCycle = shortCycle.copy();
nestedCycle.addNodes(0, 3);
nestedCycle.addEdge(0, 1);
nestedCycle.addEdge(2, 3);
exports.nestedCycle = nestedCycle;
