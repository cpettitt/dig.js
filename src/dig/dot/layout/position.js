dig.dot.layout.position = function() {
  var _nodeSep = 50;
  var _nodeWidth = 50;
  var _edgeWidth = 1;
  var _rankSep = 50;

  function nodeSep(newVal) {
    if (arguments.length > 0) {
      _nodeSep = newVal;
      return self;
    } else {
      return _nodeSep;
    }
  }

  function nodeWidth(newVal) {
    if (arguments.length > 0) {
      _nodeWidth = newVal;
      return self;
    } else {
      return _nodeWidth;
    }
  }

  function edgeWidth(newVal) {
    if (arguments.length > 0) {
      _edgeWidth = newVal;
      return self;
    } else {
      return _edgeWidth;
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
    g.nodes().forEach(function(u) {
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
    g.nodes().forEach(function(u) {
      medians[u] = [];
    });

    var prevLayer = null;
    for (var i = 0; i < orderArray.length; ++i) {
      var currLayer = orderArray[i];
      if (prevLayer !== null) {
        for (var j = 0; j < currLayer.length; ++j) {
          var u = currLayer[j];
          var preds = [];
          g.neighbors(u, "both").forEach(function(v) {
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
            medianMap[u].forEach(function(v) {
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
    g.nodes().forEach(function(u) { root[u] = u; });

    var align = {};
    g.nodes().forEach(function(u) { align[u] = u; });

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
    g.nodes().forEach(function(v) { sink[v] = v; });

    var shift = {};
    g.nodes().forEach(function(v) { shift[v] = Number.POSITIVE_INFINITY; });

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

    g.nodes().forEach(function(u) {
      if (alignment.root[u] === u) {
        placeBlock(u);
      }
    });

    g.nodes().forEach(function(u) {
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
    g.nodes().forEach(function(u) {
      var coord = xs[u];
      if (coord > maxCoord) {
        maxCoord = coord;
      }
    });

    for (var i = 0; i < orderArray.length; ++i) {
      var rank = orderArray[i];
      var last = rank[rank.length - 1];
      for (var j = 0; j < rank.length; ++j) {
        var u = rank[j];
        xs[u] = maxCoord - xs[u];
      }
    }
    return xs;
  }

  /*
   * Initializes the graph by ensuring that each node has a numeric width. If
   * no width was assigned to a node, we assign a default value. Dummy nodes
   * are assigned the value edgeWidth.
   */
  function init(g) {
    g.nodes().forEach(function(u) {
      var attrs = g.node(u);
      attrs.y = _rankSep * attrs.rank;
      if (attrs.width) {
        attrs.width = parseInt(attrs.width);
      } else {
        attrs.width = attrs.dummy ? _edgeWidth : _nodeWidth;
      }
    });
  }

  function upperLeft(g) {
    var orderArray = makeOrderArray(g);
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    return pass(g, orderArray, orderMap, medianMap);
  }

  function upperRight(g) {
    var orderArray = makeOrderArray(g);
    var originalOrderArray = orderArray.slice(0);
    flipOrderHoriz(orderArray);
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    return flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap));
  }

  function lowerRight(g) {
    var orderArray = makeOrderArray(g);
    var originalOrderArray = orderArray.slice(0);
    flipOrderHoriz(orderArray);
    flipOrderVert(orderArray);
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    return flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap));
  }

  function lowerLeft(g) {
    var orderArray = makeOrderArray(g);
    flipOrderVert(orderArray);
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    return pass(g, orderArray, orderMap, medianMap);
  }

  function pass(g, orderArray, orderMap, medianMap) {
    var alignment = verticalAlignment(g, orderArray, orderMap, medianMap);
    var compacted = horizontalCompaction(g, orderArray, orderMap, alignment);
    return compacted;
  }

  /*
   * Runs the position algorithm on the given graph with the configuration
   * set in the instance of the position algorithm.
   */
  function graph(g) {
    init(g);

    var xs = [upperLeft(g), upperRight(g), lowerRight(g), lowerLeft(g)];

    g.nodes().forEach(function(u) {
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
    nodeWidth: nodeWidth,
    edgeWidth: edgeWidth,
    rankSep: rankSep,
    init: init,
    upperLeft: upperLeft,
    upperRight: upperRight,
    lowerLeft: lowerLeft,
    lowerRight: lowerRight
  }

  return self;
}
