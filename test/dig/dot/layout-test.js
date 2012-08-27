require("../../test-env");

var graphs = require("../../test-graphs");

describe("dig.dot.alg.acyclic(graph)", function() {
  it("does not change an acyclic graph", function() {
    var g = dig.dot.alg.acyclic(graphs.directed.diamond);
    assert.graphEqual(graphs.directed.diamond, g);
    assert.isTrue(g.isAcyclic());
  });

  it("deletes an edge to make a cyclic graph acyclic", function() {
    var g = dig.dot.alg.acyclic(graphs.directed.cycle2);
    assert.isTrue(g.isAcyclic());
    assert.equal(1, g.degree(1));
    assert.equal(1, g.degree(2));
  });

  it("reverses an edge to make a cyclic graph acyclic", function() {
    var g = dig.dot.alg.acyclic(graphs.directed.cycle3);
    assert.isTrue(g.isAcyclic());
    assert.equal(2, g.degree(1));
    assert.equal(2, g.degree(2));
    assert.equal(2, g.degree(3));
  });

  it("will reverse multiple edges if necessary", function() {
    var input = dig.dot.read("digraph { 1 -> 2 -> 3 -> 1; 3 -> 4 -> 2; }");
    var g = dig.dot.alg.acyclic(input);
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
    var expected = g.copy();
    expected.nodeLabel(1, 0);

    var actual = dig.dot.alg.initRank(g);
    assert.graphEqual(expected, actual);
  });

  it("can rank the diamond graph", function() {
    var g = graphs.directed.diamond;
    var expected = g.copy();
    expected.nodeLabel(1, 0);
    expected.nodeLabel(2, 1);
    expected.nodeLabel(3, 1);
    expected.nodeLabel(4, 2);

    var actual = dig.dot.alg.initRank(g);
    assert.graphEqual(expected, actual);
  });

  it("can rank a graph with multiple inedge constraints", function() {
    var g = dig.dot.read("digraph { 1 -> 2 -> 3; 1 -> 3 }");
    var expected = g.copy();
    expected.nodeLabel(1, 0);
    expected.nodeLabel(2, 1);
    expected.nodeLabel(3, 2);

    var actual = dig.dot.alg.initRank(g);
    assert.graphEqual(expected, actual);
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

describe("dig.dot.alg.addDummyNodes(graph)", function() {
  it("does not change a graph with unit length edges", function() {
    var g = graphs.directed.edge1.copy();
    g.nodeLabel(1, 0);
    g.nodeLabel(2, 1);
    var g2 = dig.dot.alg.addDummyNodes(g);
    assert.graphEqual(g, g2);
  });

  it("inserts nodes between incident nodes separated by more than one rank", function() {
    var g = graphs.directed.edge1.copy();
    g.nodeLabel(1, 0);
    g.nodeLabel(2, 2);

    var g2 = dig.dot.alg.addDummyNodes(g);
    assert.isFalse(g2.hasEdge(1, 2));
    var successors = g2.successors(1);
    assert.equal(1, successors.length);
    var successor = successors[0];
    assert.isTrue(g2.hasEdge(successor, 2));
  });

  it("assigns the correct rank when inserting nodes", function() {
    var g = graphs.directed.edge1.copy();
    g.nodeLabel(1, 0);
    g.nodeLabel(2, 2);

    var g2 = dig.dot.alg.addDummyNodes(g);
    assert.equal(1, g2.nodeLabel(g2.successors(1)[0]));
  });
});

describe("dig.dot.alg.initOrder(graph)", function() {
  it("returns an array ordering for graphs", function() {
    var g = graphs.directed.diamond.copy();
    g.nodeLabel(1, 0);
    g.nodeLabel(2, 1);
    g.nodeLabel(3, 1);
    g.nodeLabel(4, 2);

    var ranks = dig.dot.alg.initOrder(g);
    assert.deepEqual([1], ranks[0]);
    assert.deepEqual([2, 3], ranks[1].sort());
    assert.deepEqual([4], ranks[2]);
    assert.equal(3, ranks.length);
  });

  it("works for graphs with multiple min-rank nodes", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 1 -> 4; 2 -> 5 }");
    g.nodeLabel(1, 0);
    g.nodeLabel(2, 0);
    g.nodeLabel(3, 1);
    g.nodeLabel(4, 1);
    g.nodeLabel(5, 1);

    var ranks = dig.dot.alg.initOrder(g, ranks);
    assert.deepEqual([1, 2], ranks[0].sort());
    assert.deepEqual([3, 4, 5], ranks[1].sort());
    assert.equal(2, ranks.length);
  });
});

describe("dig.dot.alg.bcc(graph, norths, souths)", function() {
  it("returns 0 for a single edge", function() {
    var g = graphs.directed.edge1;
    assert.equal(0, dig.dot.alg.bcc(g, [1], [2]));
  });

  it("returns 1 for a graph with an x structure", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 3 }");
    assert.equal(1, dig.dot.alg.bcc(g, [1, 2], [3, 4]));
  });

  it("returns 0 for a graph with parallel edges", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 2 -> 4 }");
    assert.equal(0, dig.dot.alg.bcc(g, [1, 2], [3, 4]));
  });

  it("returns 12 for barth example", function() {
    var g = dig.dot.read("digraph { n0 -> s0; n1 -> s1; n1 -> s2; n2 -> s0; n2 -> s3; n2 -> s4; n3 -> s0; n3 -> s2; n4 -> s3; n5 -> s2; n5 -> s4;}");
    assert.equal(12, dig.dot.alg.bcc(g, ["n0", "n1", "n2", "n3", "n4", "n5"], ["s0", "s1", "s2", "s3", "s4"]));
  });
});
