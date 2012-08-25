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

describe("dig.dot.alg.acyclic(graph)", function() {
  it("does not change an acyclic graph", function() {
    var g = graphs.directed.diamond.copy();
    dig.dot.alg.acyclic(g);
    assert.graphEqual(graphs.directed.diamond, g);
    assert.isTrue(g.isAcyclic());
  });

  it("deletes an edge to make a cyclic graph acyclic", function() {
    var g = graphs.directed.cycle2.copy();
    dig.dot.alg.acyclic(g);
    assert.isTrue(g.isAcyclic());
    assert.equal(1, g.degree(1));
    assert.equal(1, g.degree(2));
  });

  it("reverses an edge to make a cyclic graph acyclic", function() {
    var g = graphs.directed.cycle3.copy();
    dig.dot.alg.acyclic(g);
    assert.isTrue(g.isAcyclic());
    assert.equal(2, g.degree(1));
    assert.equal(2, g.degree(2));
    assert.equal(2, g.degree(3));
  });

  it("will reverse multiple edges if necessary", function() {
    var g = dig.dot.read("digraph { 1 -> 2 -> 3 -> 1; 3 -> 4 -> 2; }");
    dig.dot.alg.acyclic(g);
    assert.isTrue(g.isAcyclic());
    assert.equal(2, g.degree(1));
    assert.equal(3, g.degree(2));
    assert.equal(3, g.degree(3));
    assert.equal(2, g.degree(4));
  });
});

describe("dig.dot.alg.initRank(graph)", function() {
  it("can rank a singleton graph", function() {
    var g = graphs.directed.node1;
    var ranks = dig.dot.alg.initRank(g);
    assert.deepEqual({1: 0}, ranks);
  });

  it("can rank the diamond graph", function() {
    var g = graphs.directed.diamond;
    var ranks = dig.dot.alg.initRank(g);
    assert.deepEqual({1: 0, 2: 1, 3: 1, 4: 2}, ranks);
  });

  it("can rank a graph with multiple inedge constraints", function() {
    var g = dig.dot.read("digraph { 1 -> 2 -> 3; 1 -> 3 }");
    var ranks = dig.dot.alg.initRank(g);
    assert.deepEqual({1: 0, 2: 1, 3: 2}, ranks);
  });

  it("throws an error for undirected graphs", function() {
    var g = graphs.undirected.edge2.copy();
    assert.throws(function() { dig.dot.alg.initRank(g); });
  });

  it("throws an error for a graph with a strongly connected component", function() {
    var g = graphs.directed.scc3.copy();
    assert.throws(function() { dig.dot.alg.initRank(g); });
  });
});
