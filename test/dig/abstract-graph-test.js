require("../test-env");

var graphs = require("../test-graphs");

exports.describeConstructor = function(ctor) {
  it("returns an empty graph", function() {
    assert.deepEqual([], ctor().nodes());
  });
};

exports.describeOrder = function(ctor) {
  it("returns the number of nodes in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.equal(2, g.order());
  });

  it("returns 0 for a graph with no nodes", function() {
    assert.equal(0, ctor().order());
  });

  it("decreases when a node is removed", function() {
    var g = ctor();
    g.addNode(1);
    g.removeNode(1);
    assert.equal(0, g.order());
  });

  it("does not change when adding the same node a second time", function() {
    var g = ctor();
    g.addNode(1);
    g.addNode(1);
    assert.equal(1, g.order());
  });
};

exports.describeSize = function(ctor) {
  it("returns the number of edges in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    assert.equal(1, g.size());
  });

  it("returns 0 for a graph with no edges", function() {
    assert.equal(0, ctor().size());
  });

  it("decreases when a node is removed", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    g.removeEdge(1, 2);
    assert.equal(0, g.size());
  });
};

exports.describeCopy = function(ctor) {
  var source, copy;

  beforeEach(function() {
    source = ctor();
    source.addNodes(1, 2, 3);
    source.nodeLabel(1, "a");
    source.addEdge(1, 2);

    copy = source.copy();
  });

  it("copies all nodes from the source graph", function() {
    assert.equal(source.order(), copy.order());
    assert.isTrue(copy.hasNode(1));
    assert.isTrue(copy.hasNode(2));
    assert.isTrue(copy.hasNode(3));
    assert.equal(source.nodeLabel(1), copy.nodeLabel(1));
    assert.equal(source.nodeLabel(2), copy.nodeLabel(2));
    assert.equal(source.nodeLabel(3), copy.nodeLabel(3));
  });

  it("doesn't share node changes between copy and source", function() {
    copy.addNode(4);
    assert.isFalse(source.hasNode(4));
    copy.nodeLabel(2, "b");
    assert.isUndefined(source.nodeLabel(2));

    source.addNode(5);
    assert.isFalse(copy.hasNode(5));
    source.nodeLabel(3, "c");
    assert.isUndefined(copy.nodeLabel(3));
  });

  it("copies all edges from the source graph", function() {
    assert.isTrue(copy.hasEdge(1, 2));
  });

  it("doesn't share edge changes between copy and source", function() {
    copy.addEdge(1, 3);
    assert.isFalse(source.hasEdge(1, 3));

    source.addEdge(2, 3);
    assert.isFalse(copy.hasEdge(2, 3));
  });
};

exports.describeEquals = function(ctor) {
  it("returns true for a graph that has the same nodes and edges", function() {
    var graph = ctor();
    graph.addNodes(1, 2);
    graph.addEdge(1, 2);

    var graph2 = ctor();
    graph2.addNodes(1, 2);
    graph2.addEdge(1, 2);

    assert.isTrue(graph.equals(graph2));
    assert.isTrue(graph2.equals(graph));
  });

  it("returns false for graphs that have different nodes", function() {
    var graph = ctor();
    graph.addNode(1);

    var graph2 = ctor();
    graph2.addNode(2);

    assert.isFalse(graph.equals(graph2));
    assert.isFalse(graph2.equals(graph));
  });

  it("returns false for graphs that have different edges", function() {
    var graph = ctor();
    graph.addNodes(1, 2, 3);
    graph.addEdge(1, 2);

    var graph2 = ctor();
    graph2.addNodes(1, 2, 3);
    graph2.addEdge(2, 3);

    assert.isFalse(graph.equals(graph2));
    assert.isFalse(graph2.equals(graph));
  });
};

exports.describeNodes = function(ctor) {
  it("returns `[]` for an empty graph", function() {
    assert.deepEqual([], ctor().nodes());
  });

  it("returns all nodes in the graph", function() {
    var g = ctor();
    g.addNode(1);
    g.addNode(2);
    assert.deepEqual([1, 2].sort(), g.nodes().sort());
  });
};

