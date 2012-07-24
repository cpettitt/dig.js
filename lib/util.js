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
    attachId: attachId
  };
})();
