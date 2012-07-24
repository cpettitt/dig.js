var assert = require('assert'),
    util = require('../index').util;

describe('dig.util', function() {
  describe('isArray', function() {
    it('should return `true` for an array', function() {
      assert.ok(util.isArray([]));
      assert.ok(util.isArray([1,2,3]));
      assert.ok(new Array());
    });

    it('should return `false` for non-arrays', function() {
      assert.equal(false, util.isArray(0));
      assert.equal(false, util.isArray("string"));
      assert.equal(false, util.isArray({a: 123}));
    });
  });
});
