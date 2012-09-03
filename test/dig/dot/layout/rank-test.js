require("../../../test-env");

describe("dig.dot.layout.rank(graph)", function() {
  it("gives rank 0 to a single node", function() {
    var g = dig.dot.read("digraph { A }");
    dig.dot.layout.rank(g);
    assert.equal(0, g.node("A").rank);
  });

  it("unambiguously ranks a connected 2 node graph", function() {
    var g = dig.dot.read("digraph { A -> B }");
    dig.dot.layout.rank(g);
    assert.equal(0, g.node("A").rank);
    assert.equal(1, g.node("B").rank);
  });

  it("unambiguously ranks a diamond graph", function() {
    var g = dig.dot.read("digraph { A -> B -> D; A -> C -> D }");
    dig.dot.layout.rank(g);
    assert.equal(0, g.node("A").rank);
    assert.equal(1, g.node("B").rank);
    assert.equal(1, g.node("C").rank);
    assert.equal(2, g.node("D").rank);
  });

  it("removes cycles to generate a ranking", function() {
    var g = dig.dot.read("digraph { A -> B -> C -> D -> A }");
    dig.dot.layout.rank(g);

    // It is not deterministic where the cycle will be broken, so we find the
    // rank of A and adjust all other nodes as appropriate.
    var delta = g.node("A").rank;
    assert.notEqual(undefined, delta);

    g.nodes().forEach(function(u) {
      g.node(u).rank = "" + ((g.node(u).rank - delta) % g.order());
    });

    var expected = dig.dot.read("digraph { A [rank=0]; B [rank=1]; C [rank=2]; D [rank=3]; A -> B -> C -> D -> A }");
    assert.graphEqual(expected, g);
  });

  it("unambiguously ranks an node with an in-edge from two different ranks", function() {
    var g = dig.dot.read("digraph { A -> B; A -> C; A -> D; C -> D }");
    dig.dot.layout.rank(g);
    assert.equal(0, g.node("A").rank);
    assert.equal(1, g.node("B").rank);
    assert.equal(1, g.node("C").rank);
    assert.equal(2, g.node("D").rank);
  });

  it("throws an error for undirected graphs", function() {
    var g = new dig.UGraph();
    assert.throws(function() { dig.dot.layout.rank(g); });
  });
});