exports.describeHasNode = function(ctor) {
  it("returns true if the node is in the graph", function() {
    var g = ctor();
    g.addNode(1);
    assert.isTrue(g.hasNode(1));
  });

  it("returns false if the node is not in the graph", function() {
    assert.isFalse(ctor().hasNode(1));
  });
};

exports.describeAddNode = function(ctor) {
  it("coerces nodes to strings", function() {
    var g = ctor();
    g.addNodes(1);
    g.addNode("a");
    g.addNode(false);
    g.addNode(undefined);
    g.addNode(null);
    assert.isTrue(g.hasNode(1));
    assert.isTrue(g.hasNode("1"));
    assert.isTrue(g.hasNode("a"));
    assert.isTrue(g.hasNode(false));
    assert.isTrue(g.hasNode("false"));
    assert.isTrue(g.hasNode(undefined));
    assert.isTrue(g.hasNode("undefined"));
    assert.isTrue(g.hasNode(null));
    assert.isTrue(g.hasNode("null"));
  });

  it("returns true if a new node is added", function() {
    assert.isTrue(ctor().addNode(1));
  });

  it("returns false if an existing node is added", function() {
    var g = ctor();
    g.addNode(1);
    assert.isFalse(g.addNode(1));
  });
};

exports.describeAddNodes = function(ctor) {
  it("adds no nodes for 0 arguments", function() {
    var g = ctor();
    g.addNodes();
    assert.deepEqual([], g.nodes());
  });

  it("allows a vararg list of nodes to be added", function() {
    var g = ctor();
    g.addNodes(1, 2, 3, 4);
    assert.isTrue(g.hasNode(1));
    assert.isTrue(g.hasNode(2));
    assert.isTrue(g.hasNode(3));
    assert.isTrue(g.hasNode(4));
  });

  it("returns undefined", function() {
    var g = ctor();
    assert.isUndefined(g.addNodes(1, 2, 3, 4));
  });

  it("does not add a node twice", function() {
    var g = ctor();
    g.addNodes(1, 2, 2);
    assert.isTrue(g.hasNode(1));
    assert.isTrue(g.hasNode(2));
    assert.equal(2, g.order());
  });
};

exports.describeNodeLabelGetter = function(ctor) {
  it("returns node label or undefined if the node is unlabelled", function() {
    var g = ctor();
    g.addNodes(1, 2);

    assert.isUndefined(g.nodeLabel(1));

    g.nodeLabel(2, "xyz");
    assert.equal("xyz", g.nodeLabel(2));

    // Check again to make sure that caling nodeLabel did not remove the label
    assert.equal("xyz", g.nodeLabel(2));
  });

  it("throws an error if the node doesn't exist", function() {
    assert.throws(function() { ctor().nodeLabel(1); });
  });
};

exports.describeNodeLabelSetter = function(ctor) {
  it("sets a label", function() {
    var g = ctor();
    g.addNode(1);

    var prev = g.nodeLabel(1, "a");
    assert.equal("a", g.nodeLabel(1));
    assert.isUndefined(prev);
  });

  it("replaces a label if it exists", function() {
    var g = ctor();
    g.addNode(1);

    g.nodeLabel(1, "a");
    var prev = g.nodeLabel(1, "b");
    assert.equal("b", g.nodeLabel(1));
    assert.equal("a", prev);
  });

  it("allows any arbitrary object", function() {
    var g = ctor();
    g.addNodes(1);

    var obj = {k: 1};
    g.nodeLabel(1, obj);
    assert.strictEqual(obj, g.nodeLabel(1));
  });

  it("throws an error if the node doesn't exist", function() {
    assert.throws(function() { ctor().nodeLabel(1, "xyz"); });
  });
};

exports.describeRemoveNode = function(ctor) {
  it("returns true if the node was removed from the graph", function() {
    var g = ctor();
    g.addNode(1);
    assert.isTrue(g.removeNode(1));
  });

  it("returns false if the node was not in the graph", function() {
    assert.isFalse(ctor().removeNode(1)); 
  });

  it("removes edges incident to the node", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    g.removeNode(1);
    assert.isFalse(g.hasEdge(1, 2));
  });
};

exports.describeEdges = function(ctor) {
  it("returns `[]` for a graph with no edges", function() {
    assert.deepEqual([], ctor().edges());
  });
};

