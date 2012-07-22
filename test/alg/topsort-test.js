var assert = require('assert'),
    dig = require('../../index'); 

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

describe('dig.alg.topsort', function() {
  it('should return `[]` for an empty graph', function() {
    assert.deepEqual([], dig.alg.topsort(dig.graph()));
  });

  it('should order nodes according to topological sort', function() {
    var n1 = {name: "n1"};
    var n2 = {name: "n2"};
    var n3 = {name: "n3"};
    var n4 = {name: "n4"};
    var n5 = {name: "n5"};
    var n6 = {name: "n6"};

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
