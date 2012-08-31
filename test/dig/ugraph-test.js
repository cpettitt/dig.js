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

  describe("addNode(node, [attrs])", function() {
    abstract.describeAddNode(ctor);
  });

  describe("addNodes(node-0, ..., node-n)", function() {
    abstract.describeAddNodes(ctor);
  });

  describe("node(u)", function() {
    abstract.describeNode(ctor);
  });

  describe("removeNode(node)", function() {
    abstract.describeRemoveNode(ctor);
  });

  describe("edges()", function() {
    abstract.describeEdges(ctor);

    it("returns all edges in the graph", function() {
      var g = ctor();
      g.addNodes(1, 2);
      g.addEdge(1, 2, {x: 123});

      var es = g.edges();
      assert.equal(1, es.length);
      var ns = [es[0].from, es[0].to];
      assert.deepEqual([1, 2], ns.sort());
      assert.deepEqual({x: 123}, es[0].attrs);
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

  describe("addEdge(u, v, [attrs])", function() {
    it("adds an undirected edge between u and v", function() {
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

  describe("edge(u, v)", function() {
    abstract.describeEdge(ctor);

    it("allows access to an edge label from either direction", function() {
      var g = new dig.UGraph();
      g.addNodes(1, 2);
      g.addEdge(1, 2);
      g.edge(1, 2).a = 123;
      assert.equal(123, g.edge(2, 1).a);
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

  describe("isAcyclic()", function() {
    it("returns true for node1", function() {
      assert.isTrue(graphs.undirected.node1.isAcyclic());
    });

    it("returns true for node2", function() {
      assert.isTrue(graphs.undirected.node2.isAcyclic());
    });

    it("returns true for edge1", function() {
      assert.isTrue(graphs.undirected.edge1.isAcyclic());
    });

    it("returns true for edge2", function() {
      assert.isTrue(graphs.undirected.edge2.isAcyclic());
    });

    it("returns false for selfLoop", function() {
      assert.isFalse(graphs.undirected.selfLoop.isAcyclic());
    });

    it("returns false for diamond", function() {
      assert.isFalse(graphs.undirected.diamond.isAcyclic());
    });
  });

  describe("isConnected()", function() {
    it("returns false for an empty graph", function() {
      assert.isFalse(new dig.UGraph().isConnected());
    });

    it("returns true for node1", function() {
      assert.isTrue(graphs.undirected.node1.isConnected());
    });

    it("returns false for node2", function() {
      assert.isFalse(graphs.undirected.node2.isConnected());
    });

    it("returns true for edge1", function() {
      assert.isTrue(graphs.undirected.edge1.isConnected());
    });

    it("returns true for diamond", function() {
      assert.isTrue(graphs.undirected.diamond.isConnected());
    });
  });
});
