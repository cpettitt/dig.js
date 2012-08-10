require("../../test-env");

var graphs = require("../../test-graphs");

// Helper function for checking results. Checks that result[i] matches the
// supplied `distance` and `predecessor`.
//
// If `predecessor` is not supplied its value is assumed to be null (indicating
// no predecessor). If `predecessor` is a list then the actual predecessor must
// match one of the elements in the list.
//
// If `distance` is not supplied its value is assumed to be
// `Number.POSITIVE_INFINITY` indicating there is no path from `i` to `j`.
function expect(result, i, distance, predecessor) {
  if (arguments.length < 4) {
    predecessor = null;
    if (arguments.length < 3) {
      distance = Number.POSITIVE_INFINITY;
    }
  }
  var entry = result[i];
  assert.equal(distance, entry.distance);
  if (predecessor && predecessor.length) {
    assert.memberOf(predecessor, parseInt(entry.predecessor));
  } else {
    assert.equal(predecessor, entry.predecessor);
  }
}

// Helper that expects that `n` number of result entries are on the given
// `result` object.
function expectCount(result, n) {
  var count = 0;
  for (var k in result) {
    count++; 
  }
  assert.equal(n, count);
}

describe("dig.alg.dijkstra", function() {
  it("handles node1 graph", function() {
    var results = dig.alg.dijkstra(graphs.node1, 1);
    expect(results, 1, 0);
    expectCount(results, 1);
  });

  it("handles node2 graph", function() {
    var results = dig.alg.dijkstra(graphs.node2, 1);
    expect(results, 1, 0);
    expect(results, 2);
    expectCount(results, 2);
  });

  it("handles edge1 graph", function() {
    var results = dig.alg.dijkstra(graphs.edge1, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expectCount(results, 2);
  });

  it("handles edge2 graph", function() {
    var results = dig.alg.dijkstra(graphs.edge2, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expect(results, 3, 2, 2);
    expectCount(results, 3);
  });

  it("handles selfLoop graph", function() {
    var results = dig.alg.dijkstra(graphs.selfLoop, 1);
    expect(results, 1, 0);
    expectCount(results, 1);
  });

  it("handles cycle2 graph", function() {
    var results = dig.alg.dijkstra(graphs.cycle2, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expectCount(results, 2);
  });

  it("handles diamond graph", function() {
    var results = dig.alg.dijkstra(graphs.diamond, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expect(results, 3, 1, 1);
    expect(results, 4, 2, [2, 3]);
    expectCount(results, 4);
  });

  it("handles nestedCycle2 graph", function() {
    var results = dig.alg.dijkstra(graphs.nestedCycle2, 0);
    expect(results, 0, 0);
    expect(results, 1, 1, 0);
    expect(results, 2, 2, 1);
    expect(results, 3, 3, 2);
    expectCount(results, 4);
  });
});