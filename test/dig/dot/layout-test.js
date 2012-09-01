require("../../test-env");

var graphs = require("../../test-graphs");

describe("dig.dot.layout(graph)", function() {
  // Weak assertion for now :)
  // TODO better tests
  it("doesn't throw an exception", function() {
    dig.dot.layout(dig.dot.read("digraph { a -> b -> d; a -> c -> d; }"));
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
    var g = graphs.directed.node1.copy();
    var expected = g.copy();
    expected.node(1).rank = 0;

    dig.dot.alg.initRank(g);
    assert.graphEqual(expected, g);
  });

  it("can rank the diamond graph", function() {
    var g = graphs.directed.diamond.copy();
    var expected = g.copy();
    expected.node(1).rank = 0;
    expected.node(2).rank = 1;
    expected.node(3).rank = 1;
    expected.node(4).rank = 2;

    dig.dot.alg.initRank(g);
    assert.graphEqual(expected, g);
  });

  it("can rank a graph with multiple inedge constraints", function() {
    var g = dig.dot.read("digraph { 1 -> 2 -> 3; 1 -> 3 }");
    var expected = g.copy();
    expected.node(1).rank = 0;
    expected.node(2).rank = 1;
    expected.node(3).rank = 2;

    dig.dot.alg.initRank(g);
    assert.graphEqual(expected, g);
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
    g.node(1).rank = 0;
    g.node(2).rank = 1;
    var g2 = g.copy();
    dig.dot.alg.addDummyNodes(g2);
    assert.graphEqual(g, g2);
  });

  it("inserts nodes between incident nodes separated by more than one rank", function() {
    var g = graphs.directed.edge1.copy();
    g.node(1).rank = 0;
    g.node(2).rank = 2;

    var g2 = g.copy();
    dig.dot.alg.addDummyNodes(g2);
    assert.isFalse(g2.hasEdge(1, 2));
    var successors = g2.successors(1);
    assert.equal(1, successors.length);
    var successor = successors[0];
    assert.isTrue(g2.hasEdge(successor, 2));
  });

  it("assigns the correct rank when inserting nodes", function() {
    var g = graphs.directed.edge1.copy();
    g.node(1).rank = 0;
    g.node(2).rank = 2;

    var g2 = g.copy();
    dig.dot.alg.addDummyNodes(g2);
    assert.equal(1, g2.node(g2.successors(1)[0]).rank);
  });

  it("sets the dummy flag on dummy nodes", function() {
    var g = graphs.directed.edge1.copy();
    g.node(1).rank = 0;
    g.node(2).rank = 2;

    var g2 = g.copy();
    dig.dot.alg.addDummyNodes(g2);
    assert.isTrue(g2.node(g2.successors(1)[0]).dummy);
  });
});

describe("dig.dot.alg.initOrder(graph)", function() {
  it("returns an array ordering for graphs", function() {
    var g = graphs.directed.diamond.copy();
    g.node(1).rank = 0;
    g.node(2).rank = 1;
    g.node(3).rank = 1;
    g.node(4).rank = 2;

    var ranks = dig.dot.alg.initOrder(g);
    assert.deepEqual([1], ranks[0]);
    assert.deepEqual([2, 3], ranks[1].sort());
    assert.deepEqual([4], ranks[2]);
    assert.equal(3, ranks.length);
  });

  it("works for graphs with multiple min-rank nodes", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 1 -> 4; 2 -> 5 }");
    g.node(1).rank = 0;
    g.node(2).rank = 0;
    g.node(3).rank = 1;
    g.node(4).rank = 1;
    g.node(5).rank = 1;

    var ranks = dig.dot.alg.initOrder(g, ranks);
    assert.deepEqual([1, 2], ranks[0].sort());
    assert.deepEqual([3, 4, 5], ranks[1].sort());
    assert.equal(2, ranks.length);
  });
});

describe("dig.dot.alg.graphCrossCount(graph, ranks)", function() {
  it("returns 0 for an empty graph", function() {
    var g = new dig.DiGraph();
    assert.equal(0, dig.dot.alg.graphCrossCount(g, []));
  });

  it("returns 0 for a graph with one layer", function() {
    var g = dig.dot.read("digraph { 1; 2; 3}");
    assert.equal(0, dig.dot.alg.graphCrossCount(g, [[1, 2, 3]]));
  });

  it("matches bilayerCrossCount for 2 layers", function() {
    var g = dig.dot.read("digraph { n0 -> s0; n1 -> s1; n1 -> s2; n2 -> s0; n2 -> s3; n2 -> s4; n3 -> s0; n3 -> s2; n4 -> s3; n5 -> s2; n5 -> s4;}");
    assert.equal(12, dig.dot.alg.graphCrossCount(g, [["n0", "n1", "n2", "n3", "n4", "n5"], ["s0", "s1", "s2", "s3", "s4"]]));
  });

  it("works for graphs with more than 2 layers", function() {
    var g = dig.dot.read("digraph { 1 -> 12; 2 -> 11; 11 -> 22; 12 -> 21 }");
    assert.equal(2, dig.dot.alg.graphCrossCount(g, [[01, 02], [11, 12], [21, 22]]));
  });
});

