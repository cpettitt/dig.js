var assert = require('assert'),
    data = require('../index').data;

describe('dig.data', function() {
  describe('queue', function() {
    it('should allow no-arg construction', function() {
      var q = data.queue();
      assert.ok(q.isEmpty());
      assert.equal(0, q.size());
    });

    it('should allow construction from an array', function() {
      var q = data.queue([1,2,3]);
      assert.equal(3, q.size());
      assert.equal(1, q.dequeue());
      assert.equal(2, q.dequeue());
      assert.equal(3, q.dequeue());
      assert.equal(undefined, q.dequeue());
    });

    it('should raise an error for invalid arguments', function() {
      assert.throws(function() { queue(undefined); });
      assert.throws(function() { queue(null); });
      assert.throws(function() { queue(0); });
      assert.throws(function() { queue("string"); });
      assert.throws(function() { queue({a: 123}); });
    });

    it('should allow enqueues', function() {
      var q = data.queue();

      q.enqueue('test');
      assert.equal(false, q.isEmpty());
      assert.equal(1, q.size());

      assert.equal('test', q.dequeue());
      assert.ok(q.isEmpty());
      assert.equal(0, q.size());
    });
  });
});
