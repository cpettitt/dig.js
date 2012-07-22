/*
 * Graph algorithms
 */
(function() {
  var exports = {
    topsort: require('./alg/topsort')
  };
  if (typeof module !== 'undefined') {
    module.exports = exports;
  } else {
    dig.alg = exports;
  }
})();
