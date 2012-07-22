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
   * Given a graph that has edges labeled with path length, this function
   * returns a new graph where every node is connected and edges are labelled
   * by the distance between the incident nodes.
   *
   * The algorithm used is based on floyd-warshall's algorithm
   * (http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm).
   */
  function shortestPaths(graph) {
    var paths = graph.copy();
    graph.nodes().forEach(function(node) {
      paths.addEdge(node, node, 0);
    });

    graph.nodes().forEach(function(intermediate) {
      graph.nodes().forEach(function(from) {
        graph.nodes().forEach(function(to) {
          var prevLabel = paths.containsEdge(from, to) ? paths.edgeLabel(from, to) : Number.POSITIVE_INFINITY;
          var fromIntermediate = paths.containsEdge(from, intermediate) ? paths.edgeLabel(from, intermediate) : Number.POSITIVE_INFINITY;
          var intermediateTo = paths.containsEdge(intermediate, to) ? paths.edgeLabel(intermediate, to) : Number.POSITIVE_INFINITY;

          var newLabel = Math.min(prevLabel, fromIntermediate + intermediateTo);
          if (Number.isNaN(newLabel)) {
            throw new Error("Found an edge with a non-numeric label");
          }

          if (paths.containsEdge(from, to)) {
            paths.edgeLabel(from, to, newLabel);
          } else {
            paths.addEdge(from, to, newLabel);
          }
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
