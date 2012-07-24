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

  return {
    isArray: isArray
  };
})();
