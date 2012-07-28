/*
 * Various utility functions that are used throughout the project.
 */ 
dig.util = (function() {
  /*
   * Checks if `obj` is an array. Returns `true` if it is and `false` if not.
   */
  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isNumber(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
  }

  /*
   * Creates a new array with the values returned when calling the supplied
   * function on each element of the supplied array.
   */
  function map(func, array) {
    if (!isArray(array)) {
      throw new Error(JSON.stringify(array) + " is not an array");
    }

    var mapped = new Array(array.length);
    for (var k in array) {
      mapped[k] = func(array[k]); 
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
