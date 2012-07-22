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
    graph = graph.copy();
    var results = [];
    var stack = graph.sources();
    var elem;
    while (stack.length !== 0) {
      elem = stack.pop();
      results.push(elem);
      var sucs = graph.successors(elem);
      graph.removeNode(elem);
      sucs.forEach(function(suc) {
        if (graph.indegree(suc) === 0) {
          stack.push(suc);
        }
      });
    }
    if (graph.nodes().length > 0) {
      throw new Error("Graph has at least one cycle!");
    }
    return results;
  }

  return {
    dfs: dfs,
    topsort: topsort
  };
})();
