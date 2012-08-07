/*
 * Implementation derived from wikipedia: http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 */
var dig_alg_dijkstra = dig.alg.dijkstra = function(graph, source) {
  var results = {};
  var q = new dig_data_PriorityQueue();
  var maxDist = Number.POSITIVE_INFINITY;
  var nodeU;
  var u, v;
  var altDist;

  dig_util_forEach(graph.nodes(), function(node) {
    var distance = node == source ? 0 : maxDist;
    results[node] = { distance: distance, predecessor: null };
    q.add(node, distance);
  });

  while (q.size() > 0) {
    nodeU = q.removeMin();
    u = results[nodeU];
    if (u.distance === maxDist) {
      break;
    } 

    dig_util_forEach(graph.successors(nodeU), function(nodeV) {
      v = results[nodeV];
      // TODO: support weighted edges
      altDist = u.distance + 1;
      if (altDist < v.distance) {
        v.distance = altDist;
        v.predecessor = nodeU;
        q.decrease(nodeV, v.distance);
      }
    });
  }

  return results;
};
