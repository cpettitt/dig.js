var assert = require('assert'),
    dig = require('../../index'); 

describe('dig.alg.sp', function() {
  var n1, n2, n3, n4, n5, n6;

  beforeEach(function() {
    // TODO there has to be a better way to do this
    n1 = {name: "n1"};
    n2 = {name: "n2"};
    n3 = {name: "n3"};
    n4 = {name: "n4"};
    n5 = {name: "n5"};
    n6 = {name: "n6"};
  });

  describe('floydWarshall', function() {
    it('should handle empty graphs', function() {
      assert.equal(0, dig.alg.sp.floydWarshall(dig.graph()).nodes().length);
    });

    it('should handle a single node', function() {
      var paths = dig.alg.sp.floydWarshall(dig.graph().addNode(n1));
      assert.deepEqual([n1], paths.nodes());
      assert.equal(0, paths.getEdge(n1, n1));
    });

    it('should handle two unconnected nodes', function() {
      var graph = dig.graph().addNodes([n1, n2]);
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes connected by an edge', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2);
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(1, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes with a cycle', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2)
        .addEdge(n2, n1);
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(1, paths.getEdge(n1, n2));
      assert.equal(1, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes using labelEdgeCost', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, 5);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(5, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes with a cycle using labelEdgeCost', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, 5)
        .addEdge(n2, n1, 3);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(5, paths.getEdge(n1, n2));
      assert.equal(3, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle edges with a negative cost', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, -5);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(-5, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle a graph with a negative cycle', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, -5)
        .addEdge(n2, n1, -3);
      var paths = dig.alg.sp.floydWarshall(graph, dig.alg.labelEdgeCost(graph));
      assert.ok(paths.getEdge(n1, n1) < 0);
      assert.ok(paths.getEdge(n1, n2) < 0);
      assert.ok(paths.getEdge(n2, n1) < 0);
      assert.ok(paths.getEdge(n2, n2) < 0);
    });

    it('should handle more complicated graphs', function() {
      var graph = dig.graph()
        .addNodes([n1, n2, n3, n4, n5, n6])
        .addEdge(n1, n2)
        .addEdge(n1, n3)
        .addEdge(n2, n4)
        .addEdge(n3, n4)
        .addEdge(n4, n1);
      var paths = dig.alg.sp.floydWarshall(graph);
      assert.deepEqual(1, paths.getEdge(n1, n2));
      assert.deepEqual(1, paths.getEdge(n1, n3));
      assert.deepEqual(2, paths.getEdge(n1, n4));
      assert.deepEqual(1, paths.getEdge(n2, n4));
      assert.deepEqual(2, paths.getEdge(n2, n1));
      assert.deepEqual(3, paths.getEdge(n2, n3));
      assert.deepEqual(1, paths.getEdge(n3, n4));
      assert.deepEqual(2, paths.getEdge(n3, n1));
      assert.deepEqual(3, paths.getEdge(n3, n2));
    });
  });
});
