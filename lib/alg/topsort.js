/*
 * Topological sort algorithm
 */
dig.alg.topsort = (function() {
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

  return topsort;
})();
