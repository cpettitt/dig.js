require('../test-env');

var util = dig.util;

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
    function id(x) { return x; }

    it('should return an empty array when given an empty array', function() {
      assert.deepEqual([], dig.util.map(id, []));
    });

    it('should map each element of the given array', function() {
      assert.deepEqual([1,2,3], dig.util.map(function(x) { return x + 1; }, [0, 1, 2]));
    });

    it('should handle objects with enumerable fields', function() {
      assert.deepEqual(['t', 'e', 's', 't'], dig.util.map(id, "test"));
      assert.deepEqual([1,2,3,4], dig.util.map(id, {a: 1, b: 2, d: 3, c: 4}).sort());
    });

    it('should handle objects with prototypes', function() {
      function obj() {
        this.a = 1;
        this.b = 2;
      }
      obj.prototype.c = 3;
      assert.deepEqual([1, 2, 3], dig.util.map(id, new obj()).sort());
    });

    it('should throw when given a non-function', function() {
      assert.throws(function() { dig.util.map("not-a-function", [0, 1, 2]); });
    });
  });
});
