require("../test-env");

var graphs = require("../test-graphs");

describe("new dig.Graph", function() {
  describe("graph() constructor", function() {
    it("returns an empty graph", function() {
      var g = new dig.Graph();
      assert.deepEqual([], g.nodes());
    });
  });

  describe("order()", function() {
    it("returns the number of nodes in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      assert.equal(2, g.order());
    });

    it("returns 0 for a graph with no nodes", function() {
      assert.equal(0, new dig.Graph().order());
    });

    it("decreases when a node is removed", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.removeNode(1);
      assert.equal(0, g.order());
    });

    it("does not change when adding the same node a second time", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(1);
      assert.equal(1, g.order());
    });
  });

  describe("size()", function() {
    it("returns the number of edges in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.equal(1, g.size());
    });

    it("returns 0 for a graph with no edges", function() {
      assert.equal(0, new dig.Graph().size());
    });

    it("decreases when a node is removed", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      g.removeEdge(1, 2);
      assert.equal(0, g.size());
    });
  });

  describe("nodes()", function() {
    it("returns all nodes in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      assert.deepEqual([1, 2].sort(), g.nodes().sort());
    });
  });

  describe("edges()", function() {
    it("returns all edges in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.deepEqual([{from: 1, to: 2}], g.edges());
    });
  });

  describe("sources()", function() {
    it("returns all nodes in the graph with an indegree of 0", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.equal(1, g.sources());
    });
  });

  describe("sinks()", function() {
    it("returns all nodes in the graph with an outdegree of 0", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.equal(2, g.sinks());
    });
  });

  describe("copy()", function() {
    var source, copy;

    beforeEach(function() {
      source = new dig.Graph();
      source.addNode(1);
      source.addNode(2);
      source.addEdge(1, 2);

      copy = source.copy();
    });

    it("copies all nodes from the source graph", function() {
      assert.isTrue(copy.hasNode(1));
      assert.isTrue(copy.hasNode(2));
    });

    it("has the same order as the source graph", function() {
      assert.equal(source.order(), copy.order());
    });

    it("doesn't share node changes from copy to source", function() {
      copy.addNode(3);
      assert.isFalse(source.hasNode(3));
    });

    it("doesn't share node changes from source to copy", function() {
      source.addNode(4);
      assert.isFalse(copy.hasNode(4));
    });

    it("copies all edges from the source graph", function() {
      assert.isTrue(copy.hasEdge(1, 2));
    });

    it("doesn't share edge changes from copy to source", function() {
      copy.addEdge(2, 1);
      assert.isFalse(source.hasEdge(2, 1));
    });

    it("doesn't share edge changes from source to copy", function() {
      source.addEdge(2, 1);
      assert.isFalse(copy.hasEdge(2, 1));
    });
  });

  describe("hasNode(node)", function() {
    it("returns true if the node is in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      assert.isTrue(g.hasNode(1));
    });

    it("returns false if the node is not in the graph", function() {
      assert.isFalse(new dig.Graph().hasNode(1));
    });
  });

  describe("addNode(node)", function() {
    it("allows primitives to be added", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode("a");
      g.addNode(false);
      g.addNode(undefined);
      g.addNode(null);
      assert.isTrue(g.hasNode(1));
      assert.isTrue(g.hasNode("a"));
      assert.isTrue(g.hasNode(false));
      assert.isTrue(g.hasNode(undefined));
      assert.isTrue(g.hasNode(null));
    });

    it("allows objects to be added", function() {
      var obj1 = {key: "obj1"};
      var obj2 = {key: "obj2"};
      var g = new dig.Graph();
      g.addNode(obj1);
      g.addNode(obj2);
      assert.isTrue(g.hasNode(obj1));
      assert.isTrue(g.hasNode(obj2));
    });

    it("returns true if a new node is added", function() {
      assert.isTrue(new dig.Graph().addNode(1));
    });

    it("returns false if an existing node is added", function() {
      var g = new dig.Graph();
      g.addNode(1);
      assert.isFalse(g.addNode(1));
    });
  });

  describe("addNodes(node-0, ..., node-n)", function() {
    it("adds no nodes for 0 arguments", function() {
      var g = new dig.Graph();
      g.addNodes();
      assert.deepEqual([], g.nodes());
    });

    it("allows a vararg list of nodes to be added", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2, 3, 4);
      assert.isTrue(g.hasNode(1));
      assert.isTrue(g.hasNode(2));
      assert.isTrue(g.hasNode(3));
      assert.isTrue(g.hasNode(4));
    });

    it("returns undefined", function() {
      var g = new dig.Graph();
      assert.isUndefined(g.addNodes(1, 2, 3, 4));
    });

    it("does not add a node twice", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2, 2);
      assert.isTrue(g.hasNode(1));
      assert.isTrue(g.hasNode(2));
      assert.equal(2, g.order());
    });
  });

  describe("removeNode(node)", function() {
    it("returns true if the node was removed from the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      assert.isTrue(g.removeNode(1));
    });

    it("returns false if the node was not in the graph", function() {
      assert.isFalse(new dig.Graph().removeNode(1)); 
    });
  });

  describe("hasEdge(from, to)", function() {
    it("returns true if the edge is in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isTrue(g.hasEdge(1, 2));
    });

    it("returns false if the edge is not in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isFalse(g.hasEdge(2, 1));
    });
  });

  describe("addEdge(from, to)", function() {
    it("adds a directed edge from one node to another", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isTrue(g.hasEdge(1, 2));
    });

    it("returns true if the edge was added", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      assert.isTrue(g.addEdge(1, 2));
    });

    it("returns false if the edge was already in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isFalse(g.addEdge(1, 2));
    });

    it("throws an error ifone of the nodes was not in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      assert.throws(function() { g.addEdge(1, 2); });
      assert.isFalse(g.hasEdge(1, 2));
    });
  });

  describe("addPath(node-0, ..., node-n)", function() {
    it("adds no edge for 0 arguments", function() {
      var g = new dig.Graph();
      g.addPath();
      assert.deepEqual([], g.edges());
    });

    it("adds no edge for 1 argument", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addPath(1);
      assert.deepEqual([], g.edges());
    });

    it("adds a single edge for 2 arguments", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2);
      g.addPath(1, 2);
      assert.isTrue(g.hasEdge(1, 2));
      assert.equal(1, g.size());
    });

    it("adds edges pairwise (node-1, node-2), (node-2, node-3)", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2, 3);
      g.addPath(1, 2, 3);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 3));
      assert.equal(2, g.size());
    });

    it("does not add the same edge twice", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2, 3);
      g.addPath(1, 2, 3, 2, 3);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 3));
      assert.isTrue(g.hasEdge(3, 2));
      assert.equal(3, g.size());
    });

    it("allows cycles to be added", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2);
      g.addPath(1, 2, 1);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 1));
    });

    it("throws an error for edges with a node not in the graph", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2);
      assert.throws(function() { g.addPath(1, 2, 3); });
    });

    it("returns undefined", function() {
      var g = new dig.Graph();
      g.addNodes(1, 2);
      assert.isUndefined(g.addPath(1, 2));
    });
  });

  describe("removeEdge(from, to)", function() {
    it("returns true if the edge was removed from the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isTrue(g.removeEdge(1, 2));
      assert.isFalse(g.hasEdge(1, 2));
    });

    it("returns false if the edge is not in the graph", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      assert.isFalse(g.removeEdge(1, 2));
    });
  });

  describe("indegree(node)", function() {
    it("returns the number of in-edges to a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.equal(0, g.indegree(1));
      assert.equal(1, g.indegree(2));
      assert.equal(2, g.indegree(3));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().indegree(1); });
    });
  });

  describe("outdegree(node)", function() {
    it("returns the number of out-edges from a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.equal(2, g.outdegree(1));
      assert.equal(1, g.outdegree(2));
      assert.equal(0, g.outdegree(3));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().outdegree(1); });
    });
  });

  describe("degree(node)", function() {
    it("returns the number of in- and out-edges for a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.equal(2, g.degree(1));
      assert.equal(2, g.degree(2));
      assert.equal(2, g.degree(3));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().degree(1); });
    });
  });

  describe("predecessors(node)", function() {
    it("returns the nodes that have an out-edge to a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual([], g.predecessors(1).sort());
      assert.deepEqual([1], g.predecessors(2).sort());
      assert.deepEqual([1, 2], g.predecessors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().predecessors(1); });
    });
  });

  describe("successors(node)", function() {
    it("returns the nodes that have an in-edge from a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual([2, 3], g.successors(1).sort());
      assert.deepEqual([3], g.successors(2).sort());
      assert.deepEqual([], g.successors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().successors(1); });
    });
  });

  describe("neighbors(node)", function() {
    it("returns the nodes that share an edge with a node", function() {
      var g = new dig.Graph();
      g.addNode(1);
      g.addNode(2);
      g.addNode(3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual([2, 3], g.neighbors(1).sort());
      assert.deepEqual([1, 3], g.neighbors(2).sort());
      assert.deepEqual([1, 2], g.neighbors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.Graph().neighbors(1); });
    });
  });

  describe("isAcyclic()", function() {
    it("returns true for node1", function() {
      assert.isTrue(graphs.node1.isAcyclic());
    });

    it("returns true for node2", function() {
      assert.isTrue(graphs.node2.isAcyclic());
    });

    it("returns true for edge1", function() {
      assert.isTrue(graphs.edge1.isAcyclic());
    });

    it("returns true for edge2", function() {
      assert.isTrue(graphs.edge2.isAcyclic());
    });

    it("returns false for selfLoop", function() {
      assert.isFalse(graphs.selfLoop.isAcyclic());
    });

    it("returns false for cycle2", function() {
      assert.isFalse(graphs.cycle2.isAcyclic());
    });

    it("returns false for nestedCycle2", function() {
      assert.isFalse(graphs.nestedCycle2.isAcyclic());
    });

    it("returns false for cycle3", function() {
      assert.isFalse(graphs.cycle3.isAcyclic());
    });

    it("returns false for nestedCycle3", function() {
      assert.isFalse(graphs.nestedCycle3.isAcyclic());
    });

    it("returns false for bridgedCycle", function() {
      assert.isFalse(graphs.bridgedCycle.isAcyclic());
    });

    it("returns false for twoCycle3", function() {
      assert.isFalse(graphs.twoCycle3.isAcyclic());
    });

    it("returns false for scc3", function() {
      assert.isFalse(graphs.scc3.isAcyclic());
    });

    it("returns true for diamond", function() {
      assert.isTrue(graphs.diamond.isAcyclic());
    });
  });

  describe("equals(graph)", function() {
    it("returns true for the same graph", function() {
      assert.isTrue(graphs.scc3.equals(graphs.scc3));
    });

    it("returns true for a graph that has the same nodes and edges", function() {
      var graph = new dig.Graph();
      graph.addNodes(1, 2);
      graph.addEdge(1, 2);

      var graph2 = new dig.Graph();
      graph2.addNodes(1, 2);
      graph2.addEdge(1, 2);

      assert.isTrue(graph.equals(graph2));
      assert.isTrue(graph2.equals(graph));
    });

    it("returns false for graphs that have different nodes", function() {
      var graph = new dig.Graph();
      graph.addNode(1);

      var graph2 = new dig.Graph();
      graph2.addNode(2);

      assert.isFalse(graph.equals(graph2));
      assert.isFalse(graph2.equals(graph));
    });

    it("returns false for graphs that have different edges", function() {
      var graph = new dig.Graph();
      graph.addNodes(1, 2, 3);
      graph.addEdge(1, 2);

      var graph2 = new dig.Graph();
      graph2.addNodes(1, 2, 3);
      graph2.addEdge(2, 3);

      assert.isFalse(graph.equals(graph2));
      assert.isFalse(graph2.equals(graph));
    });
  });
});
