dig.dot.layout.position = function() {
  var _nodeSep = 50;
  var _rankSep = 50;

  function nodeSep(newVal) {
    if (arguments.length > 0) {
      _nodeSep = newVal;
      return self;
    } else {
      return _nodeSep;
    }
  }

  function rankSep(newVal) {
    if (arguments.length > 0) {
      _rankSep = newVal;
      return self;
    } else {
      return _rankSep;
    }
  }

  function makeOrderArray(g) {
    var ordering = [];
    dig_util_forEach(g.nodes(), function(u) {
      var attrs = g.node(u);
      var rank = ordering[attrs.rank];
      if (rank === undefined) {
        rank = ordering[attrs.rank] = [];
      }
      rank[attrs.order] = u;
    });
    return ordering;
  }

  function makeOrderMap(ordering) {
    var map = {};
    for (var i = 0; i < ordering.length; ++i) {
      for (var j = 0; j < ordering[i].length; ++j) {
        map[ordering[i][j]] = {
          rank: i,
          order: j
        };
      }
    }
    return map;
  }

  function makeMedianMap(g, orderArray, orderMap) {
    var medianMap = findMedians(g, orderArray, orderMap);
    filterMedianConflicts(g, orderArray, orderMap, medianMap);
    return medianMap;
  }

  function findMedians(g, orderArray, orderMap) {
    var medians = {};
    dig_util_forEach(g.nodes(), function(u) {
      medians[u] = [];
    });

    var prevLayer = null;
    for (var i = 0; i < orderArray.length; ++i) {
      var currLayer = orderArray[i];
      if (prevLayer !== null) {
        for (var j = 0; j < currLayer.length; ++j) {
          var u = currLayer[j];
          var preds = [];
          dig_util_forEach(g.neighbors(u, "both"), function(v) {
            if (orderMap[v].rank === i - 1) {
              preds.push(v);
            }
          });
          var vs = dig_util_radixSort(preds,
                                      1,
                                      function(_, x) { return orderMap[x].order; });
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

  function filterMedianConflicts(g, orderArray, orderMap, medianMap) {
    var prevLayer = null;
    for (var i = 0; i < orderArray.length; ++i) {
      var currLayer = orderArray[i];
      if (prevLayer !== null) {
        var prevStart = 0;
        var prevEnd;
        var currStart = 0;
        for (var currPos = 0; currPos < currLayer.length; ++currPos) {
          var u = currLayer[currPos];
          var inner = null;
          if (g.node(u).dummy) {
            dig_util_forEach(medianMap[u], function(v) {
              if (g.node(v).dummy) {
                inner = v;
              }
            });
          }
          if (currPos + 1 === currLayer.length || inner !== null) {
            prevEnd = prevLayer.length - 1;
            if (inner !== null) {
              prevEnd = orderMap[inner];
            }
            for (; currStart <= currPos; ++currStart) {
              u = currLayer[currStart];
              var meds = medianMap[u];
              for (var j = 0; j < meds.length; ++j) {
                var v = meds[j];
                var pos = orderMap[v].order;
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

  function verticalAlignment(g, orderArray, orderMap, medianMap) {
    var root = {};
    dig_util_forEach(g.nodes(), function(u) { root[u] = u; });

    var align = {};
    dig_util_forEach(g.nodes(), function(u) { align[u] = u; });

    for (var i = 1; i < orderArray.length; ++i) {
      var r = -1;
      var prevLayer = orderArray[i - 1];
      var currLayer = orderArray[i];
      for (var j = 0; j < currLayer.length; ++j) {
        var v = currLayer[j];
        for (var k = 0; k < medianMap[v].length; ++k) {
          var u = medianMap[v][k];
          var uPos = orderMap[u].order;
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

  function horizontalCompaction(g, orderArray, orderMap, alignment) {
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
          if (orderMap[w].order > 0) {
            var pred = orderArray[orderMap[w].rank][orderMap[w].order - 1];
            var u = alignment.root[pred];
            placeBlock(u);
            if (sink[v] === v) {
              sink[v] = sink[u];
            }
            if (sink[v] !== sink[u]) {
              shift[sink[u]] = Math.min(shift[sink[u]], x[v] - x[u] - g.node(u).width - _nodeSep);
            } else {
              x[v] = Math.max(x[v], x[u] + g.node(u).width + _nodeSep);
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

  function flipOrderHoriz(ordering) {
    for (var i = 0; i < ordering.length; ++i) {
      ordering[i].reverse();
    }
  }

  function flipOrderVert(ordering) {
    ordering.reverse();
  }

  function flipPosition(g, orderArray, xs) {
    var maxCoord = Number.NEGATIVE_INFINITY;
    dig_util_forEach(g.nodes(), function(u) {
      var coord = xs[u] + g.node(u).width;
      if (coord > maxCoord) {
        maxCoord = coord;
      }
    });

    for (var i = 0; i < orderArray.length; ++i) {
      var rank = orderArray[i];
      var last = rank[rank.length - 1];
      for (var j = 0; j < rank.length; ++j) {
        var u = rank[j];
        xs[u] = maxCoord - xs[u] - g.node(u).width;
      }
    }
    return xs;
  }

  function flipMedians(medianMap) {
    for (var k in medianMap) {
      medianMap[k].reverse();
    }
  }

  function pass(g, orderArray, orderMap, medianMap) {
    var alignment = verticalAlignment(g, orderArray, orderMap, medianMap);
    return horizontalCompaction(g, orderArray, orderMap, alignment);
  }

  /*
   * Runs the position algorithm on the given graph with the configuration
   * set in the instance of the position algorithm.
   */
  function graph(g) {
    dig_util_forEach(g.nodes(), function(u) {
      g.node(u).y = _rankSep * g.node(u).rank;
      if (!("width" in g.node(u))) {
        g.node(u).width = g.node(u).dummy ? 1 : 50;
      }
    });

    var orderArray = makeOrderArray(g);
    var originalOrderArray = orderArray.slice(0);
    var xs = [];

    // Upper Left
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    xs.push(pass(g, orderArray, orderMap, medianMap));

    // Upper Right
    flipOrderHoriz(orderArray);
    orderMap = makeOrderMap(orderArray);
    flipMedians(medianMap);
    xs.push(flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap)));
    
    // Lower Right
    flipOrderVert(orderArray);
    orderMap = makeOrderMap(orderArray);
    medianMap = makeMedianMap(g, orderArray, orderMap);
    xs.push(flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap)));

    // Lower Left
    flipOrderHoriz(orderArray);
    orderMap = makeOrderMap(orderArray);
    flipMedians(medianMap);
    xs.push(pass(g, orderArray, orderMap, medianMap));

    dig_util_forEach(g.nodes(), function(u) {
      var xArray = [];
      for (var i = 0; i < xs.length; ++i) {
        xArray.push(xs[i][u]);
      }
      xArray.sort();
      g.node(u).x = (xArray[1] + xArray[2]) / 2;
    });
  }

  var self = {
    graph: graph,
    nodeSep: nodeSep,
    rankSep: rankSep
  }

  return self;
}
