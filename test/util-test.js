var assert = require('assert'),
    util = require('../index').util;

describe('dig.util', function() {
  describe('attachId', function() {
    it('should attach an id to an object', function() {
      var n = {};
      util.attachId(n);
      assert.notEqual(undefined, n._digId);
    });

    it('should attach an id to an array', function() {
      var n = [];
      util.attachId(n);
      assert.notEqual(undefined, n._digId);
    });

    it('should not attach an id to a number', function() {
      assert.throws(function() { util.attachId(1); });
    });

    it('should not attach an id to a string', function() {
      assert.throws(function() { util.attachId("abc"); });
    });

    it('should generate different id on successive iterations', function() {
      var seen = {};
      for (var i = 0; i < 50; ++i) {
        var n = {};
        util.attachId(n);
        assert.equal(undefined, seen[n._digId]);
        seen[n._digId] = true; 
      }
    });
  });

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

  describe('map', function() {
    it('should return an empty array when given an empty array', function() {
      assert.deepEqual([], dig.util.map(function(x) { return x; }, []));
    });

    it('should map each element of the given array', function() {
      assert.deepEqual([1,2,3], dig.util.map(function(x) { return x + 1; }, [0, 1, 2]));
    });

    it('should throw when given a non-function', function() {
      assert.throws(function() { dig.util.map("not-a-function", [0, 1, 2]); });
    });

    it('should throw when given a non-array', function() {
      assert.throws(function() { dig.util.map(function(x) { return x; }, {a: 123}); });
    });
  });
});
