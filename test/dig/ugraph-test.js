require("../test-env");

var graphs = require("../test-graphs");
var abstract = require("./abstract-graph-test");

describe("dig.UGraph", function() {
  var ctor = function() { return new dig.UGraph(); };

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

  describe("equals(graph)", function() {
    abstract.describeEquals(ctor);
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
      var g = ctor();
      g.addNodes(1, 2);
      g.addEdge(1, 2);

      var es = g.edges();
      assert.equal(1, es.length);
      var ns = [es[0].from, es[0].to];
      assert.deepEqual([1, 2].sort(), ns.sort());
    });
  });

  describe("hasEdge(v, w)", function() {
    abstract.describeHasEdge(ctor);

    it("hasEdge(v, w) implies hasEdge(w, v)", function() {
      var g = ctor();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isTrue(g.hasEdge(2, 1));
    });
  });

  describe("addEdge(v, w)", function() {
    it("adds an undirected edge from one v to w", function() {
      var g = new dig.UGraph();
      g.addNode(1);
      g.addNode(2);
      g.addEdge(1, 2);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 1));
    });

    abstract.describeAddEdge(ctor);
  });

  describe("addPath(node-0, ..., node-n)", function() {
    abstract.describeAddPath(ctor);

    it("does not add the same edge twice", function() {
      var g = new dig.UGraph();
      g.addNodes(1, 2, 3);
      g.addPath(1, 2, 3, 2, 3);
      assert.isTrue(g.hasEdge(1, 2));
      assert.isTrue(g.hasEdge(2, 3));
      assert.equal(2, g.size());
    });
  });

  describe("removeEdge(v, w)", function() {
    abstract.describeRemoveEdge(ctor);

    it("removes the edge (v, w) using (w, v) as input arguments", function() {
      var g = ctor();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.isTrue(g.removeEdge(2, 1));
      assert.isFalse(g.hasEdge(1, 2));
    });
  });

  describe("degree(v)", function() {
    abstract.describeDegree(ctor);
  });

  describe("neighbors(v)", function() {
    it("returns all nodes adjacent to v", function() {
      var g = new dig.UGraph();
      g.addNodes(1, 2, 3);
      g.addEdge(1, 2);
      g.addEdge(1, 3);
      assert.deepEqual([2, 3], g.neighbors(1).sort());
      assert.deepEqual([1], g.neighbors(2).sort());
      assert.deepEqual([1], g.neighbors(3).sort());
    });

    it("throws an error when the node is not in the graph", function() {
      assert.throws(function() { new dig.UGraph().neighbors(1); });
    });
  });

  describe("isDirected()", function() {
    it("always returns false", function() {
      assert.isFalse(new dig.UGraph().isDirected());
    });
  });

  describe("directed()", function() {
    it("returns a directed graph", function() {
      assert.isTrue(new dig.UGraph().directed().isDirected());
    });

    it("creates two edges for each undirected edge", function() {
      var g = new dig.UGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      assert.isTrue(g.directed().hasEdge(1, 2));
      assert.isTrue(g.directed().hasEdge(2, 1));
    });
  });

  describe("undirected()", function() {
    it("returns an undirected graph", function() {
      assert.isFalse(new dig.UGraph().undirected().isDirected());
    });
  });

  describe("isAcyclic()", function() {
    it("returns true for node1", function() {
      assert.isTrue(graphs.node1.undirected().isAcyclic());
    });

    it("returns true for node2", function() {
      assert.isTrue(graphs.node2.undirected().isAcyclic());
    });

    it("returns true for edge1", function() {
      assert.isTrue(graphs.edge1.undirected().isAcyclic());
    });

    it("returns true for edge2", function() {
      assert.isTrue(graphs.edge2.undirected().isAcyclic());
    });

    it("returns false for selfLoop", function() {
      assert.isFalse(graphs.selfLoop.undirected().isAcyclic());
    });

    it("returns false for cycle2", function() {
      // In an acyclic graph this is the same as edge1
      assert.isTrue(graphs.cycle2.undirected().isAcyclic());
    });

    it("returns false for nestedCycle2", function() {
      // In an acyclic graph this is the same as edge2
      assert.isTrue(graphs.nestedCycle2.undirected().isAcyclic());
    });

    it("returns false for cycle3", function() {
      assert.isFalse(graphs.cycle3.undirected().isAcyclic());
    });

    it("returns false for nestedCycle3", function() {
      assert.isFalse(graphs.nestedCycle3.undirected().isAcyclic());
    });

    it("returns false for bridgedCycle", function() {
      // In an acyclic graph this is the same as edge2
      assert.isTrue(graphs.bridgedCycle.undirected().isAcyclic());
    });

    it("returns false for twoCycle3", function() {
      assert.isFalse(graphs.twoCycle3.undirected().isAcyclic());
    });

    it("returns false for scc3", function() {
      assert.isFalse(graphs.scc3.undirected().isAcyclic());
    });

    it("returns false for diamond", function() {
      assert.isFalse(graphs.diamond.undirected().isAcyclic());
    });
  });

  describe("isConnected()", function() {
    it("returns false for an empty graph", function() {
      assert.isFalse(new dig.UGraph().isConnected());
    });

    it("returns true for node1", function() {
      assert.isTrue(graphs.node1.undirected().isConnected());
    });

    it("returns false for node2", function() {
      assert.isFalse(graphs.node2.undirected().isConnected());
    });

    it("treats the graph as undirected", function() {
      assert.isTrue(graphs.edge1.undirected().isConnected());
    });

    it("returns true for scc3", function() {
      assert.isTrue(graphs.scc3.undirected().isConnected());
    });
  });
});
