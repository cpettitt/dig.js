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

  describe('makeQueue', function() {
    it('should allow no-arg construction', function() {
      var q = util.makeQueue();
      assert.ok(q.isEmpty());
      assert.equal(0, q.size());
    });

    it('should allow construction from an array', function() {
      var q = util.makeQueue([1,2,3]);
      assert.equal(3, q.size());
      assert.equal(1, q.dequeue());
      assert.equal(2, q.dequeue());
      assert.equal(3, q.dequeue());
      assert.equal(undefined, q.dequeue());
    });

    it('should raise an error for invalid arguments', function() {
      assert.throws(function() { makeQueue(undefined); });
      assert.throws(function() { makeQueue(null); });
      assert.throws(function() { makeQueue(0); });
      assert.throws(function() { makeQueue("string"); });
      assert.throws(function() { makeQueue({a: 123}); });
    });

    it('should allow enqueues', function() {
      var q = util.makeQueue();

      q.enqueue('test');
      assert.equal(false, q.isEmpty());
      assert.equal(1, q.size());

      assert.equal('test', q.dequeue());
      assert.ok(q.isEmpty());
      assert.equal(0, q.size());
    });
  });
});
