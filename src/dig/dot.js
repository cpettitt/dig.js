dig.dot = {};
dig.dot.alg = {};

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

var dig_dot_read = dig.dot.read = function(dot) {
  var parseTree = dig_dot_parser.parse(dot);
  var graph = parseTree.type === "digraph" ? new dig.DiGraph() : new dig.UGraph();

  function handleStmt(stmt) {
    switch (stmt.type) {
      case "node":
        var id = stmt.id;
        var label = stmt.attrs.label;
        graph.addNode(id);
        graph.nodeLabel(id, label);
        break;
      case "edge":
        var prev;
        dig_util_forEach(stmt.elems, function(elem) {
          handleStmt(elem);

          switch(elem.type) {
            case "node":
              if (prev) {
                graph.addEdge(prev, elem.id, stmt.attrs.label);
              }
              prev = elem.id; 
              break;
            default:
              // We don't currently support subgraphs incident on an edge
              throw new Error("Unsupported type incident on edge: " + elem.type);
          }
        });
        break;
      case "attr":
        // Ignore attrs
        break;
      default:
        throw new Error("Unsupported statement type: " + stmt.type);
    }
  }

  dig_util_forEach(parseTree.stmts, function(stmt) {
    handleStmt(stmt);
  });
  return graph;
}

// For now we use a BFS algorithm to assign ranks. This algorithm requires
// at least one source and requires that all nodes are reachable from the
// graph sources (i.e. no strongly connected components).
// TODO support weighted edges
var dig_dot_alg_initRank = dig.dot.alg.initRank = function(g) {
  g = g.copy();

  var ranks = dig_alg_levels(g, g.sources());

  // Make sure we visited everything
  var visitCount = 0;
  dig_util_forEach(dig_util_objToArr(ranks), function() { ++visitCount; });

  if (visitCount != g.order()) {
    throw new Error("One or more strongly connected components in the input graph: " + g);
  }

  dig_util_forEach(dig_util_objToArr(ranks), function(u) {
    g.nodeLabel(u, ranks[u]);   
  });

  return g;
}
