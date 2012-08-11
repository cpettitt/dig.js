var dig_alg_topsort = dig.alg.topsort = function(graph) {
  var visited = {};
  var stack = {};
  var results = [];

  if (!graph.isDirected()) {
    throw new Error("topsort can only be called for directed graphs");
  }

  function visit(node) {
    if (node in stack) {
      throw new Error("graph has at least one cycle!");
    }

    if (!(node in visited)) {
      stack[node] = true;
      visited[node] = true;
      dig_util_forEach(graph.predecessors(node), function(pred) {
        visit(pred);
      });
      delete stack[node];
      results.push(node);
    }
  }

  var sinks = graph.sinks();
  if (graph.order() != 0 && sinks.length == 0) {
    throw new Error("graph has at least one cycle!");
  }

  dig_util_forEach(graph.sinks(), function(sink) {
    visit(sink);
  });

  return results;
}
