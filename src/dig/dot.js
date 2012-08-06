dig.dot = {};

dig.dot.write = (function() {
  function id(obj) {
    return '"' + obj.toString().replace('"', '\\"') + '"';
  }

  return function(graph) {
    var str = "digraph {\n";

    dig_util_forEach(graph.nodes(), function(v) {
      str += "    " + id(v) + ";\n";
    });

    dig_util_forEach(graph.edges(), function(e) {
      str += "    " + id(e.from) + " -> " + id(e.to) + ";\n";
    });

    str += "}\n";
    return str;
  };
})();
