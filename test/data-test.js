var assert = require('assert'),
    data = require('../index').data;

describe('dig.data', function() {
  function heapTests(heapFactory) {
    var h;
    var c0, c3, c5;

    beforeEach(function() {
      h = heapFactory(function(x) { return x.cost });
      c0 = {cost: 0};
      c3 = {cost: 3};
      c5 = {cost: 5};
    });

    it('should allow nodes to be added', function() {
      h.add(c5);
      assert.equal(1, h.size());
      h.add(c3);
      assert.equal(2, h.size()); 
    });

    it('should return the smallest value with `min`', function() {
      h.add(c5);
      h.add(c3);
      assert.deepEqual(c3, h.min());
    });

    it('should remove the smallest value with `removeMin`', function() {
      h.add(c5);
      h.add(c3);
      assert.deepEqual(c3, h.removeMin());
      assert.deepEqual(c5, h.removeMin());
      assert.equal(0, h.size());      
    });

    it('should allow an arbitrary key function', function() {
      var h = heapFactory(function(x) { return -x.cost; });
      h.add(c5);
      h.add(c3);
      assert.equal(c5, h.removeMin());
      assert.equal(c3, h.removeMin());
      assert.equal(0, h.size());
    });

    it('should throw an error with an empty heap and `removeMin`', function() {
      assert.throws(function() { heapFactory().removeMin(); });
    });

    it('should properly order a sequence of random numbers', function() {
      var objs = [];
      var num;
      for (var i = 0; i < 20; ++i) {
        var obj = {cost: Math.floor(Math.random() * 1000)};
        objs.push(obj);
        h.add(obj);
      }

      var actual = [];
      while (h.size() > 0) {
        actual.push(h.removeMin());
      }

      assert.deepEqual(objs.sort(function(l, r) { return l.cost - r.cost; }), actual);
    });

    it('should allow the addition of multiple elements', function() {
      h.addAll([c3, c5, c0]);
      assert.equal(c0, h.removeMin());
      assert.equal(c3, h.removeMin());
      assert.equal(c5, h.removeMin());
    });

    it('should allow an element\'s key to be decreased', function() {
      var c1000 = {cost: 1000};
      h.add(c0);
      h.add(c3);
      h.add(c5);
      h.add(c1000);

      h.decreaseKey(c1000, 2);
      h.decreaseKey(c3, 1);
      assert.deepEqual(c0, h.removeMin());
      assert.deepEqual(c3, h.removeMin());
      assert.deepEqual(c1000, h.removeMin());
      assert.deepEqual(c5, h.removeMin());
      assert.equal(0, h.size());
    });

    it('should handle decreasing a key of the last element in the queue', function() {
      h.add(c0);
      h.add(c3);
      assert.deepEqual(c0, h.removeMin());

      h.decreaseKey(c3, 2);
      assert.deepEqual(c3, h.removeMin());
    });

    it('should throw an error if decreasing the key of an unknown element', function() {
      assert.throws(function() { h.decreaseKey(c0); });
    });

    it('should not allow non-objects to be added', function() {
      assert.throws(function() { h.add("not-an-object"); });
    });

    it('should not allow the same object to be added while it is already in the heap', function() {
      h.add(c3);
      assert.throws(function() { h.add(c3); });
    });

    it('should require a key function', function() {
      assert.throws(function() { heapFactory(); });
    });

    it('should throw an error if the key function returns a non-numeric value', function() {
      assert.throws(function() { heapFactory(function() { return null; }).add({}); });
      assert.throws(function() { heapFactory(function() { return undefined; }).add({}); });
      assert.throws(function() { heapFactory(function() { return "non-number"; }).add({}); });
      assert.throws(function() { heapFactory(function() { return []; }).add({}); });
    });

    it('should throw an error if decreaseKey is called with a non-numeric value', function() {
      h.add(c3);
      assert.throws(function() { h.decreaseKey(c3, null); });
      assert.throws(function() { h.decreaseKey(c3, undefined); });
      assert.throws(function() { h.decreaseKey(c3, "non-number"); });
      assert.throws(function() { h.decreaseKey(c3, []); });
    });
  }

  describe('queue', function() {
    it('should allow no-arg construction', function() {
      var q = data.queue();
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
      assert.equal(1, q.size());

      assert.equal('test', q.dequeue());
      assert.equal(0, q.size());
    });
  });

  describe('binaryHeap', function() {
    heapTests(data.binaryHeap);
  });
});
