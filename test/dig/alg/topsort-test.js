require("../../test-env");

var graphs = require("../../test-graphs");

describe("dig.alg.topsort", function() {
  it("should handle node1 graph", function() {
    assert.deepEqual([1], dig.alg.topsort(graphs.node1));
  });

  it("should handle node2 graph", function() {
    var results = dig.alg.topsort(graphs.node2);
    assert.deepEqual([1, 2], results.sort());
  });

  it("should handle edge1 graph", function() {
    assert.deepEqual([1, 2], dig.alg.topsort(graphs.edge1));
  });

  it("should handle edge2 graph", function() {
    assert.deepEqual([1, 2, 3], dig.alg.topsort(graphs.edge2));
  });

  it("should throw an error for selfLoop graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.selfLoop); });
  });

  it("should throw an error for cycle2 graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.cycle2); });
  });

  it("should handle diamond graph", function() {
    var results = dig.alg.topsort(graphs.diamond);
    assert.equal(4, results.length);
    assert.equal(1, results[0]);
    assert.equal(4, results[3]);
    assert.isTrue((results[1] == 2 && results[2] == 3) ||
                  (results[1] == 3 && results[2] == 2));
  });

  it("should throw an error for nestedCycle2 graph", function() {
    assert.throws(function() { dig.alg.topsort(graphs.nestedCycle2); });
  });
});
