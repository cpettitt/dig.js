/*
 * Shortest path algorithms.
 */
dig.alg.sp = (function() {
  function _initSingleSource(g, s) {
    var sp = dig.graph();
    sp.addNodes(g.nodes());
    g.nodes().forEach(function(v) {
      var edge = {
        cost: v !== s ? Number.POSITIVE_INFINITY : 0,
        predecessor: null
      };
      sp.addEdge(s, v, edge);
    });
    return sp;
  }

  function _relax(graph, s, u, v, cost) {
    var sToV = graph.getEdge(s, v);
    var sToUCost = graph.getEdge(s, u).cost;
    var uToVCost = cost(u, v);

    var altCost = sToUCost + uToVCost;
    if (altCost < sToV.cost) {
      sToV.cost = altCost;
      sToV.predecessor = u;
    }
    return sToV;
  }

  function _defaultEdgeCost(graph) {
    return function(u, v) {
      return graph.containsEdge(u, v) ? 1 : Number.POSITIVE_INFINITY;
    };
  }

  function _keyDistance(graph, source) {
    return function(v) {
      return graph.getEdge(source, v).cost;
    };
  }

  function dijkstra(graph, source, edgeCost) {
    var paths = _initSingleSource(graph, source);

    var queue = dig.data.binaryHeap(_keyDistance(paths, source));
    queue.addAll(paths.nodes());

    var edgeCost = edgeCost || _defaultEdgeCost(graph);
    var wrapperCost = function(u, v) {
      var cost = edgeCost(u, v);
      if (cost < 0) {
        throw new Error("Negative edge cost found: " +
            JSON.stringify(u) + " -> " + JSON.stringify(v) + ". Cost: " + cost);
      }
      return cost;
    }

    while (queue.size() != 0) {
      var u = queue.removeMin();
      graph.successors(u).forEach(function(v) {
        _relax(paths, source, u, v, wrapperCost);
      });
    }
    return paths;
  }

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
    dijkstra: dijkstra,
    floydWarshall: floydWarshall
  };
})();
