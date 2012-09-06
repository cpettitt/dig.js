/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
dig.dot.layout = function(g) {
  var aux = g.copy();
  dig.dot.layout.rank(aux);
  dig.dot.layout.addDummyNodes(aux);
  dig.dot.layout.order(aux);
  dig.dot.layout.position()
    .graph(aux);

  dig_util_forEach(aux.nodes(), function(u) {
    if (g.hasNode(u)) {
      g.node(u).x = aux.node(u).x;
      g.node(u).y = aux.node(u).y;
    }
  });

  return aux;
}

/*
 * This function updates the given graph of ranked nodes to ensure that no
 * edge is longer than unit length. It acheives this by inserting dummy nodes
 * (marked by a dummy attribute) where necessary. For example, if rank(u) = 2
 * and rank(v) = 4 and there is an edge (u, v), this function will replace the
 * edge (u, v) with two edges (u, w), (w, v) so that no edge has a length
 * greater than 1. In this example, rank(w) = 1.
 *
 * This function does not preserve edge labels.
 */
dig.dot.layout.addDummyNodes = function(g) {
  dig_util_forEach(g.edges(), function(e) {
    var dummyCount = 1,
        prefix = "_d-" + e.from + "-" + e.to + "-",
        u = e.from,
        v = e.to,
        rankU = parseInt(g.node(u).rank),
        rankV = parseInt(g.node(v).rank),
        delta = rankU < rankV ? 1 : -1;
    g.removeEdge(u, v);
    for (rankU += delta; rankU != rankV; rankU += delta) {
      var w = prefix + dummyCount++;
      g.addNode(w, {rank: rankU, dummy: true});
      g.addEdge(u, w);
      u = w;
    }
    g.addEdge(u, v);
  });
}

/*
 * Helper function that creates a map that contains the order of nodes in a
 * particular layer.
 */
function dig_dot_layout_orderMap(g, layer) {
  var order = {};
  for (var i = 0; i < layer.length; ++i) {
    order[layer[i]] = i;
  }
  return order;
}
