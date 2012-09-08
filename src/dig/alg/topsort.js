var dig_alg_topsort = dig.alg.topsort = function(g) {
  var visited = {};
  var stack = {};
  var results = [];

  if (!g.isDirected()) {
    throw new Error("topsort can only be called for directed graphs");
  }

  function visit(node) {
    if (node in stack) {
      throw new Error("graph has at least one cycle!");
    }

    if (!(node in visited)) {
      stack[node] = true;
      visited[node] = true;
      g.predecessors(node).forEach(function(pred) {
        visit(pred);
      });
      delete stack[node];
      results.push(node);
    }
  }

  var sinks = g.sinks();
  if (g.order() != 0 && sinks.length == 0) {
    throw new Error("graph has at least one cycle!");
  }

  g.sinks().forEach(function(sink) {
    visit(sink);
  });

  return results;
}
