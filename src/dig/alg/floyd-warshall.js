/*
 * Floyd Warshall algorithm derived from Wikipedia:
 * http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
dig.alg.floydWarshall = function(graph) {
  var results = {};
  var nodes = graph.nodes();
  var altDistance;
  var rowI, rowK;
  var ik, kj, ij;
  var maxDist = Number.POSITIVE_INFINITY;

  dig_util_forEach(nodes, function(i) {
    rowI = results[i] = {};
    dig_util_forEach(nodes, function(j) {
      if (i == j) {
        rowI[j] = { distance: 0, predecessor: null };  
      } else if (graph.hasEdge(i, j)) {
        rowI[j] = { distance: 1, predecessor: i };
      } else {
        rowI[j] = { distance: maxDist, predecessor: null };
      }
    });
  });

  dig_util_forEach(nodes, function(k) {
    rowK = results[k];
    dig_util_forEach(nodes, function(i) {
      rowI = results[i];
      dig_util_forEach(nodes, function(j) {
        ik = rowI[k];
        kj = rowK[j];
        ij = rowI[j];
        altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}
