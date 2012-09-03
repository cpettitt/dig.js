/*
 * Given a directed graph and an ordered layering, this function will find the
 * x and y coordinates for each node in the graph and assign them as attributes
 * to the node.
 */
dig.dot.layout.position = function(auxGraph, layers) {
}

/*
 * Iterates through the given layers and finds for each node finds the median
 * incident node(s) from the previous layer. In the case of an odd number of
 * incident nodes there will be one median, whereas with an even number of
 * incident nodes there weill be two. This function returns a mapping of each
 * node to its median incident node(s).
 */
dig.dot.layout.findMedians = function(g, layers, layerTraversal) {
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

dig.dot.layout.top = {
  iterate: function(layers, func) {
    for (var i = 0; i < layers.length; ++i) {
      func(layers[i]);
    }
  },

  neighbors: function(g, u) {
    return g.predecessors(u);
  }
}

dig.dot.layout.bottom = {
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
dig.dot.layout.removeType1Conflicts = function(g, medians, layers, layerTraversal) {
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
dig.dot.layout.verticalAlignment = function(g, layers, medians) {
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
