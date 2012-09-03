/*
 * This function searches through a ranked and ordered graph and counts the
 * number of edges that cross. This algorithm is derived from:
 *
 *    W. Barth et al., Bilayer Cross Counting, JGAA, 8(2) 179–194 (2004)
 */
dig.dot.layout.crossCount = (function() {
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

  return function(g, ranks) {
    var cc = 0;
    for (var i = 1; i < ranks.length; ++i) {
      cc += dig_dot_layout_bilayerCrossCount(g, ranks[i-1], ranks[i]);
    }
    return cc;
  }
})();
