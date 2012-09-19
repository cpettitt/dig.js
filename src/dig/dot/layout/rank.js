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
      g.successors(u).forEach(function(v) {
        if (v in onStack) {
          g.addEdge(v, u);
          g.removeEdge(u, v);
        } else {
          dfs(v);
        }
      });
      delete onStack[u];
    }

    g.nodes().forEach(function(u) {
      dfs(u);
    });
  }

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
  function initRank(g) {
    var pq = new dig_data_PriorityQueue();
    g.nodes().forEach(function(u) {
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

      current.forEach(function(u) {
        g.successors(u).forEach(function(v) {
          pq.decrease(v, pq.priority(v) - 1);
        });
      });

      current = [];
      rankNum++;
    }
  }

  function feasibleTree(g) {
    // We treat minLength as a constant for now
    var minLength = 1;
    var tree = dig.alg.prim(g, function(u, v) {
      return Math.abs(g.node(u).rank - g.node(v).rank) - minLength;
    });

    // assign ranks based on the tree structure
    var visited = {};
    function dfs(u, rank) {
      visited[u] = true;
      tree.node(u).rank = rank;

      tree.neighbors(u).forEach(function(v) {
        if (!(v in visited)) {
          dfs(v, rank + (g.hasEdge(u, v) ? minLength : -minLength));
        }
      });
    }

    // seed dfs
    dfs(tree.nodes()[0], 0);

    return tree;
  }

  function normalize(g) {
    var min = Math.min.apply(null, g.nodes().map(function(u) { return g.node(u).rank; }));
    g.nodes().forEach(function(u) {
      g.node(u).rank -= min;
    });
  }

  return function(g) { 
    if (!g.isDirected()) {
      throw new Error("Input graph must be directed!");
    }

    dig.alg.components(g).forEach(function(cmpt) {
      var subgraph = g.subgraph(cmpt);
      makeAcyclic(subgraph);
      initRank(subgraph);
      var tree = feasibleTree(subgraph);
      normalize(tree);
      tree.nodes().forEach(function(u) {
        g.node(u).rank = tree.node(u).rank;
      });
    });
  }
})();
