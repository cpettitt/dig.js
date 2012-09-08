/*
 * This algorithm returns the solution for the all-pairs shortest path problem.
 * It returns a matrix `mat[u][v]` with elements
 * `{ distance: d, predecessor: p }` such that `d` is the shortest weighted
 * distance from `u` to `v` and `[u .. p, v]` is the shortest path to `v`.
 * 
 * This algorithm takes O(|V|^3) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
var dig_alg_floydWarshall = dig.alg.floydWarshall = function(g) {
  var results = {};
  var nodes = g.nodes();
  var altDistance;
  var rowI, rowK;
  var ik, kj, ij;
  var maxDist = Number.POSITIVE_INFINITY;

  nodes.forEach(function(i) {
    rowI = results[i] = {};
    nodes.forEach(function(j) {
      if (i == j) {
        rowI[j] = { distance: 0, predecessor: null };  
      } else if (g.hasEdge(i, j)) {
        rowI[j] = { distance: 1, predecessor: i };
      } else {
        rowI[j] = { distance: maxDist, predecessor: null };
      }
    });
  });

  nodes.forEach(function(k) {
    rowK = results[k];
    nodes.forEach(function(i) {
      rowI = results[i];
      nodes.forEach(function(j) {
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
