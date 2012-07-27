var assert = require('assert'),
    data = require('../index').data;

describe('dig.data', function() {
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
    it('should allow no-arg construction', function() {
      assert.equal(0, data.binaryHeap().size());
    });

    it('should allow nodes to be added', function() {
      var h = data.binaryHeap();
      h.add(5);
      assert.equal(1, h.size());
      h.add(3);
      assert.equal(2, h.size()); 
    });

    it('should return the smallest value with `min`', function() {
      var h = data.binaryHeap();
      h.add(5);
      h.add(3);
      assert.equal(3, h.min());
    });

    it('should remove the smallest value with `removeMin`', function() {
      var h = data.binaryHeap();
      h.add(5);
      h.add(3);
      assert.equal(3, h.removeMin());
      assert.equal(5, h.removeMin());
      assert.equal(0, h.size());      
    });

    it('should allow an arbitrary key function', function() {
      var h = data.binaryHeap(function(x) { return -x; });
      h.add(5);
      h.add(3);
      assert.equal(5, h.removeMin());
      assert.equal(3, h.removeMin());
      assert.equal(0, h.size());
    });

    it('should throw an error with an empty heap and `removeMin`', function() {
      assert.throws(function() {
        data.binaryHeap().removeMin();
      });
    });

    it('should properly order a sequence of random numbers', function() {
      var nums = [];
      var h = data.binaryHeap();
      var num;
      for (var i = 0; i < 500; ++i) {
        num = Math.floor(Math.random() * 1000);
        nums.push(num);
        h.add(num);
      }

      var actual = [];
      while (h.size() > 0) {
        actual.push(h.removeMin());
      }

      assert.deepEqual(nums.sort(function(l, r) { return l - r; }), actual);
    });
  });

  it('should allow the addition of multiple elements', function() {
    var h = data.binaryHeap();
    h.addAll([5, 3, 7]);
    assert.equal(3, h.removeMin());
    assert.equal(5, h.removeMin());
    assert.equal(7, h.removeMin());
  });
});
