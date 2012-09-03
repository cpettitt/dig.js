require("../../../test-env");

describe("dig.dot.layout.crossCount(graph, ranks)", function() {
  it("returns 0 for an empty graph", function() {
    var g = new dig.DiGraph();
    assert.equal(0, dig.dot.layout.crossCount(g, []));
  });

  it("returns 0 for a graph with one layer", function() {
    var g = dig.dot.read("digraph { A; B; C }");
    assert.equal(0, dig.dot.layout.crossCount(g, [["A", "B", "C"]]));
  });

  it("returns 0 for a 2-layer graph with no crossings", function() {
    var g = dig.dot.read("digraph { A1 -> B1; A2 -> B2; A3 -> B3 }");
    assert.equal(0, dig.dot.layout.crossCount(g, [["A1", "A2", "A3"], ["B1", "B2", "B3"]]));
  });

  it("returns 1 for a 2-layer graph with 1 crossing", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1; A3 -> B3 }");
    assert.equal(1, dig.dot.layout.crossCount(g, [["A1", "A2", "A3"], ["B1", "B2", "B3"]]));
  });

  it("handles complicated 2-layer graph crossings", function() {
    var g = dig.dot.read("digraph { A1 -> B1; A2 -> B2; A2 -> B3; A3 -> B1; A3 -> B4; A3 -> B5; A4 -> B1; A4 -> B3; A5 -> B4; A6 -> B3; A6 -> B5 }");
    assert.equal(12, dig.dot.layout.crossCount(g, [["A1", "A2", "A3", "A4", "A5", "A6"], ["B1", "B2", "B3", "B4", "B5"]]));
  });

  it("works for graphs with more than 2 layers", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1; B1 -> C2; B2 -> C1 }");
    assert.equal(2, dig.dot.layout.crossCount(g, [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]]));
  });

  it("works for graphs with back edges", function() {
    var g = dig.dot.read("digraph { A1 -> B2; B1 -> A2 }");
    assert.equal(1, dig.dot.layout.crossCount(g, [["A1", "A2"], ["B1", "B2"]]));
  });

  it("handles back edges on graphs with more than 2 layers", function() {
    var g = dig.dot.read("digraph { A1 -> B2; B1 -> A2; B2 -> C1; C2 -> B1 }");
    assert.equal(2, dig.dot.layout.crossCount(g, [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]]));
  });
});

