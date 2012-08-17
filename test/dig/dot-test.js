require("../test-env");

var graphs = require("../test-graphs");

describe("dig.dot.write", function() {
  it("can serialize all directed test graphs", function() {
    for (var g in graphs) {
      var src = graphs[g];
      var serialized = dig.dot.write(src);
      var parsed = dig.dot.read(serialized);
      assert.graphEqual(src, parsed);
    }
  });

  it("can serialize all undirected test graphs", function() {
    for (var g in graphs) {
      var src = graphs[g].undirected();
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
