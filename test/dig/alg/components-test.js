require("../../test-env.js");

describe("dig.alg.components", function() {
  it("returns `[]` for an empty graph", function() {
    assert.deepEqual([], dig.alg.components(new dig.UGraph()));
  });

  it("returns `[[a], [b]]` when `a` and `b` are not connected by a path", function() {
    var graph = new dig.UGraph();
    graph.addNodes("a", "b");
    assert.deepEqual([["a"], ["b"]], dig.alg.components(graph));
  });

  it("returns `[[a, b]]` when `a` and `b` are connected", function() {
    var graph = new dig.UGraph();
    graph.addNodes("a", "b");
    graph.addPath("a", "b", "a");
    assert.deepEqual([["a", "b"]], dig.alg.components(graph));
  });

  it("treats the input graph as undirected", function() {
    var graph = new dig.UGraph();
    graph.addNodes("a", "b");
    graph.addPath("a", "b");
    assert.deepEqual([["a", "b"]], dig.alg.components(graph));
  });

  it("returns `[[a, b, c]]` for a graph `a -> b -> c`", function() {
    var graph = new dig.UGraph();
    graph.addNodes("a", "b", "c");
    graph.addPath("a", "b", "c");
    assert.deepEqual([["a", "b", "c"]], dig.alg.components(graph));
  });

  it("throws an error for directed graphs", function() {
    assert.throws(function() { dig.alg.components(new dig.DiGraph()); });
  });
});
