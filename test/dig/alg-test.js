require('../test-env');

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
  var n;

  beforeEach(function() {
    n = [];
    for (var i = 0; i < 6; ++i) {
      n[i] = {name: 'n' + i};
    }
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
      var g = dig.graph().addNode(n[0]);
      dig.alg.dfs(g, [n[0]], enter, exit);
      assert.equal(0, n[0].enter);
      assert.equal(1, n[0].exit);
    });

    it('should handle a diamond shape', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1], n[2], n[3]])
        .addEdge(n[0], n[1])
        .addEdge(n[0], n[2])
        .addEdge(n[1], n[3])
        .addEdge(n[2], n[3]);

      dig.alg.dfs(g, [n[0]], enter, exit);

      var steps = [n[0].enter, n[1].enter, n[3].enter,
                   n[3].exit, n[1].exit, n[2].enter,
                   n[2].exit, n[0].exit]
      steps.forEach(function(s, i) {
        assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
      });
      assert.equal(steps.length, count);
    });

    it('should handle a cycle', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1], n[2]])
        .addEdge(n[0], n[1])
        .addEdge(n[1], n[2])
        .addEdge(n[2], n[0]);

      dig.alg.dfs(g, [n[0]], enter, exit);

      var steps = [n[0].enter, n[1].enter, n[2].enter,
                   n[2].exit, n[1].exit, n[0].exit];

      steps.forEach(function(s, i) {
        assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
      });
      assert.equal(steps.length, count);
    });

    it('should handle multiple nodes in the same subgraph', function() {
        var g = dig.graph()
          .addNodes([n[0], n[1], n[2], n[3]])
          .addEdge(n[0], n[1])
          .addEdge(n[0], n[2])
          .addEdge(n[1], n[3])
          .addEdge(n[2], n[3]);

        dig.alg.dfs(g, [n[0], n[1], n[2], n[3]], enter, exit);

        var steps = [n[0].enter, n[1].enter, n[3].enter,
                     n[3].exit, n[1].exit, n[2].enter,
                     n[2].exit, n[0].exit]
        steps.forEach(function(s, i) {
          assert.equal(i, s, "Actual steps: " + JSON.stringify(steps));
        });
        assert.equal(steps.length, count);
    });

    it('should handle multiple nodes in different subgraph', function() {
        var g = dig.graph()
          .addNodes([n[0], n[1], n[2], n[3]])
          .addEdge(n[0], n[1])
          .addEdge(n[2], n[3]);

        dig.alg.dfs(g, [n[0], n[1], n[2], n[3]], enter, exit);

        var steps = [n[0].enter, n[1].enter, n[1].exit, n[0].exit,
                     n[2].enter, n[3].enter, n[3].exit, n[2].exit]
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
        .addNodes([n[0], n[1], n[2], n[3], n[4], n[5]])
        .addEdge(n[0], n[1])
        .addEdge(n[1], n[3])
        .addEdge(n[2], n[3])
        .addEdge(n[3], n[4]);

      var sorted = dig.alg.topsort(g);

      assertBefore(n[0], n[1], sorted);
      assertBefore(n[1], n[3], sorted);
      assertBefore(n[2], n[3], sorted);
      assertBefore(n[2], n[3], sorted);
      assertBefore(n[3], n[4], sorted);
      assert.ok(sorted.some(function(x) { return x === n[5]; }));
    });

    it('should raise an error for a graph with a cycle', function() {
      var g = dig.graph()
        .addNodes([n[0], n[1]])
        .addEdge(n[0], n[1])
        .addEdge(n[1], n[0]);
        
      assert.throws(function() {
        dig.alg.topsort(g);
      });
    });
  });
});
