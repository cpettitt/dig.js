require("../../test-env");

var graphs = require("../../test-graphs");

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

  it("can serialize node attributes", function() {
    var src = new dig.DiGraph();
    src.addNode("n1");
    src.node("n1").label = "label1";
    src.node("n1").weight = "123";
    var serialized = dig.dot.write(src);
    var parsed = dig.dot.read(serialized);
    assert.graphEqual(src, parsed);
  });

  it("can serialize edge attributes", function() {
    var src = new dig.DiGraph();
    src.addNode("n1");
    src.addNode("n2");
    src.addEdge("n1", "n2", {label: "label1", weight: "123"});
    var serialized = dig.dot.write(src);
    var parsed = dig.dot.read(serialized);
    assert.graphEqual(src, parsed);
  });

  it("can serialize edge attributes with embedded quotes", function() {
    var src = new dig.DiGraph();
    src.addNode("n1");
    src.addNode("n2");
    src.addEdge("n1", "n2", {label: "\"label1\"", dblquote: "test\\\\", weight: "123"});
    var serialized = dig.dot.write(src);
    var parsed = dig.dot.read(serialized);
    assert.graphEqual(src, parsed);
  });
});
