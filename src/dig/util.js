dig.util = {};

function dig_util_forEach(array, func) {
  for (var i = 0; i < array.length; ++i) {
    func(array[i]);
  }
}

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

function dig_util_keys(obj) {
  var arr = [];
  for (var k in obj) {
    arr.push(k);
  }
  return arr;
}

function dig_util_any(arr, pred) {
  for (var i = 0; i < arr.length; ++i) {
    if (pred(arr[i])) {
      return true;
    }
  }

  return false;
}

function dig_util_all(arr, pred) {
  for (var i = 0; i < arr.length; ++i) {
    if (!pred(arr[i])) {
      return false;
    }
  }

  return true;
}

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
