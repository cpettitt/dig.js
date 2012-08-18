require("../../test-env");

var graphs = require("../../test-graphs");

function removeEntry(result, i, j) {
  var entry = result[i][j];
  delete result[i][j];
  var empty = true;
  for (var k in result[i]) {
    if (result[i].hasOwnProperty(k)) {
      empty = false;
      break;
    }
  }
  if (empty) {
    delete result[i];
  }
  return entry;
}

// Helper function for checking results. Removes the entry at result[i][j] and
// checks that it matches the supplied `distance` and `predecessor`.
//
// If `predecessor` is not supplied its value is assumed to be null (indicating
// no predecessor). If `predecessor` is a list then the actual predecessor must
// match one of the elements in the list.
//
// If `distance` is not supplied its value is assumed to be
// `Number.POSITIVE_INFINITY` indicating there is no path from `i` to `j`.
function expect(result, i, j, distance, predecessor) {
  if (arguments.length < 5) {
    predecessor = null;
    if (arguments.length < 4) {
      distance = Number.POSITIVE_INFINITY;
    }
  }
  var entry = removeEntry(result, i, j);
  assert.equal(distance, entry.distance);
  if (predecessor && predecessor.length) {
    assert.memberOf(predecessor, parseInt(entry.predecessor));
  } else {
    assert.equal(predecessor, entry.predecessor);
  }
}

// Helper function that verifies that there were no unexplored results during
// the test.
function expectNoMore(result) {
  assert.deepEqual({}, result);
}

module.exports = function(sp) {
  describe("directed graphs", function() {
    it("handles node1 graph", function() {
      var results = sp(graphs.directed.node1);

      expect(results, 1, 1, 0);

      expectNoMore(results);
    });

    it("handles node2 graph", function() {
      var results = sp(graphs.directed.node2);

      expect(results, 1, 1, 0);
      expect(results, 1, 2);

      expect(results, 2, 1);
      expect(results, 2, 2, 0);

      expectNoMore(results);
    });

    it("handles edge1 graph", function() {
      var results = sp(graphs.directed.edge1);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);

      expect(results, 2, 1);
      expect(results, 2, 2, 0);

      expectNoMore(results);
    });

    it("handles edge2 graph", function() {
      var results = sp(graphs.directed.edge2);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);
      expect(results, 1, 3, 2, 2);

      expect(results, 2, 1);
      expect(results, 2, 2, 0);
      expect(results, 2, 3, 1, 2);

      expect(results, 3, 1);
      expect(results, 3, 2);
      expect(results, 3, 3, 0);

      expectNoMore(results);
    });

    it("handles selfLoop graph", function() {
      var results = sp(graphs.directed.selfLoop);

      expect(results, 1, 1, 0);

      expectNoMore(results);
    });

    it("handles cycle2 graph", function() {
      var results = sp(graphs.directed.cycle2);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);

      expect(results, 2, 1, 1, 2);
      expect(results, 2, 2, 0);

      expectNoMore(results);
    });

    it("handles diamond graph", function() {
      var results = sp(graphs.directed.diamond);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);
      expect(results, 1, 3, 1, 1);
      expect(results, 1, 4, 2, [2, 3]);

      expect(results, 2, 1);
      expect(results, 2, 2, 0);
      expect(results, 2, 3);
      expect(results, 2, 4, 1, 2);

      expect(results, 3, 1);
      expect(results, 3, 2);
      expect(results, 3, 3, 0);
      expect(results, 3, 4, 1, 3);

      expect(results, 4, 1);
      expect(results, 4, 2);
      expect(results, 4, 3);
      expect(results, 4, 4, 0);

      expectNoMore(results);
    });
  });

  describe("undirected graphs", function() {
    it("handles node1 graph", function() {
      var results = sp(graphs.undirected.node1);

      expect(results, 1, 1, 0);

      expectNoMore(results);
    });

    it("handles node2 graph", function() {
      var results = sp(graphs.undirected.node2);

      expect(results, 1, 1, 0);
      expect(results, 1, 2);

      expect(results, 2, 1);
      expect(results, 2, 2, 0);

      expectNoMore(results);
    });

    it("handles edge1 graph", function() {
      var results = sp(graphs.undirected.edge1);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);

      expect(results, 2, 1, 1, 2);
      expect(results, 2, 2, 0);

      expectNoMore(results);
    });

    it("handles edge2 graph", function() {
      var results = sp(graphs.undirected.edge2);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);
      expect(results, 1, 3, 2, 2);

      expect(results, 2, 1, 1, 2);
      expect(results, 2, 2, 0);
      expect(results, 2, 3, 1, 2);

      expect(results, 3, 1, 2, 2);
      expect(results, 3, 2, 1, 3);
      expect(results, 3, 3, 0);

      expectNoMore(results);
    });

    it("handles selfLoop graph", function() {
      var results = sp(graphs.undirected.selfLoop);

      expect(results, 1, 1, 0);

      expectNoMore(results);
    });

    it("handles diamond graph", function() {
      var results = sp(graphs.undirected.diamond);

      expect(results, 1, 1, 0);
      expect(results, 1, 2, 1, 1);
      expect(results, 1, 3, 1, 1);
      expect(results, 1, 4, 2, [2, 3]);

      expect(results, 2, 1, 1, 2);
      expect(results, 2, 2, 0);
      expect(results, 2, 3, 2, [1, 4]);
      expect(results, 2, 4, 1, 2);

      expect(results, 3, 1, 1, 3);
      expect(results, 3, 2, 2, [1, 4]);
      expect(results, 3, 3, 0);
      expect(results, 3, 4, 1, 3);

      expect(results, 4, 1, 2, [2, 3]);
      expect(results, 4, 2, 1, 4);
      expect(results, 4, 3, 1, 4);
      expect(results, 4, 4, 0);

      expectNoMore(results);
    });
  });
}
