/*
 * Given a (possible cyclic) directed graph with ranked nodes, this function
 * will attempt to find an ordering of nodes in each rank that minimizes
 * overall edge crossings in the graph.
 *
 * Ordering will be returned as an array of ranks with each rank containing
 * an array of ordered nodes for the rank. This function will also set an
 * `order` attribute on each node in the graph.
 */
dig.dot.layout.order = (function() {
  /*
   * Returns an array of ranks where each rank has an array of nodes in the given
   * rank. This initial pass attempts to generate a good starting point from
   * which to generate an ordering with minimal edge crossings, but almost
   * certainly some iteration will reduce edge crossing.
   */
  function init(g) {
    // We currently use DFS as described in the graphviz paper.
    var ordering = [];
    var visited = {};

    function dfs(u) {
      if (u in visited) {
        return;
      }
      visited[u] = true;

      var rankNum = g.node(u).rank;
      if (!(rankNum in ordering)) {
        ordering[rankNum] = [];
      }
      ordering[rankNum].push(u);

      dig_util_forEach(g.successors(u), function(v) {
        dfs(v);
      });
    }

    dig_util_forEach(g.nodes(), function(u) {
      if (g.node(u).rank === 0) {
        dfs(u);
      }
    });

    return ordering;
  }

  function improveOrdering(g, i, ordering) {
    if (i % 2) {
      for (var j = 1; j < ordering.length; ++j) {
        ordering[j] = improveRankOrdering(g, ordering[j - 1], ordering[j]);
      }
    } else {
      for (var j = ordering.length - 2; j >= 0; --j) {
        ordering[j] = improveRankOrdering(g, ordering[j + 1], ordering[j]);
      }
    }
    return ordering;
  }

  /*
   * Given a fixed layer and a movable layer in a graph this function will
   * attempt to find an improved ordering for the movable layer such that
   * edge crossings may be reduced.
   *
   * This algorithm is based on the barycenter method.
   */
  function improveRankOrdering(g, fixed, movable) {
    var weights = rankWeights(g, fixed, movable);

    var result = [];

    var layer = movable.slice(0);
    
    // Move fixed nodes into the result array first
    for (var i = 0; i < layer.length; ++i) {
      var u = layer[i];
      if (weights[u] === -1) {
        result[i] = u;
        layer[i] = null;
      }
    }

    layer.sort(function(x, y) { return (x ? weights[x] : -1) - (y ? weights[y] : -1); });

    var nextIdx = 0;
    for (var i = 0; i < layer.length; ++i) {
      if (layer[i] !== null) {
        while (result[nextIdx] !== undefined) {
          ++nextIdx;
        }
        result[nextIdx] = layer[i];
      }
    }

    return result;
  }

  /*
   * Given a fixed layer and a movable layer in a graph, this function will
   * return weights for the movable layer that can be used to reorder the layer
   * for potentially reduced edge crossings.
   */
  function rankWeights(g, fixed, movable) {
    var fixedPos = dig_dot_layout_orderMap(g, fixed);
    var weights = {};
    for (var i = 0; i < movable.length; ++i) {
      var weight = -1;
      var u = movable[i];
      var sucs = g.neighbors(movable[i], "both");
      if (sucs.length > 0) {
        weight = 0;
        dig_util_forEach(sucs, function(v) {
          // Only calculate the weight if the node is in the fixed rank
          if (v in fixedPos) {
            weight = fixedPos[v];
          }
        });
        weight = weight / sucs.length;
      }
      weights[u] = weight;
    }
    return weights;
  }

  return function(g) {
    // TODO make this configurable
    var MAX_ITERATIONS = 24;

    var ordering = init(g);
    var bestOrdering = ordering;
    var bestCC = dig.dot.layout.crossCount(g, ordering);

    for (var i = 0; i < MAX_ITERATIONS; ++i) {
      ordering = improveOrdering(g, i, ordering);
      var cc = dig.dot.layout.crossCount(g, ordering);
      if (cc > bestCC) {
        bestOrdering = ordering;
        bestCC = cc;
      }
    }

    // Add order to node
    for (var i = 0; i < bestOrdering.length; ++i) {
      for (var j = 0; j < bestOrdering[i].length; ++j) {
        g.node(bestOrdering[i][j]).order = j;
      }
    }

    return bestOrdering;
  }
})();
