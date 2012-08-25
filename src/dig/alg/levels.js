/*
 * Given a graph (directed or undirected) and an initial set of nodes this
 * algorithm will assign level 0 to the initial set of nodes and assign level
 * 1 to nodes reachable from that set, and so on. The returned object maps the
 * node ids to their level.
 *
 * It is possible that some nodes will not be visited if the graph is not
 * connected.
 */
var dig_alg_levels = dig.alg.levels = function(g, roots) {
  var queue = new dig_data_Queue();
  var levels = {};

  if (roots.length === undefined) {
    roots = [roots];
  }

  function levelAndQueue(u, level) {
    queue.enqueue(u);
    levels[u] = level;
  }

  dig_util_forEach(roots, function(u) {
    levelAndQueue(u, 0);
  });

  var curr, u;
  while (queue.size() !== 0) {
    u = queue.dequeue();
    dig_util_forEach(g.neighbors(u), function(v) {
      if (!(v in levels)) {
        levelAndQueue(v, levels[u] + 1);
      }
    });
  }

  return levels;
}
