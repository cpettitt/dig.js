/*
 * Given an undirected graph, find a minimum spanning tree and return it as
 * an undirected graph (an unrooted tree). This function uses Prim's
 * algorithm as described in "Introduction to Algorithms", Third Edition,
 * Comen, et al., Pg 634.
 */
var dig_alg_prim = dig.alg.prim = function(graph, weight) {
  var parents = {};
  var result = new dig.UGraph();
  var q = new dig_data_PriorityQueue();

  if (graph.isDirected()) {
    throw new Error("prim can only be used on undirected graphs");
  }

  if (graph.order() == 0) {
    return result;
  }

  dig_util_forEach(graph.nodes(), function(v) {
    q.add(v, Number.POSITIVE_INFINITY);
    result.addNode(v);
  });

  // Start from an arbitary node
  q.decrease(graph.nodes()[0], 0);

  var u, v, parent;
  while (q.size() > 0) {
    u = q.removeMin();
    if (u in parents) {
      result.addEdge(u, parents[u]);
    }
    dig_util_forEach(graph.neighbors(u), function(v) {
      var pri = q.priority(v);
      if (pri !== undefined) {
        var edgeWeight = weight(u, v);
        if (edgeWeight < pri) {
          parents[v] = u;
          q.decrease(v, edgeWeight);
        }
      }
    });
  }

  return result;
};
