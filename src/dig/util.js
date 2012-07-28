/*
 * Various utility functions that are used throughout the project.
 */ 
dig.util = (function() {
  function _type(obj) {
    var strType = Object.prototype.toString.call(obj);
    return strType.substring(8, strType.length - 1);
  }

  function isArray(obj) {
    return _type(obj) === 'Array';
  }

  function isNumber(obj) {
    return _type(obj) === 'Number';
  }

  /*
   * Creates a new array with the values returned when calling the supplied
   * function on each element of the supplied enumerable object.
   */
  function map(func, obj) {
    var mapped = [];
    for (var k in obj) {
      mapped.push(func(obj[k]));
    }
    return mapped;
  }

  var _nextId = 0;

  /*
   * Assigns a unique ID to the given object if it does not already have one.
   */
  function attachId(n) {
    if (!n.hasOwnProperty("_digId")) {
      Object.defineProperty(n, "_digId", {value: _nextId++});
    }
  }

  return {
    isArray: isArray,
    isNumber: isNumber,
    map: map,
    attachId: attachId
  };
})();
