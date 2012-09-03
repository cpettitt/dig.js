/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
dig.dot.layout = function(inputGraph) {
  dig.dot.layout.rank(inputGraph);
  var aux = inputGraph.copy();
  dig.dot.layout.addDummyNodes(aux);
  var layers = dig.dot.alg.order(aux);
  dig.dot.alg.position(aux, layers);
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
 * Iterates through the given layers and finds for each node finds the median
 * incident node(s) from the previous layer. In the case of an odd number of
 * incident nodes there will be one median, whereas with an even number of
 * incident nodes there weill be two. This function returns a mapping of each
 * node to its median incident node(s).
 */
dig.dot.alg.findMedians = function(g, layers, layerTraversal) {
  var medians = {};
  dig_util_forEach(g.nodes(), function(u) {
    medians[u] = [];
  });

  var prevLayer = null;
  function layerIter(currLayer) {
    if (prevLayer !== null) {
      var orderMap = dig_dot_alg_nodeOrderMap(g, prevLayer);
      // direction in the layer doesn't matter for this function
      for (var i = 0; i < currLayer.length; ++i) {
        var u = currLayer[i];
        var vs = dig_util_radixSort(layerTraversal.neighbors(g, u),
                                    1,
                                    function(_, x) { return orderMap[x]; });
        if (vs.length > 0) {
          var mid = (vs.length - 1) / 2;
          medians[u] = vs.slice(Math.floor(mid), Math.ceil(mid) + 1);
        }
      }
    }
    prevLayer = currLayer;
  }

  layerTraversal.iterate(layers, layerIter);
  return medians;
}

dig.dot.alg.top = {
  iterate: function(layers, func) {
    for (var i = 0; i < layers.length; ++i) {
      func(layers[i]);
    }
  },

  neighbors: function(g, u) {
    return g.predecessors(u);
  }
}

dig.dot.alg.bottom = {
  iterate: function(layers, func) {
    for (var i = layers.length - 1; i >= 0; --i) {
      func(layers[i]);
    }
  },

  neighbors: function(g, u) {
    return g.successors(u);
  }
}

/*
 * Finds type 1 conflicts and removes them from the median object.
 */
dig.dot.alg.removeType1Conflicts = function(g, medians, layers, layerTraversal) {
  var prevLayer = null;
  function layerIter(currLayer) {
    if (prevLayer !== null) {
      var prevStart = 0;
      var prevEnd;
      var currStart = 0;
      var prevOrderMap = dig_dot_alg_nodeOrderMap(g, prevLayer);
      for (var currPos = 0; currPos < currLayer.length; ++currPos) {
        var u = currLayer[currPos];
        var inner = null;
        if (g.node(u).dummy) {
          dig_util_forEach(medians[u], function(v) {
            if (g.node(v).dummy) {
              inner = v;
            }
          });
        }
        if (currPos + 1 === currLayer.length || inner !== null) {
          prevEnd = currLayer.length - 1;
          if (inner !== null) {
            prevEnd = prevOrderMap[inner];
          }
          for (; currStart <= currPos; ++currStart) {
            u = currLayer[currStart];
            var meds = medians[u];
            for (var i = 0; i < meds.length; ++i) {
              var v = meds[i];
              var pos = prevOrderMap[v];
              if ((pos < prevStart || pos > prevEnd) && !(g.node(u).dummy && g.node(v).dummy)) {
                meds.splice(i, 1);
                --i;
              }
            }
          }
          prevStart = prevEnd;
        }
      }
    }
    prevLayer = currLayer;
  }
  layerTraversal.iterate(layers, layerIter);
}

/*
 * Generates an alignment given the medians and layering of a graph. This
 * function returns the blocks of the alignment (maximal set of vertically
 * aligned nodes) and the roots of the alignment (topmost vertex of a block).
 */
dig.dot.alg.verticalAlignment = function(g, layers, medians) {
  var root = {};
  dig_util_forEach(g.nodes(), function(u) { root[u] = u; });

  var align = {};
  dig_util_forEach(g.nodes(), function(u) { align[u] = u; });

  for (var i = 1; i < layers.length; ++i) {
    var r = -1;
    var prevLayer = layers[i - 1];
    var prevLayerOrder = dig_dot_alg_nodeOrderMap(g, prevLayer);
    var currLayer = layers[i];
    for (var j = 0; j < currLayer.length; ++j) {
      var v = currLayer[j];
      var meds = medians[v];
      for (var k = 0; k < meds.length; ++k) {
        var u = meds[k];
        var uPos = prevLayerOrder[u];
        if (align[v] == v && r < uPos) {
          align[u] = v;
          align[v] = root[v] = root[u];
          r = uPos;
        }
      }
    }
  }
  return {
    root: root,
    align: align
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

