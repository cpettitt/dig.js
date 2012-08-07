var dig_data_Stack = dig.data.Stack = (function() {
  function Stack() {
    if (!(this instanceof Stack)) {
      throw new Error("Constructor called without using `new`");
    }

    dig_util_defineProperty(this, "_data", {
      stack: [],
      onStack: {}
    });
  }

  Stack.prototype = {
    size: function() { return this._data.stack.length; },

    push: function(elem) {
      var onStack = this._data.onStack[elem] || 0;
      this._data.onStack[elem] = onStack + 1;
      this._data.stack.push(elem);
    },

    pop: function() {
      if (this.size() == 0) {
        throw new Error("stack underflow");
      }
      var top = this._data.stack.pop();

      var onStack = (this._data.onStack[top] -= 1);
      if (!onStack) {
        delete this._data.onStack[top];
      }

      return top;
    },

    has: function(elem) {
      return elem in this._data.onStack;
    }
  };

  return Stack;
})();
