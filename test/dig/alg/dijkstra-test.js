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

function commonGraphs(undirected) {
  it("yields {1: 0} for dijkstra(node1, 1)", function() {
    var g = graphs.node1;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expectCount(results, 1);
  });

  it("yields {1: 0, 2: INFINITE} for dijkstra(node2, 1)", function() {
    var g = graphs.node2;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expect(results, 2);
    expectCount(results, 2);
  });

  it("yields {1: 0, 2: 1} for dijkstra(edge1, 1)", function() {
    var g = graphs.edge1;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expectCount(results, 2);
  });

  it("yields {1: 0} for dijkstra(selfLoop, 1)", function() {
    var g = graphs.selfLoop;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expectCount(results, 1);
  });

  it("yields {1: 0, 2: 1} for dijkstra(cycle2, 1)", function() {
    var g = graphs.cycle2;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expectCount(results, 2);
  });

  it("yields {1: 0, 2: 1, 3: 1, 4: 2} for dijkstra(diamond, 1)", function() {
    var g = graphs.diamond;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 1);
    expect(results, 1, 0);
    expect(results, 2, 1, 1);
    expect(results, 3, 1, 1);
    expect(results, 4, 2, [2, 3]);
    expectCount(results, 4);
  });

  it("yields {0: 0, 1: 1, 2: 2, 3: 3} for dijkstra(nestedCycle2, 0)", function() {
    var g = graphs.nestedCycle2;
    if (undirected) { g = g.undirected(); }
    var results = dig.alg.dijkstra(g, 0);
    expect(results, 0, 0);
    expect(results, 1, 1, 0);
    expect(results, 2, 2, 1);
    expect(results, 3, 3, 2);
    expectCount(results, 4);
  });
}

describe("dig.alg.dijkstra", function() {
  describe("directed graphs", function() {
    commonGraphs("directed");
  });

  describe("undirected graphs", function() {
    commonGraphs("undirected");

    it("yields {1: 1, 2: 0, 3: 2, 4: 1} for dijkstra(diamond, 2)", function() {
      var results = dig.alg.dijkstra(graphs.diamond.undirected(), 2);
      expect(results, 1, 1, 2);
      expect(results, 2, 0);
      expect(results, 3, 2, [1, 4]);
      expect(results, 4, 1, 2);
      expectCount(results, 4);
    });
  });
});
