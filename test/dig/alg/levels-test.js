require("../../test-env");

var graphs = require("../../test-graphs");

describe("dig.alg.levels(graph, roots)", function() {
  it("returns levels for nodes in a directed graph", function() {
    var levels = dig.alg.levels(graphs.directed.diamond, 1);
    assert.equal(0, levels[1]);
    assert.equal(1, levels[2]);
    assert.equal(1, levels[3]);
    assert.equal(2, levels[4]);
  });

  it("returns levels for nodes in a directed graph", function() {
    var levels = dig.alg.levels(graphs.undirected.diamond, 1);
    assert.equal(0, levels[1]);
    assert.equal(1, levels[2]);
    assert.equal(1, levels[3]);
    assert.equal(2, levels[4]);
  });

  it("does not return levels for unreachable nodes", function() {
    var levels = dig.alg.levels(graphs.directed.diamond, 2);
    assert.isUndefined(levels[1]);
    assert.equal(0, levels[2]);
    assert.isUndefined(levels[3]);
    assert.equal(1, levels[4]);
  });

  it("returns levels for nodes from multiple roots", function() {
    var levels = dig.alg.levels(graphs.directed.scc3, [1, 6, 3]);
    assert.equal(0, levels[1]);
    assert.equal(1, levels[2]);
    assert.equal(0, levels[3]);
    assert.equal(1, levels[4]);
    assert.equal(2, levels[5]);
    assert.equal(0, levels[6]);
    assert.equal(1, levels[7]);
    assert.equal(2, levels[8]);
  });
});
