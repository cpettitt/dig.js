/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
dig.dot.layout = function(inputGraph) {
  var auxGraph = inputGraph.copy();
  dig.dot.alg.acyclic(auxGraph);
  dig.dot.alg.addDummyNodes(auxGraph);
  dig.dot.alg.rank(auxGraph);
  var layers = dig.dot.alg.order(auxGraph);
  dig.dot.alg.position(auxGraph, layers);

  // Update the input graph with the x and y coordinates
  auxGraph.nodes().forEach(function(u) {
    //inputGraph.node(u).x = auxGraph.node(u).x;
    //inputGraph.node(u).y = auxGraph.node(u).y;
  });
}

/*
 * This function modifies the supplied directed graph to make it acyclic by
 * reversing edges that participate in cycles. This algorithm currently uses
 * a basic DFS traversal.
 *
 * This algorithm does not preserve attributes.
 *
 * Post-conditions:
 *
 *  1. Input graph is acyclic
 */
dig.dot.alg.acyclic = function(g) {
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
}

/*
 * Given a graph of nodes with rank attributes, this function returns a new
 * graph where each edge is of unit length. For example, if rank(u) = 2 and
 * rank(v) = 4 and there is an edge (u, v), this function will replace the
 * edge (u, v) with two edges (u, w), (w, v) so that no edge has a length
 * greater than 1. In this example, rank(w) = 1.
 */
dig.dot.alg.addDummyNodes = function(g) {
  var dummyCount = 0;
  dig_util_forEach(g.edges(), function(e) {
    var origU = e.from,
        u = e.from,
        v = e.to,
        rankU = g.node(u).rank + 1,
        rankV = g.node(v).rank;
    g.removeEdge(u, v);
    while (rankU < rankV) {
      var w = "_dummy-" + origU + "-" + v + "-" + dummyCount++;
      g.addNode(w, {rank: rankU, dummy: true});
      g.addEdge(u, w);
      u = w;
      rankU++;
    }
    g.addEdge(u, v);
  });
}

/*
 * Returns an array of layers, with each layer containing an unordered array of
 * nodes.
 *
 * Pre-conditions:
 *
 *  1. Input graph is connected
 *  2. Input graph is acyclic
 */
dig.dot.alg.rank = function(g) {
  return dig.dot.alg.initRank(g);
}

/*
 * Finds a feasible ranking (description below) for the given graph and assigns
 * a rank attribute to each node for that ranking.
 *
 * A feasible ranking is one such that for all edges e, length(e) >=
 * min_length(e). For our purposes min_length(e) is always 1 and length(e)
 * is defined as rank(v) - rank(u) for (u, v) = e.
 *
 * Pre-conditions:
 *
 *  1. Input graph is connected
 *  2. Input graph is acyclic
 */
dig.dot.alg.initRank = function(g) {
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
}

/*
 * Given a graph of nodes with rank attributes, this function returns an array
 * of layers where each layer has nodes ordered to minimize edge crossings.
 */
dig.dot.alg.order = function(g) {
  // TODO make this configurable
  var MAX_ITERATIONS = 24;

  var layers = dig.dot.alg.initOrder(g);
  var best = layers;

  for (var i = 0; i < MAX_ITERATIONS; ++i) {
    layers = dig.dot.alg.graphBarycenterSort(g, i, layers);
    if (dig.dot.alg.graphCrossCount(g, layers) > dig.dot.alg.graphCrossCount(g, best)) {
      best = layers;
    }
  }

  return best;
}

/*
 * Returns an array of layers where each layer has a list of nodes in the given
 * rank. This initial pass attempts to generate a good starting point from
 * which to generate an ordering with minimal edge crossings, but almost
 * certainly some iteration will reduce edge crossing.
 */
dig.dot.alg.initOrder = function(g) {
  // We currently use DFS as described in the graphviz paper.

  var layers = [];
  var visited = {};

  function dfs(u) {
    if (u in visited) {
      return;
    }
    visited[u] = true;

    var rankNum = g.node(u).rank;
    if (!(rankNum in layers)) {
      layers[rankNum] = [];
    }
    layers[rankNum].push(u);

    dig_util_forEach(g.successors(u), function(v) {
      dfs(v);
    });
  }

  dig_util_forEach(g.nodes(), function(u) {
    if (g.node(u).rank === 0) {
      dfs(u);
    }
  });

  return layers;
}

dig.dot.alg.graphBarycenterSort = function(g, i, layers) {
  if (i % 2) {
    for (var j = 1; j < layers.length; ++j) {
      var weights = dig.dot.alg.barycenter(g, layers[j - 1], layers[j]);
      layers[j] = dig.dot.alg.barycenterSort(layers[j], weights);
    }
  } else {
    for (var j = layers.length - 2; j > 0; --j) {
      var weights = dig.dot.alg.barycenter(g, layers[j + 1], layers[j]);
      layers[j] = dig.dot.alg.barycenterSort(layers[j], weights);
    }
  }
  return layers;
}

