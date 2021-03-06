dig.util = {};

var dig_util_defineProperty = (function() {
  if (Object.defineProperty) {
    return function(obj, property, value) {
      Object.defineProperty(obj, property, {value: value});
    };
  } else {
    return function(obj, property, value) {
      obj[property] = value;
    };
  }
})();

// Radix sort where key 0 is the most significant key.
var dig_util_radixSort = dig.util.radixSort = function(array, k, keyFunc) {
  function inner(array, j) {
    if (j === k) {
      return array;
    }

    var buckets = [];
    for (var i = 0; i < array.length; ++i) {
      var val = array[i];
      var key = keyFunc(j, val);
      if (key !== Math.floor(key) || key < 0) {
        throw new Error("Key is not a natural number: " + key);
      }
      var bucket = buckets[key] = (buckets[key] || []);
      bucket.push(val);
    }

    var toJoin = [];
    for (var i = 0; i < buckets.length; ++i) {
      var bucket = buckets[i];
      if (bucket !== undefined) {
        toJoin.push(inner(bucket, j + 1));
      }
    }

    return Array.prototype.concat.apply([], toJoin);
  }

  return inner(array, 0);
}
