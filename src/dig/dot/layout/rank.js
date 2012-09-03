/*
 * This function takes a (possibly cyclic) directed graph as input and finds a
 * ranking for the nodes that satisfies all constraints. A ranking is used to
 * determine which nodes will be in the same layer.
 *
 * When this function completes each node `u` will have a `rank` attribute,
 * that can be retrieved using `g.node(u).rank`. Ranks start at 0.
 */
dig.dot.layout.rank = (function() {
  /*
   * This function modifies the supplied directed graph to make it acyclic by
   * reversing edges that participate in cycles. This algorithm currently uses
   * a basic DFS traversal.
   *
   * This algorithm does not preserve attributes.
   */
  function makeAcyclic(g) {
    var onStack = {};
    var visited = {};

    function dfs(u) {
      if (u in visited) {
        return;
      }
      visited[u] = true;
      onStack[u] = true;
      dig_util_forEach(g.successors(u), function(v) {
        if (v in onStack) {
          if (!g.hasEdge(v, u)) {
            g.addEdge(v, u);
          }
          g.removeEdge(u, v);
        } else {
          dfs(v);
        }
      });
      delete onStack[u];
    }

    dig_util_forEach(g.nodes(), function(u) {
      dfs(u);
    });
  };

  /*
   * Finds a feasible ranking (description below) for the given graph and assigns
   * a rank attribute to each node for that ranking.
   *
   * A feasible ranking is one such that for all edges e, length(e) >=
   * min_length(e). For our purposes min_length(e) is always 1 and length(e)
   * is defined as rank(v) - rank(u) for (u, v) = e.
   *
   * It is possible to improve the result of this function using either exact or
   * iterative heuristic methods.
   */
  function init(g) {
    var pq = new dig_data_PriorityQueue();
    dig_util_forEach(g.nodes(), function(u) {
      pq.add(u, g.indegree(u));
    });

    var current = [];
    var rankNum = 0;
    while (pq.size() > 0) {
      for (var min = pq.min(); pq.priority(min) === 0; min = pq.min()) {
        pq.removeMin();
        g.node(min).rank = rankNum;
        current.push(min);
      }

      if (current.length === 0) {
        throw new Error("Input graph is not acyclic!");
      }

      dig_util_forEach(current, function(u) {
        dig_util_forEach(g.successors(u), function(v) {
          pq.decrease(v, pq.priority(v) - 1);
        });
      });

      current = [];
      rankNum++;
    }
  };

  return function(g) { 
    if (!g.isDirected()) {
      throw new Error("Input graph must be directed!");
    }

    var aux = g.copy();
    makeAcyclic(aux);
    init(aux);
    dig_util_forEach(aux.nodes(), function(u) {
      g.node(u).rank = aux.node(u).rank;
    });
  }
})();
