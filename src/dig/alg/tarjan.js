// Algorithm derived from: 
// http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
dig.alg.tarjan = function(graph) {
  var index = 0;
  var stack = [];
  var onStack = {}; // constant time test for an element on the stack
  var visited = {}; // node -> index + lowlink
  var results = [];

  function scc(v) {
    var vEntry;

    vEntry = visited[v] = {
      index: index,
      lowlink: index
    };
    index++;
    stack.push(v);
    onStack[v] = true;

    dig_util_forEach(graph.successors(v), function(w) {
      if (!(w in visited)) {
        scc(w);
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].lowlink);
      } else if (onStack[w]) {
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].index);
      }
    });

    var component;
    var w;
    if (vEntry.lowlink == vEntry.index) {
      component = [];
      do {
        w = stack.pop();
        delete onStack[w];
        component.push(w);
      } while (w !== v);
      results.push(component);
    }
  }

  dig_util_forEach(graph.nodes(), function(v) {
    if (!(v in visited)) {
      scc(v); 
    }
  });

  return results;
};
