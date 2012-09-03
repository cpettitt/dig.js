require("../../test-env");

describe("dig.dot.layout(graph)", function() {
  // Weak assertion for now :)
  // TODO better tests
  it("doesn't throw an exception", function() {
    dig.dot.layout(dig.dot.read("digraph { a -> b -> d; a -> c -> d; }"));
  });
});

describe("dig.dot.layout.addDummyNodes(graph)", function() {
  it("does not change a graph with unit length edges", function() {
    var g = dig.dot.read("digraph { A [rank=0]; B [rank=1]; A -> B}");
    var g2 = g.copy();
    dig.dot.layout.addDummyNodes(g2);
    assert.graphEqual(g, g2);
  });

  it("adds dummy nodes for forward edges that cross multiple ranks", function() {
    var g = dig.dot.read("digraph { A [rank=0]; B [rank=2]; A -> B }");
    dig.dot.layout.addDummyNodes(g);

    assert.isFalse(g.hasEdge("A", "B")); 
    var successors = g.successors("A");
    assert.equal(1, successors.length);
    var successor = successors[0];
    assert.isTrue(g.hasEdge(successor, "B"));
    assert.equal(1, g.node(successor).rank);
    assert.isTrue(g.node(successor).dummy);
  });

  it("adds dummy nodes for back edges that cross multiple ranks", function() {
    var g = dig.dot.read("digraph { A [rank=0]; B [rank=2]; B -> A }");
    dig.dot.layout.addDummyNodes(g);

    assert.isFalse(g.hasEdge("B", "A")); 
    var successors = g.successors("B");
    assert.equal(1, successors.length);
    var successor = successors[0];
    assert.isTrue(g.hasEdge(successor, "A"));
    assert.equal(1, g.node(successor).rank);
    assert.isTrue(g.node(successor).dummy);
  });
});
