require("../../../test-env");

var graphs = require("../../../test-graphs");

describe("dig.dot.layout.order(graph)", function() {
  it("finds an optimal ordering for order1 graph", function() {
    var g = graphs.directed.order1.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(0, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order2 graph", function() {
    var g = graphs.directed.order2.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(1, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order3 graph", function() {
    var g = graphs.directed.order3.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(0, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order4 graph", function() {
    var g = graphs.directed.order4.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(1, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order5 graph", function() {
    var g = graphs.directed.order5.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(2, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order6 graph", function() {
    var g = graphs.directed.order6.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(0, dig.dot.layout.crossCount(g, ordering));
  });

  it("finds an optimal ordering for order7 graph", function() {
    var g = graphs.directed.order7.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    assert.equal(5, dig.dot.layout.crossCount(g, ordering));
  });

  it("sets ordering on the node to match order in the returned array", function() {
    var g = graphs.directed.order6.copy();
    dig.dot.layout.rank(g);
    var ordering = dig.dot.layout.order(g);
    g.nodes().forEach(function(u) {
      assert.equal(u, ordering[g.node(u).rank][g.node(u).order]);
    });
  });
});
