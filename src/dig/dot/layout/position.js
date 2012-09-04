/*
 * Given a directed graph and an ordered layering, this function will find the
 * x and y coordinates for each node in the graph and assign them as attributes
 * to the node.
 */
dig.dot.layout.position = function(g, layers) {
  // First pass is upper
  var medians = dig.dot.layout.findMedians(g, layers);
  // TODO collapse this into findMedians
  dig.dot.layout.removeType1Conflicts(g, layers, medians);

  var alignment = dig.dot.layout.verticalAlignment(g, layers, medians);
  var xs = dig.dot.layout.horizontalCompaction(g, layers, alignment);

  // TODO multiple passes to find the best combination
  var yd = 100;
  dig_util_forEach(g.nodes(), function(u) {
    g.node(u).x = xs[u];
    g.node(u).y = yd * g.node(u).rank;
  });
}

/*
 * Iterates through the given orering and for each node finds the upper median
 * incident node(s) from the previous layer. In the case of an odd number of
 * incident nodes there will be one median, whereas with an even number of
 * incident nodes there weill be two. This function returns a mapping of each
 * node to its median incident node(s).
 *
 * To find the lower median incident nodes simply call this function with the
 * layers array reversed.
 */
dig.dot.layout.findMedians = function(g, layers) {
  var medians = {};
  dig_util_forEach(g.nodes(), function(u) {
    medians[u] = [];
  });

  var prevLayer = null;
  for (var i = 0; i < layers.length; ++i) {
    var currLayer = layers[i];
    if (prevLayer !== null) {
      var orderMap = dig_dot_layout_orderMap(g, prevLayer);
      for (var j = 0; j < currLayer.length; ++j) {
        var u = currLayer[j];
        var preds = [];
        dig_util_forEach(g.neighbors(u, "both"), function(v) {
          if (v in orderMap) {
            preds.push(v);
          }
        });
        var vs = dig_util_radixSort(preds,
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

  return medians;
}

/*
 * Finds type 1 conflicts and removes them from the median object.
 */
dig.dot.layout.removeType1Conflicts = function(g, layers, medians) {
  var prevLayer = null;
  for (var i = 0; i < layers.length; ++i) {
    var currLayer = layers[i];
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
            for (var j = 0; j < meds.length; ++j) {
              var v = meds[j];
              var pos = prevOrderMap[v];
              if ((pos < prevStart || pos > prevEnd) && !(g.node(u).dummy && g.node(v).dummy)) {
                meds.splice(j, 1);
                --j;
              }
            }
          }
          prevStart = prevEnd;
        }
      }
    }
    prevLayer = currLayer;
  }
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

dig.dot.layout.horizontalCompaction = function(g, layers, alignment) {
  // TODO make d configurable
  var d = 50;

  var sink = {};
  dig_util_forEach(g.nodes(), function(v) { sink[v] = v; });

  var shift = {};
  dig_util_forEach(g.nodes(), function(v) { shift[v] = Number.POSITIVE_INFINITY; });

  var x = {};

  function placeBlock(v) {
    if (!x[v]) {
      x[v] = 0;
      var w = v;
      do
      {
        if (g.node(w).order > 0) {
          var u = alignment.root[layers[g.node(w).rank][g.node(w).order - 1]];
          placeBlock(u);
          if (sink[v] === v) {
            sink[v] = sink[u];
          }
          if (sink[v] !== sink[u]) {
            shift[sink[u]] = Math.min(shift[sink[u]], x[v] - x[u] - d);
          } else {
            x[v] = Math.max(x[v], x[u] + d);
          }
        }
        w = alignment.align[w];
      } while (w !== v);
    }
  }

  dig_util_forEach(g.nodes(), function(u) {
    if (alignment.root[u] === u) {
      placeBlock(u);
    }
  });

  dig_util_forEach(g.nodes(), function(u) {
    x[u] = x[alignment.root[u]];
    var delta = shift[sink[alignment.root[u]]];
    if (delta < Number.POSITIVE_INFINITY) {
      x[u] = x[u] + delta;
    }
  });

  return x;
}
