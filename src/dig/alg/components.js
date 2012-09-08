/*
 * Returns an array of all connected components in the input graph. Each
 * connected component of an undirected graph includes nodes that are connected
 * to all other nodes in the component by a path.
 *
 * For more information about connected components, see:
 *
 *    http://en.wikipedia.org/wiki/Connected_component_(graph_theory)
 */
var dig_alg_components = dig.alg.components = function(g) {
  var results = [];
  var visited = {};

  if (g.isDirected()) {
    throw new Error("components can only be used on undirected graphs");
  }

  function dfs(v, component) {
    if (!(v in visited)) {
      visited[v] = true;
      component.push(v);
      g.neighbors(v).forEach(function(w) {
        dfs(w, component);
      });
    }
  };

  g.nodes().forEach(function(v) {
    var component = [];
    dfs(v, component);
    if (component.length > 0) {
      results.push(component);
    }
  });

  return results;
};
