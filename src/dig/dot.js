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

/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
var dig_dot_layout = dig.dot.layout = function(g) {
  var ranked = dig_dot_alg_rank(g);
  return dig_dot_alg_order(ranked);
}

/*
 * Returns an array of ranks, with each rank contains an array of nodes in the
 * rank. Nodes in each rank do not have a particular order.
 *
 * Pre-conditions:
 *
 *  1. Input graph is connected
 */
var dig_dot_alg_rank = dig.dot.alg.rank = function(g) {
  var acyclic = dig_dot_alg_acyclic(g);
  return dig_dot_alg_initRank(acyclic);
}

/*
 * Given a directed graph this function will return a modified copy of the
 * graph that has been turned into a directed acyclic graph (DAG) by reversing
 * edges that participate in cycles. This algorithm currently just uses a basic
 * DFS traversal.
 *
 * Post-conditions:
 *
 *  1. Input graph is acyclic
 *
 * This algorithm does not preserve labels for reversed edges.
 */
var dig_dot_alg_acyclic = dig.dot.alg.acyclic = function(g) {
  g = g.copy();
  var onStack = {};
  var visited = {};

  function dfs(u) {
    if (u in visited) {
      return;
    }
    visited[u] = true;
    onStack[u] = true;
    dig_util_forEach(g.successors(u), function(v) {
      if (v in onStack) {
        if (!g.hasEdge(v, u)) {
          g.addEdge(v, u);
        }
        g.removeEdge(u, v);
      } else {
        dfs(v);
      }
    });
    delete onStack[u];
  }

  dig_util_forEach(g.nodes(), function(u) {
    dfs(u);
  });

  return g;
}

/*
 * Finds a feasible ranking (description below) for the given graph and
 * returns a copy of the graph with the nodes labelled with their rank.
 *
 * A feasible ranking is one such that for all edges e, length(e) >=
 * min_length(e). For our purposes min_length(e) is always 1 and length(e)
 * is defined as rank(v) - rank(u) for (u, v) = e.
 *
 * Pre-conditions:
 *
 *  1. Input graph is connected
 *  2. Input graph is acyclic
 */
var dig_dot_alg_initRank = dig.dot.alg.initRank = function(g) {
  g = g.copy();
  var pq = new dig_data_PriorityQueue();
  dig_util_forEach(g.nodes(), function(u) {
    pq.add(u, g.indegree(u));
  });

  var current = [];
  var rankNum = 0;
  while (pq.size() > 0) {
    for (var min = pq.min(); pq.priority(min) === 0; min = pq.min()) {
      pq.removeMin();
      g.nodeLabel(min, rankNum);
      current.push(min);
    }

    if (current.length === 0) {
      throw new Error("Input graph is not acyclic!");
    }

    dig_util_forEach(current, function(u) {
      dig_util_forEach(g.successors(u), function(v) {
        pq.decrease(v, pq.priority(v) - 1);
      });
    });

    current = [];
    rankNum++;
  }

  return g;
}

/*
 * Given a graph with nodes labelled by their rank, this function returns an array
 * of ranks where each rank has nodes ordered to minimize edge crossings.
 *
 * NOTE: this is a work in progress
 */
var dig_dot_alg_order = dig.dot.alg.order = function(g) {
  var g2 = dig_dot_alg_addDummyNodes(g);
  var ranks = dig_dot_alg_initOrder(g2);
  return {ranks: ranks, graph: g2};
}

/*
 * Given a graph with nodes labelled by their rank, this function returns a new
 * graph where each edge is of unit length. For example, if rank(u) = 2 and
 * rank(v) = 4 and there is an edge (u, v), this function will replace the
 * edge (u, v) with two edges (u, w), (w, v) so that no edge has a length
 * greater than 1. In this example, rank(w) = 1.
 */
var dig_dot_alg_addDummyNodes = dig.dot.alg.addDummyNodes = function(g) {
  g = g.copy();
  var dummyCount = 0;
  dig_util_forEach(g.edges(), function(e) {
    var origU = e.from,
        u = e.from,
        v = e.to,
        rankU = g.nodeLabel(u) + 1,
        rankV = g.nodeLabel(v);
    g.removeEdge(u, v);
    while (rankU < rankV) {
      var w = "_dummy-" + origU + "-" + v + "-" + dummyCount++;
      g.addNode(w);
      g.nodeLabel(w, rankU);
      g.addEdge(u, w);
      u = w;
      rankU++;
    }
    g.addEdge(u, v);
  });
  return g;
}


/*
 * Returns an array of ranks where each rank has a list of nodes in the given
 * rank. This initial pass attempts to generate a good starting point from
 * which to generate an ordering with minimal edge crossings, but almost
 * certainly some iteration will reduce edge crossing.
 */
var dig_dot_alg_initOrder = dig.dot.alg.initOrder = function(g) {
  // We currently use DFS as described in the graphviz paper.

  var ranks = [];
  var visited = {};

  function dfs(u) {
    if (u in visited) {
      return;
    }
    visited[u] = true;

    var rankNum = g.nodeLabel(u);
    var rank = (ranks[rankNum] = ranks[rankNum] || []);
    rank.push(u);

    dig_util_forEach(g.successors(u), function(v) {
      dfs(v);
    });
  }

  dig_util_forEach(g.nodes(), function(u) {
    if (g.nodeLabel(u) === 0) {
      dfs(u);
    }
  });

  return ranks;
}
