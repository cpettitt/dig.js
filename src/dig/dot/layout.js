/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
dig.dot.layout = function(inputGraph) {
  dig.dot.layout.rank(inputGraph);
  var aux = inputGraph.copy();
  dig.dot.layout.addDummyNodes(aux);
  var layers = dig.dot.layout.order(aux);
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
 * Applies the bilayer cross count algorith, to each pair of layers in the graph.
 */
dig.dot.layout.crossCount = function(g, ranks) {
  var cc = 0;
  for (var i = 1; i < ranks.length; ++i) {
    cc += dig_dot_layout_bilayerCrossCount(g, ranks[i-1], ranks[i]);
  }
  return cc;
}

/*
 * This algorithm finds the number of edge crossings between nodes in two
 * layers (called norths and souths here). The algorithm is derived from:
 *
 *    W. Barth et al., Bilayer Cross Counting, JGAA, 8(2) 179–194 (2004)
 */
dig_dot_layout_bilayerCrossCount = function(g, norths, souths) {
  var southPos = dig_dot_layout_orderMap(g, souths);

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
      var orderMap = dig_dot_layout_orderMap(g, prevLayer);
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
      var prevOrderMap = dig_dot_layout_orderMap(g, prevLayer);
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
    var prevLayerOrder = dig_dot_layout_orderMap(g, prevLayer);
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
function dig_dot_layout_orderMap(g, layer) {
  var order = {};
  for (var i = 0; i < layer.length; ++i) {
    order[layer[i]] = i;
  }
  return order;
}

