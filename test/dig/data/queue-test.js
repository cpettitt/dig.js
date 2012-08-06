require('../../test-env');

describe('dig.data.Queue', function() {
  describe("constructor", function() {
    it("Queue() returns an empty queue", function() {
      var q = new dig.data.Queue();
      assert.equal(0, q.size());
    });

    it("Queue(array) returns a queue with the array's elements", function() {
      var q = new dig.data.Queue([1]);
      assert.equal(1, q.size());
      assert.equal(1, q.dequeue());
    });

    it("throws an error if new was not used", function() {
      assert.throws(function() { dig.data.Queue(); });
    });
  });

  describe("size()", function() {
    it("increases as elements are added to the queue", function() {
      var q = new dig.data.Queue();
      q.enqueue(1);
      assert.equal(1, q.size());
      q.enqueue(2);
      assert.equal(2, q.size());
    });

    it("decreases as elements are dequeued", function() {
      var q = new dig.data.Queue();
      q.enqueue("a");
      q.enqueue("b");
      q.dequeue();
      assert.equal(1, q.size());
      q.dequeue();
      assert.equal(0, q.size());
    });
  });

  describe("enqueue(elem)", function() {
    it("adds an element to the queue", function() {
      var q = new dig.data.Queue();
      q.enqueue("a");
      assert.equal(1, q.size());
      assert.equal("a", q.dequeue());
    });

    it("allows primitives to be added", function() {
      var q = new dig.data.Queue();
      q.enqueue("a");
      assert.equal("a", q.dequeue());
      q.enqueue(1);
      assert.equal(1, q.dequeue());
      q.enqueue(false);
      assert.equal(false, q.dequeue());
      q.enqueue(undefined);
      assert.equal(undefined, q.dequeue());
      q.enqueue(null);
      assert.equal(null, q.dequeue());
    });

    it("allows objects to be added", function() {
      var obj = {key: "key"};
      var q = new dig.data.Queue();
      q.enqueue(obj);
      assert.equal(obj, q.dequeue());
    });
  });

  describe("dequeue()", function() {
    it("removes and returns elements in FIFO order", function() {
      var q = new dig.data.Queue();
      q.enqueue(1);
      q.enqueue(2);
      assert.equal(1, q.dequeue());
      assert.equal(2, q.dequeue());
    });

    it("throws an error if the queue is empty", function() {
      assert.throws(function() { q.dequeue(); });
    });
  });
});
