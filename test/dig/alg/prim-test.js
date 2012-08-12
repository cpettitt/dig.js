require("../../test-env");

function edgeLabel(g) {
  return function(u, v) {
    return g.hasEdge(u, v) ? g.edgeLabel(u, v) : Number.POSITIVE_INFINITY;
  }
}

describe("dig.alg.prim", function() {
  it("returns an empty graph given an empty graph", function() {
    var g = new dig.UGraph();
    assert.graphEqual(g, dig.alg.prim(g));
  });

  it("returns a single node for a singleton graph", function() {
    var g = new dig.UGraph();
    g.addNode(1);
    assert.graphEqual(g, dig.alg.prim(g));
  });

  it("returns a unique result for diamond graph with different path weights", function() {
    var g = new dig.UGraph();
    g.addNodes(1, 2, 3, 4);
    g.addEdge(1, 2, 1);
    g.addEdge(1, 3, 2);
    g.addEdge(2, 4, 3);
    g.addEdge(3, 4, 4);

    var expected = new dig.UGraph();
    expected.addNodes(1, 2, 3, 4);
    expected.addPath(1, 2, 4);
    expected.addEdge(1, 3);

    assert.graphEqual(expected, dig.alg.prim(g, edgeLabel(g)));
  });

  it("returns a unique result for a small network with different path weights", function() {
    var g = new dig.UGraph();
    g.addNodes(1, 2, 3, 4, 5, 6);
    g.addEdge(1, 2, 1);
    g.addEdge(1, 3, 3);
    g.addEdge(1, 6, 5);
    g.addEdge(2, 3, 9);
    g.addEdge(2, 4, 2);
    g.addEdge(3, 4, 8);
    g.addEdge(3, 5, 4);
    g.addEdge(3, 6, 6);
    g.addEdge(4, 5, 7);

    var expected = new dig.UGraph();
    expected.addNodes(1, 2, 3, 4, 5, 6);
    expected.addPath(1, 2, 4);
    expected.addPath(1, 3, 5);
    expected.addEdge(1, 6);

    assert.graphEqual(expected, dig.alg.prim(g, edgeLabel(g)));
  });
});
