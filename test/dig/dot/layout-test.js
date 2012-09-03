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

describe("dig.dot.alg.findMedians(graph, layers, layerTraversal)", function() {
  it("gives an empty array for nodes without incident edges", function() {
    var g = dig.dot.read("digraph { 1; 2 }");
    var layers = [[1], [2]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    assert.deepEqual({1: [], 2: []}, medians);
  });

  it("gives a singleton array for nodes with one incident edge", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    assert.deepEqual({1: [], 2: [1]}, medians);
  });

  it("gives the single median for nodes with an odd number of incident edges", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 4; 3 -> 4 }");
    var layers = [[1, 2, 3], [4]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    assert.deepEqual({1: [], 2: [], 3: [], 4: [2]}, medians);
  });

  it("gives two medians for nodes with an even number of incident edges", function() {
    var g = dig.dot.read("digraph { 1 -> 5; 2 -> 5; 3 -> 5; 4 -> 5; }");
    var layers = [[1, 2, 3, 4], [5]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    assert.deepEqual({1: [], 2: [], 3: [], 4: [], 5: [2, 3]}, medians);
  });

  it("works across layers", function() {
    var g = dig.dot.read("digraph { A1 -> B1 -> C2; A2 -> B2 -> C2; A3 -> B3 -> C2; A1 -> B2; A3 -> B2 }");
    var layers = [["A1", "A2", "A3"], ["B1", "B2", "B3"], ["C2"]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    assert.deepEqual({A1: [], A2: [], A3: [], B1: ["A1"], B2: ["A2"], B3: ["A3"], C2: ["B2"]}, medians);
  });

  it("works for bottom traversal", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 4; 3 -> 4 }");
    var layers = [[1, 2, 3], [4]];
    var medians = dig.dot.alg.findMedians(g, layers, dig.dot.alg.bottom);
    assert.deepEqual({1: [4], 2: [4], 3: [4], 4: []}, medians);
  });
});

describe("dig.dot.alg.removeType1Conflicts(graph, layers)", function() {
  it("does not remove edges with no conflict", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.top);
    assert.deepEqual({1: [], 2: [1]}, meds);
  });

  it("removes edges with type 1 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: []}, meds);
  });

  it("does not remove edges with type 0 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: ["A1"]}, meds);
  });

  it("does not remove edges with type 2 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];
    g.node("A1").dummy = true;
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("B2").dummy = true;

    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: ["A1"]}, meds);
  });

  it("works across multiple layers", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1; B2 -> C1; B1 -> C2 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("C2").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]];

    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.top);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: [], C1: [], C2: ["B1"]}, meds);
  });

  it("works for bottom traversal", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.alg.findMedians(g, layers, dig.dot.alg.bottom);
    dig.dot.alg.removeType1Conflicts(g, meds, layers, dig.dot.alg.bottom);
    assert.deepEqual({A1: [], A2: ["B1"], B1: [], B2: []}, meds);
  });
});

describe("dig.dot.alg.verticalAlignment(graph, layers, medians)", function() {
  it("returns two roots for 2 unconnected nodes", function() {
    var g = dig.dot.read("digraph { 1; 2 }");
    var layers = [[1], [2]];
    var meds = {1: [], 2: []};
    var expected = {
      root: {1: 1, 2: 2},
      align: {1: 1, 2: 2}
    };
    assert.deepEqual(expected, dig.dot.alg.verticalAlignment(g, layers, meds));
  });

  it("returns a single root for 2 connected nodes", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var meds = {1: [], 2: [1]};
    var expected = {
      root: {1: 1, 2: 1},
      align: {1: 2, 2: 1}
    };

    assert.deepEqual(expected, dig.dot.alg.verticalAlignment(g, layers, meds));
  });

  it("biases to the left when there are two medians", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 2 -> 3 }");
    var layers = [[1, 2], [3]];
    var meds = {1: [], 2: [], 3: [1, 2]};
    var expected = {
      root: {1: 1, 2: 2, 3: 1},
      align: {1: 3, 2: 2, 3: 1}
    };

    assert.deepEqual(expected, dig.dot.alg.verticalAlignment(g, layers, meds));
  });
});
