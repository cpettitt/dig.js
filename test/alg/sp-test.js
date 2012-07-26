var assert = require('assert'),
    dig = require('../../index'); 

describe('dig.alg.sp', function() {
  var n;

  beforeEach(function() {
    n = [];
    for (var i = 0; i < 6; ++i) {
      n[i] = {name: 'n' + i};
    }
  });

  describe('floydWarshall', function() {
    it('should handle empty graphs', function() {
      assert.equal(0, dig.alg.sp.floydWarshall(dig.graph()).nodes().length);
    });

    it('should handle a single node', function() {
      var paths = dig.alg.sp.floydWarshall(dig.graph().addNode(n[0]));
      assert.deepEqual([n[0]], paths.nodes());
      assert.equal(0, paths.getEdge(n[0], n[0]));
    });

    it('should handle two unconnected nodes', function() {
      var graph = dig.graph().addNodes([n[0], n[1]]);
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.equal(0, paths.getEdge(n[0], n[0]));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[0], n[1]));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n[1], n[0]));
      assert.equal(0, paths.getEdge(n[1], n[1]));
    });

    it('should handle two nodes connected by an edge', function() {
      var graph = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1]);
      var paths = dig.alg.sp.floydWarshall(graph);
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
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.equal(0, paths.getEdge(n[0], n[0]));
      assert.equal(1, paths.getEdge(n[0], n[1]));
      assert.equal(1, paths.getEdge(n[1], n[0]));
      assert.equal(0, paths.getEdge(n[1], n[1]));
    });

    it('should handle two nodes using labelEdgeCost', function() {
      var graph = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1], 5);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
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
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
      assert.equal(0, paths.getEdge(n[0], n[0]));
      assert.equal(5, paths.getEdge(n[0], n[1]));
      assert.equal(3, paths.getEdge(n[1], n[0]));
      assert.equal(0, paths.getEdge(n[1], n[1]));
    });

    it('should handle edges with a negative cost', function() {
      var graph = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1], -5);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
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
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
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
      var paths = dig.alg.sp.floydWarshall(graph);
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
  });
});