exports.describeHasEdge = function(ctor) {
  it("returns true if the edge is in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    assert.isTrue(g.hasEdge(1, 2));
  });

  it("returns false if the edge is not in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addEdge(1, 2);
    assert.isFalse(g.hasEdge(2, 3));
  });
};

exports.describeAddEdge = function(ctor) {
  it("returns true if the edge was added", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.isTrue(g.addEdge(1, 2));
  });

  it("returns false if the edge was already in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    assert.isFalse(g.addEdge(1, 2));
  });

  it("allows an optional label to added to the edge", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2, "a");
    assert.equal("a", g.edgeLabel(1, 2));
  });

  it("throws an error if one of the nodes was not in the graph", function() {
    var g = ctor();
    g.addNode(1);
    assert.throws(function() { g.addEdge(1, 2); });
    assert.isFalse(g.hasEdge(1, 2));
  });
}

exports.describeAddPath = function(ctor) {
  it("adds no edge for 0 arguments", function() {
    var g = ctor();
    g.addPath();
    assert.deepEqual([], g.edges());
  });

  it("adds no edge for 1 argument", function() {
    var g = ctor();
    g.addNode(1);
    g.addPath(1);
    assert.deepEqual([], g.edges());
  });

  it("adds a single edge for 2 arguments", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addPath(1, 2);
    assert.isTrue(g.hasEdge(1, 2));
    assert.equal(1, g.size());
  });

  it("adds edges pairwise (node-1, node-2), (node-2, node-3)", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addPath(1, 2, 3);
    assert.isTrue(g.hasEdge(1, 2));
    assert.isTrue(g.hasEdge(2, 3));
    assert.equal(2, g.size());
  });

  it("allows cycles to be added", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addPath(1, 2, 3, 1);
    assert.isTrue(g.hasEdge(1, 2));
    assert.isTrue(g.hasEdge(2, 3));
    assert.isTrue(g.hasEdge(3, 1));
  });

  it("throws an error for edges with a node not in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.throws(function() { g.addPath(1, 2, 3); });
  });

  it("returns undefined", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.isUndefined(g.addPath(1, 2));
  });
};

exports.describeEdgeLabelGetter = function(ctor) {
  it("returns edge label or undefined if the edge is unlabelled", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addPath(1, 2, 3);

    assert.isUndefined(g.edgeLabel(1, 2));

    g.edgeLabel(2, 3, "a");
    assert.equal("a", g.edgeLabel(2, 3));

    // Check again to make sure that caling edgeLabel did not remove the label
    assert.equal("a", g.edgeLabel(2, 3));
  });

  it("throws an error if the edge doesn't exist", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.throws(function() { g.edgeLabel(1, 2); });
  });
};

exports.describeEdgeLabelSetter = function(ctor) {
  it("sets a label", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);

    var prev = g.edgeLabel(1, 2, "a");
    assert.equal("a", g.edgeLabel(1, 2));
    assert.isUndefined(prev);
  });

  it("replaces a label if it exists", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);

    g.edgeLabel(1, 2, "a");
    var prev = g.edgeLabel(1, 2, "b");
    assert.equal("b", g.edgeLabel(1, 2));
    assert.equal("a", prev);
  });

  it("allows any arbitrary object", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);

    var obj = {k: 1};
    g.edgeLabel(1, 2, obj);
    assert.strictEqual(obj, g.edgeLabel(1, 2));
  });

  it("throws an error if the edge doesn't exist", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.throws(function() { g.edgeLabel(1, 2, "a"); });
  });
};

exports.describeRemoveEdge = function(ctor) {
  it("returns true if the edge was removed from the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);
    assert.isTrue(g.removeEdge(1, 2));
    assert.isFalse(g.hasEdge(1, 2));
  });

  it("returns false if the edge is not in the graph", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.isFalse(g.removeEdge(1, 2));
  });
};

exports.describeDegree = function(ctor) {
  it("returns the number of edges incident to a node", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    assert.equal(2, g.degree(1));
    assert.equal(1, g.degree(2));
    assert.equal(1, g.degree(3));
  });

  it("throws an error when the node is not in the graph", function() {
    assert.throws(function() { ctor().degree(1); });
  });
};
