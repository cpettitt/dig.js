/*
 * Graph algorithms
 */

dig.alg = (function() {
  /*
   * DFS
   */
  function dfs(graph, roots, enter, exit) {
    var visited = {};
    var stack = [];

    function innerDfs(node) {
      if (!(node._digId in visited)) {
        visited[node._digId] = true;
        if (enter) { enter(node); }
        graph.successors(node).forEach(function(suc) {
          innerDfs(suc);
        });
        if (exit) { exit(node); }
      }
    }

    roots.forEach(function(root) { innerDfs(root); });
  }

  /*
   * Topological sort
   */
  function topsort(graph) {
    var visited = {};
    var stack = {};
    var results = [];

    function visit(node) {
      if (node._digId in stack) {
        throw new Error("Graph has at least one cycle!");
      }

      if (!(node._digId in visited)) {
        visited[node._digId] = true;
        stack[node._digId] = true;
        graph.predecessors(node).forEach(function(suc) {
          visit(suc); 
        });
        delete stack[node._digId];
        results.push(node);
      }
    }

    graph.nodes().forEach(function(node) {
      visit(node);
    });

    return results;
  }

  /*
   * This function returns a new graph that contains an edge between every
   * node in `graph`. Each edge in the new graph contains the cost of the
   * shortest path from the source node to the destination node.
   *
   * If an edge is labeled with a number, this number is used as the cost
   * for the edge in the original graph. Unlabeled edges between different
   * nodes have a cost of 1. Unlabeled self loops (edges that go from and to
   * the same node) have a cost of 0. Nodes that don't share an edge in the
   * original graph have a cost of `Number.POSITIVE_INFINITY`. If an edge is
   * labeled with anything other than a number, this function will raise an
   * error.
   *
   * The algorithm used is based on the [Floyd-Warshall algorithm][floyd-warshall].
   *
   * [floyd-warshall]: http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
   */
  function shortestPaths(graph) {
    var paths = dig.graph();
    graph.nodes().forEach(function(node) {
      paths.addNode(node);
      paths.addEdge(node, node, 0);
    });
    graph.edges().forEach(function(edge) {
      paths.addEdge(edge.from, edge.to, edge.label ? edge.label : 1);
    });

    function cost(from, to) {
      var edge = paths.getEdge(from, to);
      return edge === undefined ? Number.POSITIVE_INFINITY : edge;
    }

    graph.nodes().forEach(function(intermediate) {
      graph.nodes().forEach(function(from) {
        graph.nodes().forEach(function(to) {
          var prevLabel = cost(from, to);
          var fromIntermediate = cost(from, intermediate);
          var intermediateTo = cost(intermediate, to);

          var newLabel = Math.min(prevLabel, fromIntermediate + intermediateTo);
          if (isNaN(newLabel)) {
            throw new Error("Found an edge with a non-numeric label");
          }

          paths.addOrUpdateEdge(from, to, newLabel);
        });
      });
    });
    return paths;
  }

  return {
    dfs: dfs,
    topsort: topsort,
    shortestPaths: shortestPaths
  };
})();
