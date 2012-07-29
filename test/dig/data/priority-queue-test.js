require('../../test-env');

describe('dig.data.priorityQueue', function() {
  var pq;

  beforeEach(function() {
    pq = new dig.data.PriorityQueue();
  });

  describe("constructor", function() {
    it("PriorityQueue() returns an empty queue", function() {
      assert.equal(0, pq.size());
    });

    it("should throw an error if new was not used", function() {
      assert.throws(function() { dig.data.PriorityQueue(); });
    });
  });

  describe("keys()", function() {
    it("returns all of the keys in the queue", function() {
      pq.add("a", 1);
      pq.add(1, 2);
      pq.add(false, 3);
      pq.add(undefined, 4);
      pq.add(null, 5);
      assert.isTrue(pq.has("a"));
      assert.isTrue(pq.has(1));
      assert.isTrue(pq.has(false));
      assert.isTrue(pq.has(undefined));
      assert.isTrue(pq.has(null));
    });
  });

  describe("has(key)", function() {
    it("returns true if the key is in the queue", function() {
      pq.add("a", 1);
      assert.isTrue(pq.has("a"));
    });

    it("returns false if the key is not in the queue", function() {
      assert.isFalse(pq.has("a"));
    });
  });

  describe("priority(key)", function() {
    it("returns the current priority for the key", function() {
      pq.add("a", 1);
      pq.add("b", 2);
      assert.equal(1, pq.priority("a"));
      assert.equal(2, pq.priority("b"));
    });
  });

  describe("add(key, pri)", function() {
    it("adds the key to the queue", function() {
      pq.add("a", 1);
      assert.deepEqual(["a"], pq.keys());
    });

    it("returns true if the key was added", function() {
      assert.isTrue(pq.add("a", 1)); 
    });

    it("returns false if the key already exists in the queue", function() {
      pq.add("a", 1);
      assert.isFalse(pq.add("a", 1));
    });
  });

  describe("min()", function() {
    it("returns undefined when the queue is empty", function() {
      assert.isUndefined(pq.min());
    });

    it("returns the smallest element", function() {
      pq.add("b", 2);
      pq.add("a", 1);
      assert.equal("a", pq.min());
    });

    it("does not remove the minimum element from the queue", function() {
      pq.add("b", 2);
      pq.add("a", 1);
      pq.min();
      assert.equal(2, pq.size());
    });
  });

  describe("removeMin()", function() {
    it("removes the minimum element from the queue", function() {
      pq.add("b", 2);
      pq.add("a", 1);
      pq.add("c", 3);
      pq.add("e", 5);
      pq.add("d", 4);
      assert.equal("a", pq.removeMin());
      assert.equal("b", pq.removeMin());
      assert.equal("c", pq.removeMin());
      assert.equal("d", pq.removeMin());
      assert.equal("e", pq.removeMin());
    });

    it("throws an error if there is no element in the queue", function() {
      assert.throws(function() { pq.removeMin(); });
    });
  });

  describe("decrease(key, pri)", function() {
    it("decreases the priority of a key", function() {
      pq.add("a", 1);
      pq.decrease("a", -1);
      assert.equal(-1, pq.priority("a"));
    });

    it("raises an error if the key is not in the queue", function() {
      assert.throws(function() { pq.decrease("a", -1); });
    });

    it("raises an error if the new priority is greater than current", function() {
      pq.add("a", 1);
      assert.throws(function() { pq.decrease("a", 2); });
    });
  });
});
