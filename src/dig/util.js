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

function dig_util_objToArr(obj) {
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
