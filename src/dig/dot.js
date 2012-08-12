dig.dot = {};

var dig_dot_write = dig.dot.write = (function() {
  function id(obj) {
    return '"' + obj.toString().replace('"', '\\"') + '"';
  }

  return function(graph) {
    var edgeConnector = graph.isDirected() ? "->" : "--";
    var str = (graph.isDirected() ? "digraph" : "graph") + " {\n";

    dig_util_forEach(graph.nodes(), function(v) {
      str += "    " + id(v);
      var label = graph.nodeLabel(v);
      if (label !== undefined) {
        str += ' [label="' + label + '"]';
      }
      str += ";\n";
    });

    dig_util_forEach(graph.edges(), function(e) {
      str += "    " + id(e.from) + " " + edgeConnector + " " + id(e.to);
      var label = graph.edgeLabel(e.from, e.to);
      if (label !== undefined) {
        str += ' [label="' + label + '"]';
      }
      str += ";\n";
    });

    str += "}\n";
    return str;
  };
})();
