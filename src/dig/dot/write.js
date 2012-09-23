var dig_dot_write = dig.dot.write = (function() {
  function id(obj) {
    return '"' + obj.toString().replace(/"/g, '\\"') + '"';
  }

  function idVal(obj) {
    if (Object.prototype.toString.call(obj) === "[object Object]" ||
        Object.prototype.toString.call(obj) === "[object Array]") {
      return id(JSON.stringify(obj));
    }
    return id(obj);
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
      str += id(k) + "=" + idVal(attrs[k]);
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
      str += id(k) + "=" + idVal(attrs[k]);
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

    g.nodes().forEach(function(u) {
      str += _writeNode(u, g.node(u));
    });

    g.edges().forEach(function(e) {
      str += _writeEdge(edgeConnector, e.from, e.to, e.attrs);
    });

    str += "}\n";
    return str;
  };
})();
