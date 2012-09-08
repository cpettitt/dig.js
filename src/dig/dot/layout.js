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

  aux.nodes().forEach(function(u) {
    var auxAttrs = aux.node(u);
    if (g.hasNode(u)) {
      g.node(u).x = auxAttrs.x;
      g.node(u).y = auxAttrs.y;
    } else if (auxAttrs.dummy) {
      var edgeAttrs = g.edge(auxAttrs.source, auxAttrs.sink);
      var points = edgeAttrs.points || [];
      points[auxAttrs.dummyIdx] = {x: auxAttrs.x, y: auxAttrs.y};
      edgeAttrs.points = points;
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
  g.edges().forEach(function(e) {
    if (e.from !== e.to) {
      var dummyCount = 0,
          prefix = "_d-" + e.from + "-" + e.to + "-",
          source = e.from,
          sink = e.to,
          rankSource = parseInt(g.node(source).rank),
          rankSink = parseInt(g.node(sink).rank),
          delta = rankSource < rankSink ? 1 : -1;
      var u = source;
      var rankU = rankSource;
      g.removeEdge(u, sink);
      for (rankU += delta; rankU != rankSink; rankU += delta) {
        var v = prefix + dummyCount;
        g.addNode(v, {rank: rankU, dummy: true, dummyIdx: dummyCount, source: source, sink: sink});
        g.addEdge(u, v);
        dummyCount++;
        u = v;
      }
      g.addEdge(u, sink);
    }
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
