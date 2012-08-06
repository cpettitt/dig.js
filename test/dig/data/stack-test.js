require("../../test-env");

describe("dig.data.Stack", function() {
  describe("constructor", function() {
    it("Stack() returns an empty stack", function() {
      assert.equal(0, new dig.data.Stack().size());
    });

    it("throws an error if new was not used", function() {
      assert.throws(function() { dig.data.Stack(); });
    });
  });

  describe("size()", function() {
    it("increases as elements are pushed to the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      assert.equal(1, s.size());
      s.push("b");
      assert.equal(2, s.size());
    });

    it("decreases as elements are popped from the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      s.push("b");
      s.pop();
      assert.equal(1, s.size());
      s.pop();
      assert.equal(0, s.size());
    });
  });

  describe("push(elem)", function() {
    it("adds elements to the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      assert.equal(1, s.size());
      assert.equal("a", s.pop());
    });

    it("adds elements to the top of the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      s.push("b");
      assert.equal("b", s.pop());
    });

    it("allows duplicates on the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      s.push("a");
      assert.equal(2, s.size());
      assert.equal("a", s.pop());
      assert.equal("a", s.pop());
    });
  });

  describe("pop()", function() {
    it("removes and returns elements from the top of the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      s.push("b");
      assert.equal("b", s.pop());
      assert.equal("a", s.pop());
    });

    it("throws an error when called on an empty stack", function() {
      assert.throws(function() { new dig.data.Stack().pop(); });
    });
  });

  describe("has(elem)", function() {
    it("returns true if the element is on the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      assert.isTrue(s.has("a"));
    });

    it("returns false if the element is not on the stack", function() {
      var s = new dig.data.Stack();
      assert.isFalse(s.has("a"));
    });

    it("returns true when a duplicate is removed from the stack", function() {
      var s = new dig.data.Stack();
      s.push("a");
      s.push("a");
      s.pop();
      assert.isTrue(s.has("a"));
    });

    it("coerces it's input to string", function() {
      var s = new dig.data.Stack();
      s.push(1);
      assert.isTrue(s.has("1"));
    });
  });
});
