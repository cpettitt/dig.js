var assert = require('assert'),
    dig = require('../index'); 

function assertBefore(before, after, arr) {
  var beforeIdx, afterIdx;
  arr.forEach(function(elem, i) {
    if (elem === before) {
      beforeIdx = i;
    } else if (elem === after) {
      afterIdx = i;
    }
  });
  assert.ok(beforeIdx < afterIdx,
            JSON.stringify(before) + " should be before " + JSON.stringify(after) + " in + " + JSON.stringify(arr));
}

describe('dig.alg', function() {
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

  describe('dfs', function() {
    var count;

    beforeEach(function() {
      count = 0;
    });

    function enter(n) {
      n.enter = count++;
    }

    function exit(n) {
      n.exit = count++;
    }

    it('should handle a single node graph', function() {
      var g = dig.graph().addNode(n1);
      dig.alg.dfs(g, [n1], enter, exit);
      assert.equal(0, n1.enter);
      assert.equal(1, n1.exit);
    });

    it('should handle a diamond shape', function() {
      var g = dig.graph()
        .addNodes([n1, n2, n3, n4])
        .addEdge(n1, n2)
        .addEdge(n1, n3)
        .addEdge(n2, n4)
        .addEdge(n3, n4);

      dig.alg.dfs(g, [n1], enter, exit);

      var steps = [n1.enter, n2.enter, n4.enter,
                   n4.exit, n2.exit, n3.enter,
                   n3.exit, n1.exit]
      steps.forEach(function(s, i) {
        assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
      });
      assert.equal(steps.length, count);
    });

    it('should handle a cycle', function() {
      var g = dig.graph()
        .addNodes([n1, n2, n3])
        .addEdge(n1, n2)
        .addEdge(n2, n3)
        .addEdge(n3, n1);

      dig.alg.dfs(g, [n1], enter, exit);

      var steps = [n1.enter, n2.enter, n3.enter,
                   n3.exit, n2.exit, n1.exit];

      steps.forEach(function(s, i) {
        assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
      });
      assert.equal(steps.length, count);
    });

    it('should handle multiple nodes in the same subgraph', function() {
        var g = dig.graph()
          .addNodes([n1, n2, n3, n4])
          .addEdge(n1, n2)
          .addEdge(n1, n3)
          .addEdge(n2, n4)
          .addEdge(n3, n4);

        dig.alg.dfs(g, [n1, n2, n3, n4], enter, exit);

        var steps = [n1.enter, n2.enter, n4.enter,
                     n4.exit, n2.exit, n3.enter,
                     n3.exit, n1.exit]
        steps.forEach(function(s, i) {
          assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
        });
        assert.equal(steps.length, count);
    });

    it('should handle multiple nodes in different subgraph', function() {
        var g = dig.graph()
          .addNodes([n1, n2, n3, n4])
          .addEdge(n1, n2)
          .addEdge(n3, n4);

        dig.alg.dfs(g, [n1, n2, n3, n4], enter, exit);

        var steps = [n1.enter, n2.enter, n2.exit, n1.exit,
                     n3.enter, n4.enter, n4.exit, n3.exit]
        steps.forEach(function(s, i) {
          assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
        });
        assert.equal(steps.length, count);
    });
  });

  describe('topsort', function() {
    it('should return `[]` for an empty graph', function() {
      assert.deepEqual([], dig.alg.topsort(dig.graph()));
    });

    it('should order nodes according to topological sort', function() {
      var g = dig.graph()
        .addNodes([n1, n2, n3, n4, n5, n6])
        .addEdge(n1, n2)
        .addEdge(n2, n4)
        .addEdge(n3, n4)
        .addEdge(n4, n5);

      var sorted = dig.alg.topsort(g);

      assertBefore(n1, n2, sorted);
      assertBefore(n2, n4, sorted);
      assertBefore(n3, n4, sorted);
      assertBefore(n3, n4, sorted);
      assertBefore(n4, n5, sorted);
      assert.ok(sorted.some(function(n) { return n === n6; }));
    });

    it('should raise an error for a graph with a cycle', function() {
      var n1 = {name: "n1"};
      var n2 = {name: "n2"};
      var g = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2)
        .addEdge(n2, n1);
        
      assert.throws(function() {
        dig.alg.topsort(g);
      });
    });
  });

  describe('shortestPaths', function() {
    it('should handle empty graphs', function() {
      assert.equal(0, dig.alg.shortestPaths(dig.graph()).nodes().length);
    });

    it('should handle a single node', function() {
      var paths = dig.alg.shortestPaths(dig.graph().addNode(n1));
      assert.deepEqual([n1], paths.nodes());
      assert.equal(0, paths.getEdge(n1, n1));
    });

    it('should handle two unconnected nodes', function() {
      var graph = dig.graph().addNodes([n1, n2]);
      var paths = dig.alg.shortestPaths(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes connected by an edge', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2);
      var paths = dig.alg.shortestPaths(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(1, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes connected by an edge labeled with a number', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, 5);
      var paths = dig.alg.shortestPaths(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(5, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle two nodes with a cycle', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, 5)
        .addEdge(n2, n1, 3);
      var paths = dig.alg.shortestPaths(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(5, paths.getEdge(n1, n2));
      assert.equal(3, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle edges with a negative label', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, -5);
      var paths = dig.alg.shortestPaths(graph);
      assert.equal(0, paths.getEdge(n1, n1));
      assert.equal(-5, paths.getEdge(n1, n2));
      assert.equal(Number.POSITIVE_INFINITY, paths.getEdge(n2, n1));
      assert.equal(0, paths.getEdge(n2, n2));
    });

    it('should handle edges with a negative cycle', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, -5)
        .addEdge(n2, n1, -3);
      var paths = dig.alg.shortestPaths(graph);
      assert.ok(paths.getEdge(n1, n1) < 0);
      assert.ok(paths.getEdge(n1, n2) < 0);
      assert.ok(paths.getEdge(n2, n1) < 0);
      assert.ok(paths.getEdge(n2, n2) < 0);
    });

    it('should handle more complicated graphs', function() {
      var graph = dig.graph()
        .addNodes([n1, n2, n3, n4, n5, n6])
        .addEdge(n1, n2, 1)
        .addEdge(n1, n3, 1)
        .addEdge(n2, n4, 1)
        .addEdge(n3, n4, 1)
        .addEdge(n4, n1, 1);
      var paths = dig.alg.shortestPaths(graph);
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

    it('should fail for graphs with non-numeric edges', function() {
      var graph = dig.graph()
        .addNodes([n1, n2])
        .addEdge(n1, n2, "non-numeric edge");
      assert.throws(function() { dig.alg.shortestPaths(graph); });
    });
  });
});
