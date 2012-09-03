describe("dig.dot.layout.findMedians(graph, layers, layerTraversal)", function() {
  it("gives an empty array for nodes without incident edges", function() {
    var g = dig.dot.read("digraph { 1; 2 }");
    var layers = [[1], [2]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    assert.deepEqual({1: [], 2: []}, medians);
  });

  it("gives a singleton array for nodes with one incident edge", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    assert.deepEqual({1: [], 2: [1]}, medians);
  });

  it("gives the single median for nodes with an odd number of incident edges", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 4; 3 -> 4 }");
    var layers = [[1, 2, 3], [4]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    assert.deepEqual({1: [], 2: [], 3: [], 4: [2]}, medians);
  });

  it("gives two medians for nodes with an even number of incident edges", function() {
    var g = dig.dot.read("digraph { 1 -> 5; 2 -> 5; 3 -> 5; 4 -> 5; }");
    var layers = [[1, 2, 3, 4], [5]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    assert.deepEqual({1: [], 2: [], 3: [], 4: [], 5: [2, 3]}, medians);
  });

  it("works across layers", function() {
    var g = dig.dot.read("digraph { A1 -> B1 -> C2; A2 -> B2 -> C2; A3 -> B3 -> C2; A1 -> B2; A3 -> B2 }");
    var layers = [["A1", "A2", "A3"], ["B1", "B2", "B3"], ["C2"]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    assert.deepEqual({A1: [], A2: [], A3: [], B1: ["A1"], B2: ["A2"], B3: ["A3"], C2: ["B2"]}, medians);
  });

  it("works for bottom traversal", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 4; 3 -> 4 }");
    var layers = [[1, 2, 3], [4]];
    var medians = dig.dot.layout.findMedians(g, layers, dig.dot.layout.bottom);
    assert.deepEqual({1: [4], 2: [4], 3: [4], 4: []}, medians);
  });
});

describe("dig.dot.layout.removeType1Conflicts(graph, layers)", function() {
  it("does not remove edges with no conflict", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.top);
    assert.deepEqual({1: [], 2: [1]}, meds);
  });

  it("removes edges with type 1 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: []}, meds);
  });

  it("does not remove edges with type 0 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: ["A1"]}, meds);
  });

  it("does not remove edges with type 2 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];
    g.node("A1").dummy = true;
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("B2").dummy = true;

    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: ["A1"]}, meds);
  });

  it("works across multiple layers", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1; B2 -> C1; B1 -> C2 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("C2").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]];

    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.top);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.top);
    assert.deepEqual({A1: [], A2: [], B1: ["A2"], B2: [], C1: [], C2: ["B1"]}, meds);
  });

  it("works for bottom traversal", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"]];

    var meds = dig.dot.layout.findMedians(g, layers, dig.dot.layout.bottom);
    dig.dot.layout.removeType1Conflicts(g, meds, layers, dig.dot.layout.bottom);
    assert.deepEqual({A1: [], A2: ["B1"], B1: [], B2: []}, meds);
  });
});

describe("dig.dot.layout.verticalAlignment(graph, layers, medians)", function() {
  it("returns two roots for 2 unconnected nodes", function() {
    var g = dig.dot.read("digraph { 1; 2 }");
    var layers = [[1], [2]];
    var meds = {1: [], 2: []};
    var expected = {
      root: {1: 1, 2: 2},
      align: {1: 1, 2: 2}
    };
    assert.deepEqual(expected, dig.dot.layout.verticalAlignment(g, layers, meds));
  });

  it("returns a single root for 2 connected nodes", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var meds = {1: [], 2: [1]};
    var expected = {
      root: {1: 1, 2: 1},
      align: {1: 2, 2: 1}
    };

    assert.deepEqual(expected, dig.dot.layout.verticalAlignment(g, layers, meds));
  });

  it("biases to the left when there are two medians", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 2 -> 3 }");
    var layers = [[1, 2], [3]];
    var meds = {1: [], 2: [], 3: [1, 2]};
    var expected = {
      root: {1: 1, 2: 2, 3: 1},
      align: {1: 3, 2: 2, 3: 1}
    };

    assert.deepEqual(expected, dig.dot.layout.verticalAlignment(g, layers, meds));
  });
});
