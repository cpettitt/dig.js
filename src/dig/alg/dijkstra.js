/*
 * This algorithm returns the solution for the single-source shortest path
 * problem. It returns a map of `map[v] = { distance: d, prececessor: p }` 
 * such that `d` is the shortest weighted distance from `u` to `v`
 * and `[u .. p, v]` is the shortest path from `u` to `v`.
 * 
 * This algorithm takes O(|E|+|V|)*log(|V|) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 */
var dig_alg_dijkstra = dig.alg.dijkstra = function(g, source) {
  var results = {};
  var q = new dig_data_PriorityQueue();
  var maxDist = Number.POSITIVE_INFINITY;
  var nodeU;
  var u, v;
  var altDist;

  g.nodes().forEach(function(node) {
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

    g.neighbors(nodeU).forEach(function(nodeV) {
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

/*
 * This algorithm returns the solution for the all-pairs shortest path problem.
 * It returns a matrix `mat[u][v]` with elements
 * `{ distance: d, predecessor: p }` such that `d` is the shortest weighted
 * distance from `u` to `v` and `[u .. p, v]` is the shortest path to `v`.
 * 
 * This algorithm takes O(|V|*(|E|+|V|)*log(|V|)) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 */
var dig_alg_dijkstraAll = dig.alg.dijkstraAll = function(g) {
  var results = {};
  g.nodes().forEach(function(node) {
    results[node] = dig_alg_dijkstra(g, node);
  });
  return results;
};