describe("dig.dot.alg.bilayerCrossCount(graph, norths, souths)", function() {
  it("returns 0 for a single edge", function() {
    var g = graphs.directed.edge1;
    assert.equal(0, dig.dot.alg.bilayerCrossCount(g, [1], [2]));
  });

  it("returns 1 for a graph with an x structure", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 3 }");
    assert.equal(1, dig.dot.alg.bilayerCrossCount(g, [1, 2], [3, 4]));
  });

  it("returns 0 for a graph with parallel edges", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 2 -> 4 }");
    assert.equal(0, dig.dot.alg.bilayerCrossCount(g, [1, 2], [3, 4]));
  });

  it("returns 0 for a graph with 3 edges that don't overlap", function() {
    var g = dig.dot.read("digraph { 01 -> 11; 02 -> 13; 02 -> 12; }");
    assert.equal(0, dig.dot.alg.bilayerCrossCount(g, ["01", "02"], ["11", "13", "12"]));
  });

  it("returns 12 for barth example", function() {
    var g = dig.dot.read("digraph { n0 -> s0; n1 -> s1; n1 -> s2; n2 -> s0; n2 -> s3; n2 -> s4; n3 -> s0; n3 -> s2; n4 -> s3; n5 -> s2; n5 -> s4;}");
    assert.equal(12, dig.dot.alg.bilayerCrossCount(g, ["n0", "n1", "n2", "n3", "n4", "n5"], ["s0", "s1", "s2", "s3", "s4"]));
  });

  it("is not influenced by unrelated layers", function() {
    var g = dig.dot.read("digraph { 1 -> 12; 2 -> 11; 11 -> 22; 12 -> 21 }");
    assert.equal(1, dig.dot.alg.bilayerCrossCount(g, [01, 02], [11, 12]));
  });
});

describe("dig.dot.alg.barycenter(graph, fixed, movable)", function() {
  it("returns the average position of adjacent nodes in the fixed rank", function() {
    var g = dig.dot.read("digraph { 3 -> 1; 4 -> 1; 4 -> 2 }");
    var fixed = [3, 4];
    var movable = [1, 2];

    assert.deepEqual({1: 0.5, 2: 1}, dig.dot.alg.barycenter(g, fixed, movable));
  });

  it("handles neighbors in either direction (successors or predecessors)", function() {
    var g = dig.dot.read("digraph { 1 -> 3; 1 -> 4; 2 -> 4 }");
    var fixed = [1, 2];
    var movable = [3, 4];

    assert.deepEqual({3: 0, 4: 0.5}, dig.dot.alg.barycenter(g, fixed, movable));
  });

  it("assigns -1 weight to nodes with no neighbors", function() {
    var g = dig.dot.read("digraph { 1 -> 2; 3 }");
    var fixed = [1];
    var movable = [2, 3];

    assert.deepEqual({2: 0, 3: -1}, dig.dot.alg.barycenter(g, fixed, movable));
  });

  it("only uses nodes in the selected ranks to calculate weight", function() {
    var g = dig.dot.read("digraph { 1 -> 2; 2 -> 3; 2 -> 4 }");
    var fixed = [1];
    var movable = [2];

    assert.deepEqual({2: 0}, dig.dot.alg.barycenter(g, fixed, movable));
  });
});

describe("dig.dot.alg.barycenterSort(rank, weights)", function() {
  it("sorts based on the given weights", function() {
    var rank = [3, 2, 4, 1];
    var weights = {3: 6, 2: 4, 4: 8, 1: 2};

    assert.deepEqual([1, 2, 3, 4], dig.dot.alg.barycenterSort(rank, weights));
  });

  it("leaves -1 in fixed positions", function() {
    var rank = [3, 2, 4, 1];
    var weights = {3: 6, 2: -1, 4: 8, 1: 2};

    assert.deepEqual([1, 2, 3, 4], dig.dot.alg.barycenterSort(rank, weights));
  });
});

