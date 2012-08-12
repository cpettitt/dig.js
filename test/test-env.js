assert = require('assert');
dig = require('../index.js');

assert.isTrue = function(actual, message) {
  assert.strictEqual(true, actual, message);
};

assert.isFalse = function(actual, message) {
  assert.strictEqual(false, actual, message);
};

assert.isUndefined = function(actual, message) {
  assert.strictEqual(undefined, actual, message);
};

assert.isNull = function(actual, message) {
  assert.strictEqual(null, actual, message);
};

assert.memberOf = function(set, actual, message) {
  if (set.indexOf(actual) == -1) {
    assert.fail(actual, set, message, "memberOf");
  }
};

assert.graphEqual = function(expected, actual) {
  if (!expected.equals(actual)) {
    assert.fail(expected, actual, "\n" + expected + "\ndoes not equal:\n\n" + actual);
  }
};