/*
 * Weights each node by the average position of nodes in the adjacent rank.
 * If a node has no edges to the adjacent rank then it receives the weight -1,
 * which is used to indicate it should not be moved during sorting.
 */
dig.dot.alg.barycenter = function(g, fixed, movable) {
  var fixedPos = dig_dot_alg_nodeOrderMap(g, fixed);
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

/*
 * Sorts the given rank in ascending order using the given weights. The
 * barycenter algorithm sets a nodes weight to -1 if it has no neighbors. For
 * sorting purposes, we treat such nodes as fixed - they are not moved during
 * the sort.
 */
dig.dot.alg.barycenterSort = function(rank, weights) {
  var result = [];

  rank = rank.slice(0);
  
  // Move fixed nodes into the result array first
  for (var i = 0; i < rank.length; ++i) {
    var u = rank[i];
    if (weights[u] === -1) {
      result[i] = u;
      rank[i] = null;
    }
  }

  rank.sort(function(x, y) { return (x ? weights[x] : -1) - (y ? weights[y] : -1); });

  var nextIdx = 0;
  for (var i = 0; i < rank.length; ++i) {
    if (rank[i] !== null) {
      while (result[nextIdx] !== undefined) {
        ++nextIdx;
      }
      result[nextIdx] = rank[i];
    }
  }

  return result;
}

/*
 * Applies the bilayer cross count algorith, to each pair of layers in the graph.
 */
dig.dot.alg.graphCrossCount = function(g, ranks) {
  var cc = 0;
  for (var i = 1; i < ranks.length; ++i) {
    cc += dig.dot.alg.bilayerCrossCount(g, ranks[i-1], ranks[i]);
  }
  return cc;
}

/*
 * This algorithm finds the number of edge crossings between nodes in two
 * layers (called norths and souths here). The algorithm is derived from:
 *
 *    W. Barth et al., Bilayer Cross Counting, JGAA, 8(2) 179–194 (2004)
 */
dig.dot.alg.bilayerCrossCount = function(g, norths, souths) {
  var southPos = dig_dot_alg_nodeOrderMap(g, souths);

  var es = [];
  for (var i = 0; i < norths.length; ++i) {
    var curr = [];
    var u = norths[i];
    dig_util_forEach(g.neighbors(u, "both"), function(v) {
      // v may not be in southPos is the edge is to a layer other than souths
      if (v in southPos) {
        curr.push(southPos[v]);
      }
    });
    es = es.concat(dig_util_radixSort(curr, 1, function(_, x) { return x; }));
  }

  var firstIdx = 1;
  while (firstIdx < souths.length) {
    firstIdx <<= 1;
  }
  var treeSize = 2 * firstIdx - 1;
  firstIdx -= 1;
  var tree = [];
  for (var i = 0; i < treeSize; ++i) {
    tree[i] = 0;
  }

  var crosscount = 0;
  for (var i = 0; i < es.length; ++i) {
    var idx = es[i] + firstIdx;
    tree[idx]++;
    while (idx > 0) {
      if (idx % 2) {
        crosscount += tree[idx + 1];
      }
      idx = (idx - 1) >> 1;
      tree[idx]++;
    }
  }

  return crosscount;
}

/*
 * Given a directed graph and an ordered layering, this function will find the
 * x and y coordinates for each node in the graph and assign them as attributes
 * to the node.
 */
dig.dot.alg.position = function(auxGraph, layers) {
}

/*
 * Finds median predecessors - of which there will be two for an even number of
 * predecessors - and removes all predecessors that are not median predecessors.
 */
dig.dot.alg.removeNonMedians = function(g, layers) {
  var prevLayer = layers[0];
  for (var i = 1; i < layers.length; ++i) {
    var currLayer = layers[i];
    var orderMap = dig_dot_alg_nodeOrderMap(g, prevLayer);
    for (var j = 0; j < currLayer.length; ++j) {
      var v = currLayer[j];
      var preds = g.predecessors(v);
      if (preds.length > 0) {
        preds = dig_util_radixSort(preds, 1, function(_, u) { return orderMap[u]; });
        for (var k = 0, upper = Math.floor((preds.length - 1) / 2); k < upper; ++k) {
          g.removeEdge(preds[k], v);
        }
        for (var k = Math.ceil((preds.length + 1) / 2); k < preds.length; ++k) {
          g.removeEdge(preds[k], v);
        }
      }
    }
    prevLayer = currLayer;
  }
}

/*
 * Helper function that creates a map that contains the order of nodes in a
 * particular layer.
 */
function dig_dot_alg_nodeOrderMap(g, layer) {
  var order = {};
  for (var i = 0; i < layer.length; ++i) {
    order[layer[i]] = i;
  }
  return order;
}