describe("dig.dot.alg.order(graph)", function() {
  it("finds an optimal ordering for nodes", function() {
    var g = dig.dot.read("digraph { 01 -> 11; 02 -> 12; 02 -> 13; 11 -> 22; 12 -> 21; 13 -> 22; 13 -> 23 }");
    dig.dot.alg.rank(g);
    var layers = dig.dot.alg.order(g);
    assert.equal(0, dig.dot.alg.graphCrossCount(g, layers));
  });
});

describe("dig.dot.alg.removeNonMedians(graph, layers)", function() {
  it("does nothing if a node has no predecessors", function() {
    var g = dig.dot.read("digraph { 1; 2 }");
    var layers = [[1], [2]];
    var expected = g.copy();
    dig.dot.alg.removeNonMedians(g, layers);
    assert.graphEqual(expected, g);
  });

  it("does nothing if a node has a single predecessor", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var expected = g.copy();
    dig.dot.alg.removeNonMedians(g, layers);
    assert.graphEqual(expected, g);
  });

  it("removes all but the median node for |predecessor(v)| % 2 == 1", function() {
    var g = dig.dot.read("digraph { 1 -> 4; 2 -> 4; 3 -> 4 }");
    var layers = [[1, 2, 3], [4]];
    var expected = g.copy();
    expected.removeEdge(1, 4);
    expected.removeEdge(3, 4);
    dig.dot.alg.removeNonMedians(g, layers);
    assert.graphEqual(expected, g);
  });

  it("removes all but two median nodes for |predecessor(v)| % 2 == 0", function() {
    var g = dig.dot.read("digraph { 1 -> 5; 2 -> 5; 3 -> 5; 4 -> 5; }");
    var layers = [[1, 2, 3, 4], [5]];
    var expected = g.copy();
    expected.removeEdge(1, 5);
    expected.removeEdge(4, 5);
    dig.dot.alg.removeNonMedians(g, layers);
    assert.graphEqual(expected, g);
  });

  it("works across layers", function() {
    var g = dig.dot.read("digraph { A1 -> B1 -> C2; A2 -> B2 -> C2; A3 -> B3 -> C2; A1 -> B2; A3 -> B2 }");
    var layers = [["A1", "A2", "A3"], ["B1", "B2", "B3"], ["C2"]];
    var expected = g.copy();
    expected.removeEdge("A1", "B2");
    expected.removeEdge("A3", "B2");
    expected.removeEdge("B1", "C2");
    expected.removeEdge("B3", "C2");
    dig.dot.alg.removeNonMedians(g, layers);
    assert.graphEqual(expected, g);
  });
});

describe("dig.dot.alg.removeType1Conflicts(graph, layers)", function() {
  it("does not remove edges with no conflict", function() {
    var g = dig.dot.read("digraph { 1 -> 2 }");
    var layers = [[1], [2]];
    var expected = g.copy();
    dig.dot.alg.removeType1Conflicts(g, layers);
    assert.graphEqual(expected, g);
  });

  it("removes edges with type 1 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"]];
    var expected = g.copy();
    expected.removeEdge("A1", "B2");
    dig.dot.alg.removeType1Conflicts(g, layers);
    assert.graphEqual(expected, g);
  });

  it("does not remove edges with type 0 conflicts", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];
    var expected = g.copy();
    dig.dot.alg.removeType1Conflicts(g, layers);
    assert.graphEqual(expected, g);
  });

  it("it also removes type 2 conflicts", function() {
    // Note: type 2 conflicts should be resolved before calling this algorithm,
    // but the algorithm is able to resolve them if needed.
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1 }");
    var layers = [["A1", "A2"], ["B1", "B2"]];
    g.node("A1").dummy = true;
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("B2").dummy = true;
    var expected = g.copy();
    expected.removeEdge("A1", "B2");
    dig.dot.alg.removeType1Conflicts(g, layers);
    assert.graphEqual(expected, g);
  });

  it("works across multiple layers", function() {
    var g = dig.dot.read("digraph { A1 -> B2; A2 -> B1; B2 -> C1; B1 -> C2 }");
    g.node("A2").dummy = true;
    g.node("B1").dummy = true;
    g.node("C2").dummy = true;
    var layers = [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]];
    var expected = g.copy();
    expected.removeEdge("A1", "B2");
    expected.removeEdge("B2", "C1");
    dig.dot.alg.removeType1Conflicts(g, layers);
    assert.graphEqual(expected, g);
  });
});
