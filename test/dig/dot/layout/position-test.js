describe("dig.dot.layout.position(graph)", function() {
  it("positions a singleton graph", function() {
    var g = dig.dot.read("digraph { A [rank=0, order=0] }");
    dig.dot.layout.position().graph(g);
    assert.equal(0, g.node("A").x);
    assert.equal(0, g.node("A").y);
  });

  it("positions two unconnected nodes", function() {
    var g = dig.dot.read("digraph { A [rank=0, order=0]; B [rank=0, order=1] }");
    dig.dot.layout.position()
      .nodeSep(50)
      .graph(g);
    assert.equal(0, g.node("A").x);
    assert.equal(0, g.node("A").y);
    assert.isTrue(g.node("B").x >= g.node("A").x + 50);
    assert.equal(0, g.node("B").y);
  });

  it("positions two connected nodes", function() {
    var g = dig.dot.read("digraph { A [rank=0, order=0]; B [rank=1, order=0]; A -> B }");
    dig.dot.layout.position()
      .nodeSep(50)
      .rankSep(100)
      .graph(g);
    assert.equal(0, g.node("A").x);
    assert.equal(0, g.node("A").y);
    assert.equal(0, g.node("B").x);
    assert.isTrue(g.node("B").y >= g.node("A").y + 100);
  });
});
