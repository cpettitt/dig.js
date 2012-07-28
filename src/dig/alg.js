/*
 * General graph algorithms.
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

  function labelEdgeCost(graph) {
    return function(u, v) {
      var edge = graph.getEdge(u, v);
      return edge !== undefined ? edge : Number.POSITIVE_INFINITY;
    };
  }

  return {
    dfs: dfs,
    topsort: topsort,
    labelEdgeCost: labelEdgeCost
  };
})();
