/*
 * Shortest path algorithms.
 */
dig.alg.sp = (function() {
  /*
   * This function provides an implementation of the Floyd-Warshall algorithm.
   * It returns a new graph that contains an edge between every node in
   * `graph`. Each edge in the new graph contains the cost of the shortest path
   * from the source node to the target node. If there is no path from a source
   * node to a target node then the edge will contain the value
   * `Number.POSITIVE_INFINITY`.
   *
   * The function always assumes a cost of 0 for an edge that goes from a node
   * back to itself (also known as a self loop). For two distinct nodes
   * connected by an edge, this function assumes a cost of 1 unless an optional
   * edge cost function has been supplied. The edge cost function takes as
   * arguments the source node and the target node of an edge and returns a
   * numeric cost.
   */
  function floydWarshall(graph, edgeCost) {
    var paths = dig.graph();

    edgeCost = edgeCost || function(from, to) {
      return graph.containsEdge(from, to)
          ? 1 
          : Number.POSITIVE_INFINITY;
    }

    graph.nodes().forEach(function(node) {
      paths.addNode(node);
    });
    graph.nodes().forEach(function(from) {
      graph.nodes().forEach(function(to) {
        paths.addEdge(from, to, from === to ? 0 : edgeCost(from, to));
      });
    });

    graph.nodes().forEach(function(intermediate) {
      graph.nodes().forEach(function(from) {
        graph.nodes().forEach(function(to) {
          var prev = paths.getEdge(from, to);
          var alt = paths.getEdge(from, intermediate) + paths.getEdge(intermediate, to);
          if (alt < prev) {
            paths.updateEdge(from, to, alt);
          }
        });
      });
    });
    return paths;
  }

  return {
    floydWarshall: floydWarshall
  };
})();
