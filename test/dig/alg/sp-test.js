require('../../test-env');

describe('dig.alg.sp', function() {
  var n;

  beforeEach(function() {
    n = [];
    for (var i = 0; i < 6; ++i) {
      n[i] = {name: 'n' + i};
    }
  });

  function singleSource(alg) { 
    it('should handle a graph with a single node', function() {
      var g = dig.graph().addNode(n[0]);
      var sp = alg(g, n[0]);
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
    });

    it('should handle two unconnected nodes', function() {
      var g = dig.graph().addNodes([n[0], n[1]]);
      var sp = alg(g, n[0]);
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: Number.POSITIVE_INFINITY, predecessor: null}, sp.getEdge(n[0], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
    });

    it('should handle two nodes connected by an edge', function() {
      var g = dig.graph().addNodes([n[0], n[1]]).addEdge(n[0], n[1]);
      var sp = alg(g, n[0]);
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: 1, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
    });

    it('should handle two nodes in a cycle', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1])
        .addEdge(n[1], n[0]);
      var sp = alg(g, n[0]);
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: 1, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
    });

    it("should handle three nodes connected successively", function() {
      var g = dig.graph()
        .addNodes([n[0], n[1], n[2]])
        .addEdge(n[0], n[1])
        .addEdge(n[1], n[2]);
      var sp = alg(g, n[0]);
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: 1, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.deepEqual({cost: 2, predecessor: n[1]}, sp.getEdge(n[0], n[2]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[2]));
      assert.equal(false, sp.containsEdge(n[2], n[0]));
      assert.equal(false, sp.containsEdge(n[2], n[1]));
      assert.equal(false, sp.containsEdge(n[2], n[2]));
    });

    it('should handle two nodes using labelEdgeCost', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1], 5);
      var sp = alg(g, n[0], dig.alg.labelEdgeCost(g));
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: 5, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
    });

    it('should handle two nodes with a cycle using labelEdgeCost', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1], 5)
        .addEdge(n[1], n[0], 3);
      var sp = alg(g, n[0], dig.alg.labelEdgeCost(g));
      assert.deepEqual({cost: 0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost: 5, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.equal(false, sp.containsEdge(n[1], n[0]));
      assert.equal(false, sp.containsEdge(n[1], n[1]));
    });

    it('should handle more complicated paths', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1], n[2], n[3]])
        .addEdge(n[0], n[1],  1)
        .addEdge(n[0], n[2], 25)
        .addEdge(n[1], n[2],  5)
        .addEdge(n[1], n[3], 50)
        .addEdge(n[2], n[3], 15);
      var sp = alg(g, n[0], dig.alg.labelEdgeCost(g));
      assert.deepEqual({cost:  0, predecessor: null}, sp.getEdge(n[0], n[0]));
      assert.deepEqual({cost:  1, predecessor: n[0]}, sp.getEdge(n[0], n[1]));
      assert.deepEqual({cost:  6, predecessor: n[1]}, sp.getEdge(n[0], n[2]));
      assert.deepEqual({cost: 21, predecessor: n[2]}, sp.getEdge(n[0], n[3]));
    });
  }

  function allPairs(alg) {
    return function() {
      it('should handle empty graphs', function() {
        assert.equal(0, alg(dig.graph()).nodes().length);
      });

      it('should handle a single node', function() {
        var paths = alg(dig.graph().addNode(n[0]));
        assert.deepEqual([n[0]], paths.nodes());
        assert.equal(0, paths.getEdge(n[0], n[0]));
      });

      it('should handle two unconnected nodes', function() {
        var graph = dig.graph().addNodes([n[0], n[1]]);
        var paths = alg(graph);
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[0], n[1]));
        assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle two nodes connected by an edge', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1]);
        var paths = alg(graph);
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(1, paths.getEdge(n[0], n[1]));
        assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle two nodes with a cycle', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1])
          .addEdge(n[1], n[0]);
        var paths = alg(graph);
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(1, paths.getEdge(n[0], n[1]));
        assert.equal(1, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle two nodes using labelEdgeCost', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1], 5);
        var paths = alg(graph, dig.alg.labelEdgeCost(graph));
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(5, paths.getEdge(n[0], n[1]));
        assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle two nodes with a cycle using labelEdgeCost', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1], 5)
          .addEdge(n[1], n[0], 3);
        var paths = alg(graph, dig.alg.labelEdgeCost(graph));
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(5, paths.getEdge(n[0], n[1]));
        assert.equal(3, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle edges with a negative cost', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1], -5);
        var paths = alg(graph, dig.alg.labelEdgeCost(graph));
        assert.equal(0, paths.getEdge(n[0], n[0]));
        assert.equal(-5, paths.getEdge(n[0], n[1]));
        assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[1], n[0]));
        assert.equal(0, paths.getEdge(n[1], n[1]));
      });

      it('should handle a graph with a negative cycle', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1]])
          .addEdge(n[0], n[1], -5)
          .addEdge(n[1], n[0], -3);
        var paths = alg(graph, dig.alg.labelEdgeCost(graph));
        assert.ok(paths.getEdge(n[0], n[0]) < 0);
        assert.ok(paths.getEdge(n[0], n[1]) < 0);
        assert.ok(paths.getEdge(n[1], n[0]) < 0);
        assert.ok(paths.getEdge(n[1], n[1]) < 0);
      });

      it('should handle more complicated graphs', function() {
        var graph = dig.graph()
          .addNodes([n[0], n[1], n[2], n[3], n[4], n[5]])
          .addEdge(n[0], n[1])
          .addEdge(n[0], n[2])
          .addEdge(n[1], n[3])
          .addEdge(n[2], n[3])
          .addEdge(n[3], n[0]);
        var paths = alg(graph);
        assert.deepEqual(1, paths.getEdge(n[0], n[1]));
        assert.deepEqual(1, paths.getEdge(n[0], n[2]));
        assert.deepEqual(2, paths.getEdge(n[0], n[3]));
        assert.deepEqual(1, paths.getEdge(n[1], n[3]));
        assert.deepEqual(2, paths.getEdge(n[1], n[0]));
        assert.deepEqual(3, paths.getEdge(n[1], n[2]));
        assert.deepEqual(1, paths.getEdge(n[2], n[3]));
        assert.deepEqual(2, paths.getEdge(n[2], n[0]));
        assert.deepEqual(3, paths.getEdge(n[2], n[1]));
      });
    };
  }

  describe('dijkstra', function() {
    singleSource(dig.alg.sp.dijkstra)
    it('should throw an error if it encounters a negative edge cost', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1], 5)
        .addEdge(n[1], n[0], -3);
      assert.throws(function() {
        dig.alg.sp.dijkstra(g, n[0], dig.alg.labelEdgeCost(g));
      });
    });
  });

  describe('floydWarshall', allPairs(dig.alg.sp.floydWarshall));
});
