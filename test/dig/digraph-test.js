require("../test-env");

var graphs = require("../test-graphs");
var abstract = require("./abstract-graph-test");

describe("dig.DiGraph", function() {
  var ctor = function() { return new dig.DiGraph(); };

  describe("constructor", function() {
    abstract.describeConstructor(ctor);
  });

  describe("order()", function() {
    abstract.describeOrder(ctor);
  });

  describe("size()", function() {
    abstract.describeSize(ctor);
  });

  describe("copy()", function() {
    abstract.describeCopy(ctor);
  });

  describe("nodes()", function() {
    abstract.describeNodes(ctor);
  });

  describe("hasNode(node)", function() {
    abstract.describeHasNode(ctor);
  });

  describe("addNode(node)", function() {
    abstract.describeAddNode(ctor);
  });

  describe("addNodes(node-0, ..., node-n)", function() {
    abstract.describeAddNodes(ctor);
  });

  describe("nodeLabel(u)", function() {
    abstract.describeNodeLabelGetter(ctor);
  });

  describe("nodeLabel(u, label)", function() {
    abstract.describeNodeLabelSetter(ctor);
  });

  describe("removeNode(node)", function() {
    abstract.describeRemoveNode(ctor);
  });

  describe("edges()", function() {
    abstract.describeEdges(ctor);

    it("returns all edges in the graph", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.deepEqual([{from: 1, to: 2}], g.edges());
    });
  });

  describe("hasEdge(v, w)", function() {
    abstract.describeHasEdge(ctor);

    it("hasEdge(v, w) does not necessarily imply hasEdge(w, v)", function() {
      var g = ctor();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.isFalse(g.hasEdge(2, 1));
    });
  });

  describe("addEdge(v, w)", function() {
    it("adds a directed edge from v to w", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.isTrue(g.hasEdge(1, 2));
    });

    abstract.describeAddEdge(ctor);
  });

  describe("addPath(node-0, ..., node-n)", function() {
    abstract.describeAddPath(ctor);

    it("does not add the same edge twice", function() {
      var g = ctor();
      g.addNodes(1, 2, 3);
      g.addPath(1, 2, 3, 2, 3);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 3));
      assert.isTrue(g.hasEdge(3, 2));
      assert.equal(3, g.size());
    });
  });

  describe("removeEdge(v, w)", function() {
    abstract.describeRemoveEdge(ctor);
  });

  describe("sources()", function() {
    it("returns all nodes in the graph with an indegree of 0", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.equal(1, g.sources());
    });
  });

  describe("sinks()", function() {
    it("returns all nodes in the graph with an outdegree of 0", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.equal(2, g.sinks());
    });
  });

  describe("indegree(node)", function() {
    it("returns the number of in-edges to a node", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.equal(0, g.indegree(1));
      assert.equal(1, g.indegree(2));
      assert.equal(2, g.indegree(3));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.DiGraph().indegree(1); });
    });
  });

  describe("outdegree(node)", function() {
    it("returns the number of out-edges from a node", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.equal(2, g.outdegree(1));
      assert.equal(1, g.outdegree(2));
      assert.equal(0, g.outdegree(3));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.DiGraph().outdegree(1); });
    });
  });

  describe("degree(v)", function() {
    abstract.describeDegree(ctor);
  });

  describe("predecessors(node)", function() {
    it("returns the nodes that have an out-edge to a node", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual([], g.predecessors(1).sort());
      assert.deepEqual([1], g.predecessors(2).sort());
      assert.deepEqual([1, 2], g.predecessors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.DiGraph().predecessors(1); });
    });
  });

  describe("successors(node)", function() {
    it("returns the nodes that have an in-edge from a node", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual([2, 3], g.successors(1).sort());
      assert.deepEqual([3], g.successors(2).sort());
      assert.deepEqual([], g.successors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.DiGraph().successors(1); });
    });
  });

  describe("neighbors(v)", function() {
    it("returns all successors of v", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      assert.deepEqual([2, 3], g.neighbors(1).sort());
      assert.deepEqual([], g.neighbors(2).sort());
      assert.deepEqual([], g.neighbors(3).sort());
    });

    it("returns each neighbor only once", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addPath(1, 2, 1);
      assert.deepEqual([1], g.neighbors(2));
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.UGraph().neighbors(1); });
    });
  });

  describe("neighbors(v, 'both')", function() {
    it("returns all nodes adjacent to v", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      assert.deepEqual([2, 3], g.neighbors(1, 'both').sort());
      assert.deepEqual([1], g.neighbors(2, 'both').sort());
      assert.deepEqual([1], g.neighbors(3, 'both').sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.DiGraph().neighbors(1, 'both'); });
    });
  });

  describe("neighbors(v, 'out')", function() {
    it("acts the same as successors(v)", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual(g.successors(1).sort(), g.neighbors(1, 'out'));
      assert.deepEqual(g.successors(2).sort(), g.neighbors(2, 'out'));
      assert.deepEqual(g.successors(3).sort(), g.neighbors(3, 'out'));
    });
  });

  describe("neighbors(v, 'in')", function() {
    it("acts the same as predecessors(v)", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(2, 3);
      assert.deepEqual(g.predecessors(1).sort(), g.neighbors(1, 'in'));
      assert.deepEqual(g.predecessors(2).sort(), g.neighbors(2, 'in'));
      assert.deepEqual(g.predecessors(3).sort(), g.neighbors(3, 'in'));
    });
  });

  describe("neighbors(v, x)", function() {
    it("throws an error if x is not in {undefined, 'in', 'out', 'both'}", function() {
      var g = new dig.DiGraph();
      g.addNode(1);
      assert.throws(function() { g.neighbors(1, 'x'); });
    });
  });

  describe("isDirected()", function() {
    it("always returns true", function() {
      assert.isTrue(new dig.DiGraph().isDirected());
    });
  });

  describe("directed()", function() {
    it("returns a directed graph", function() {
      assert.isTrue(new dig.DiGraph().directed().isDirected());
    });
  });

  describe("undirected()", function() {
    it("returns an undirected graph", function() {
      assert.isFalse(new dig.DiGraph().undirected().isDirected());
    });

    it("creates an undirected edge for each directed edge", function() {
      var g = new dig.DiGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.isTrue(g.undirected().hasEdge(1, 2));
      assert.isTrue(g.undirected().hasEdge(2, 1));
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
    abstract.describeEquals(ctor);
  });
});
