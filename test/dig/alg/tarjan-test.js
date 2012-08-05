require("../../test-env");

var graphs = require("../../test-graphs");

// Returns the results such that the inner arrays are sorted numerically and
// the outer arrays are sorted by the first element of the inner arrays.
function sortResults(results) {
  // The nodes are coerced to strings, so coerce them back to numbers and
  // sort them.
  results = results.map(function(x) {
    return x.map(function(y) {
      return parseInt(y);
    }).sort();
  });

  results.sort(function(x, y) {
    return x[0] - y[0]; 
  });

  return results;
}

var tarjan = function(graph) {
  return sortResults(dig.alg.tarjan(graph));
};

describe("dig.alg.tarjan", function() {
  it("finds 1 component in node1", function() {
    assert.deepEqual([[1]], tarjan(graphs.node1));
  });

  it("finds 2 components in node2", function() {
    assert.deepEqual([[1], [2]], tarjan(graphs.node2));
  });

  it("finds 2 components in edge1", function() {
    assert.deepEqual([[1], [2]], tarjan(graphs.edge1));
  });

  it("finds 1 component in selfLoop", function() {
    assert.deepEqual([[1]], tarjan(graphs.selfLoop));
  });

  it("finds 1 component in cycle2", function() {
    assert.deepEqual([[1, 2]], tarjan(graphs.cycle2));
  });

  it("finds 3 component in nestedCycle2", function() {
    assert.deepEqual([[0], [1, 2], [3]], tarjan(graphs.nestedCycle2));
  });

  it("finds 1 component in cycle3", function() {
    assert.deepEqual([[1, 2, 3]], tarjan(graphs.cycle3));
  });

  it("finds 3 components in nestedCycle3", function() {
    assert.deepEqual([[0], [1, 2, 3], [4]], tarjan(graphs.nestedCycle3));
  });

  it("finds 1 component in bridgedCycle", function() {
    assert.deepEqual([[1, 2, 3]], tarjan(graphs.bridgedCycle));
  });

  it("finds 2 components in twoCycle3", function() {
    assert.deepEqual([[1, 2, 3], [4, 5, 6]], tarjan(graphs.twoCycle3));
  });

  it("finds 3 components in scc3", function() {
    assert.deepEqual([[1, 2, 5], [3, 4, 8], [6, 7]], tarjan(graphs.scc3));
  });

  it("finds 4 components in diamond", function() {
    assert.deepEqual([[1], [2], [3], [4]], tarjan(graphs.diamond));
  });
});
