require("../../test-env");

var graphs = require("../../test-graphs");

describe("dig.alg.topsort", function() {
  it("should handle singleton graph", function() {
    assert.deepEqual([1], dig.alg.topsort(graphs.singleton));
  });

  it("should handle two node disjoint graph", function() {
    var results = dig.alg.topsort(graphs.twoNodeDisjoint);
    assert.deepEqual([1, 2], results.sort());
  });

  it("should handle single edge graph", function() {
    assert.deepEqual([1, 2], dig.alg.topsort(graphs.singleEdge));
  });

  it("should handle two edge graph", function() {
    assert.deepEqual([1, 2, 3], dig.alg.topsort(graphs.twoEdge));
  });

  it("should throw an error for self loop graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.selfLoop); });
  });

  it("should throw an error for short cycle graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.shortCycle); });
  });

  it("should handle diamond graph", function() {
    var results = dig.alg.topsort(graphs.diamond);
    assert.equal(4, results.length);
    assert.equal(1, results[0]);
    assert.equal(4, results[3]);
    assert.isTrue((results[1] == 2 && results[2] == 3) ||
                  (results[1] == 3 && results[2] == 2));
  });

  it("should throw an error for nested cycle graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.nestedCycle); });
  });
});
