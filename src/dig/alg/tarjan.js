// Algorithm derived from: 
// http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
var dig_alg_tarjan = dig.alg.tarjan = function(g) {
  var index = 0;
  var stack = new dig.data.Stack();
  var visited = {}; // node -> index + lowlink
  var results = [];

  if (!g.isDirected()) {
    throw new Error("tarjan can only be called for directed graphs");
  }

  function scc(v) {
    var vEntry;

    vEntry = visited[v] = {
      index: index,
      lowlink: index
    };
    index++;
    stack.push(v);

    g.successors(v).forEach(function(w) {
      if (!(w in visited)) {
        scc(w);
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].lowlink);
      } else if (stack.has(w)) {
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].index);
      }
    });

    var component;
    var w;
    if (vEntry.lowlink == vEntry.index) {
      component = [];
      do {
        w = stack.pop();
        component.push(w);
      } while (w !== v);
      results.push(component);
    }
  }

  g.nodes().forEach(function(v) {
    if (!(v in visited)) {
      scc(v);
    }
  });

  return results;
};
