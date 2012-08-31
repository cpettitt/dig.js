var dig_dot_write = dig.dot.write = (function() {
  function id(obj) {
    return '"' + obj.toString().replace('"', '\\"') + '"';
  }

  function _writeNode(u, attrs) {
    var str = "    " + id(u);
    var hasAttrs = false;
    for (var k in attrs) {
      if (!hasAttrs) {
        str += ' [';
        hasAttrs = true;
      } else {
        str += ',';
      }
      str += id(k) + "=" + id(attrs[k]);
    }
    if (hasAttrs) {
      str += "]";
    }
    str += "\n";
    return str;
  }

  function _writeEdge(edgeConnector, u, v, attrs) {
    var str = "    " + id(u) + " " + edgeConnector + " " + id(v);
    var hasAttrs = false;
    for (var k in attrs) {
      if (!hasAttrs) {
        str += ' [';
        hasAttrs = true;
      } else {
        str += ',';
      }
      str += id(k) + "=" + id(attrs[k]);
    }
    if (hasAttrs) {
      str += "]";
    }
    str += "\n";
    return str;
  }

  return function(g) {
    var edgeConnector = g.isDirected() ? "->" : "--";
    var str = (g.isDirected() ? "digraph" : "graph") + " {\n";

    dig_util_forEach(g.nodes(), function(u) {
      str += _writeNode(u, g.node(u));
    });

    dig_util_forEach(g.edges(), function(e) {
      str += _writeEdge(edgeConnector, e.from, e.to, e.attrs);
    });

    str += "}\n";
    return str;
  };
})();
