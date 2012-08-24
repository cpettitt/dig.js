require("../test-env");

var graphs = require("../test-graphs");

describe("dig.dot.write(graph)", function() {
  it("can serialize all directed test graphs", function() {
    for (var g in graphs.directed) {
      var src = graphs.directed[g];
      var serialized = dig.dot.write(src);
      var parsed = dig.dot.read(serialized);
      assert.graphEqual(src, parsed);
    }
  });

  it("can serialize all undirected test graphs", function() {
    for (var g in graphs.undirected) {
      var src = graphs.undirected[g];
      var serialized = dig.dot.write(src);
      var parsed = dig.dot.read(serialized);
      assert.graphEqual(src, parsed);
    }
  });

  it("can serialize node labels", function() {
    var src = new dig.DiGraph();
    src.addNode("n1");
    src.nodeLabel("n1", "label1");
    var serialized = dig.dot.write(src);
    var parsed = dig.dot.read(serialized);
    assert.graphEqual(src, parsed);
  });

  it("can serialize edge labels", function() {
    var src = new dig.DiGraph();
    src.addNode("n1");
    src.addNode("n2");
    src.addEdge("n1", "n2", "label1");
    var serialized = dig.dot.write(src);
    var parsed = dig.dot.read(serialized);
    assert.graphEqual(src, parsed);
  });
});

describe("dig.dot.alg.initRank(graph)", function() {
  it("can rank the diamon graph", function() {
    var g = graphs.directed.diamond;
    var g2 = dig.dot.alg.initRank(g);
    assert.equal(0, g2.nodeLabel(1));
    assert.equal(1, g2.nodeLabel(2));
    assert.equal(1, g2.nodeLabel(3));
    assert.equal(2, g2.nodeLabel(4));
  });

  it("throws an error for undirected graphs", function() {
    var g = graphs.undirected.edge2;
    assert.throws(function() { dig.dot.alg.initRank(g); });
  });

  it("throws an error for a graph with a strongly connected component", function() {
    var g = graphs.directed.scc3;
    assert.throws(function() { dig.dot.alg.initRank(g); });
  });
});
