require("../test-env");

describe("dig.util.radixSort(arr, k, keyFunc)", function() {
  it("matches Array.sort for single element keys", function() {
    var toSort = [5, 3, 6, 2, 0, 9, 11, 22, 21];
    var keyFunc = function(_, x) { return x; }
    var sortFunc = function(x, y) { return x - y; }
    assert.deepEqual(toSort.slice(0).sort(sortFunc), dig.util.radixSort(toSort, 1, keyFunc));
  });

  it("matches Array.sort for multi-element keys", function() {
    var toSort = [[0, 12], [2, 1], [3, 6], [6, 3], [6, 2], [21, 13]];
    var keyFunc = function(i, x) { return x[i]; }
    var sortFunc = function(x, y) { return x[0] - y[0] || x[1] - y[1]; }
    assert.deepEqual(toSort.slice(0).sort(sortFunc), dig.util.radixSort(toSort, 2, keyFunc));
  });

  it("throws an error if the return value is not a natural number", function() {
    var toSort = [0, -1, 1];
    var keyFunc = function(_, x) { return x; }
    assert.throws(function() { dig.util.radixSort(toSort, 1, keyFunc); });
  });
});
