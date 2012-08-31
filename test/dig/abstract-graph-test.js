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
    source.node(1).a = 1;
    source.addEdge(1, 2);

    copy = source.copy();
  });

  it("copies all nodes from the source graph", function() {
    assert.graphEqual(source, copy);
  });

  it("doesn't share node changes between copy and source", function() {
    copy.addNode(4);
    assert.isFalse(source.hasNode(4));
    copy.node(2).key = "a";
    assert.isUndefined(source.node(2).key);

    source.addNode(5);
    assert.isFalse(copy.hasNode(5));
    source.node(3).key = "b";
    assert.isUndefined(copy.node(3).key);
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

  it("returns false for graphs that have different node attributes", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.node(1).key = "value";
    g.addEdge(1, 2);

    var g2 = ctor();
    g2.addNodes(1, 2);
    g2.addEdge(1, 2);

    assert.isFalse(g.equals(g2));
    assert.isFalse(g2.equals(g));
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

  it("returns false for graphs that have different edge attributes", function() {
    var g = ctor();
    g.addNodes(1, 2, 3);
    g.addEdge(1, 2);

    var g2 = ctor();
    g2.addNodes(1, 2, 3);
    g2.addEdge(1, 2, {a: 1});

    assert.isFalse(g.equals(g2));
    assert.isFalse(g2.equals(g));
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

  it("optionally allows attributes to be set on a node", function() {
    var g = ctor();
    var attrs = {xyz: 123};
    g.addNode(1, attrs);
    assert.deepEqual({xyz: 123}, g.node(1));

    // attributes are shallow copies, so changes to the original object should
    // not be reflected in the graph.
    attrs.abc = 456;
    assert.deepEqual({xyz: 123}, g.node(1));
  });

  it("optionally merges attributes if the node already exists", function() {
    var g = ctor();
    g.addNode(1, {a: 1, b: 2});
    g.addNode(1, {b: 3, c: 4}); 
    assert.deepEqual({a:1, b: 3, c: 4}, g.node(1));
  });

  it("throws an error if the attributes are not an object", function() {
    var g = ctor();
    assert.throws(function() { g.addNode(1, 3); });
    assert.throws(function() { g.addNode(1, "a"); });
    assert.throws(function() { g.addNode(1, false); });
    assert.throws(function() { g.addNode(1, null); });
    assert.throws(function() { g.addNode(1,  undefined); });
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

exports.describeNode = function(ctor) {
  it("returns the attributes for the node", function() {
    var g = ctor();
    g.addNode(1);

    assert.isUndefined(g.node(1).key);
    g.node(1).key = 1;
    assert.equal(1, g.node(1).key);
  });

  it("throws an error if the node doesn't exist", function() {
    assert.throws(function() { ctor().node(1); });
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

  it("optionally allows attributes to be set on the edge", function() {
    var g = ctor();
    var attrs = {xyz: 123};
    g.addNodes(1, 2);
    g.addEdge(1, 2, attrs);

    assert.deepEqual({xyz: 123}, g.edge(1, 2));

    // attributes are shallow copies, so changes to the original object should
    // not be reflected in the graph.
    attrs.abc = 456;
    assert.deepEqual({xyz: 123}, g.edge(1, 2));
  });

  it("optionally merges attributes if the edge already exists", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2, {a: 1, b: 2});
    g.addEdge(1, 2, {b: 3, c: 4}); 
    assert.deepEqual({a:1, b: 3, c: 4}, g.edge(1, 2));
  });

  it("throws an error if one of the nodes was not in the graph", function() {
    var g = ctor();
    g.addNode(1);
    assert.throws(function() { g.addEdge(1, 2); });
    assert.isFalse(g.hasEdge(1, 2));
  });

  it("throws an error if the attributes are not an object", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.throws(function() { g.addEdge(1, 2, 3); });
    assert.throws(function() { g.addEdge(1, 2, "a"); });
    assert.throws(function() { g.addEdge(1, 2, false); });
    assert.throws(function() { g.addEdge(1, 2, null); });
    assert.throws(function() { g.addEdge(1, 2, undefined); });
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

exports.describeEdge = function(ctor) {
  it("returns the attributes for the edge", function() {
    var g = ctor();
    g.addNodes(1, 2);
    g.addEdge(1, 2);

    assert.isUndefined(g.edge(1, 2).key);
    g.edge(1, 2).key = 1;
    assert.equal(1, g.edge(1, 2).key);
  });

  it("throws an error if the edge doesn't exist", function() {
    var g = ctor();
    g.addNodes(1, 2);
    assert.throws(function() { g.edge(1, 2); });
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
