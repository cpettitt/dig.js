require("../../test-env");

graphs = require("../../test-graphs");

function edgeLabel(g) {
  return function(u, v) {
    return g.hasEdge(u, v) ? g.edge(u, v).label : Number.POSITIVE_INFINITY;
  }
}

describe("dig.alg.prim", function() {
  it("returns an empty graph given an empty graph", function() {
    var g = graphs.undirected.empty;
    assert.graphEqual(g, dig.alg.prim(g));
  });

  it("returns a single node for a singleton graph", function() {
    var g = graphs.undirected.node1;
    assert.graphEqual(g, dig.alg.prim(g));
  });

  it("returns a unique result for a small network with different path weights", function() {
    var g = graphs.undirected.prim6;

    var expected = new dig.UGraph();
    expected.addNodes("A", "B", "C", "D", "E", "F");
    expected.addPath("A", "B", "C");
    expected.addPath("B", "D", "E", "F");

    assert.graphEqual(expected, dig.alg.prim(g, edgeLabel(g)));
  });

  it("allows directed graphs using undirected traversal", function() {
    var g = new dig.DiGraph();
    g.addNodes("A", "B", "C");
    g.addEdge("A", "B");
    g.addEdge("C", "B");

    assert.graphEqual(g.undirected(), dig.alg.prim(g, function() { return 1; }));
  });

  it("throws an error for graphs that are not connected", function() {
    var g = new dig.UGraph();
    g.addNodes("A", "B");

    assert.throws(function() { dig.alg.prim(g); });
  });
});
