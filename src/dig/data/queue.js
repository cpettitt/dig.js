var dig_data_Queue = dig.data.Queue = (function() {
  function Queue(arr) {
    if (!(this instanceof Queue)) {
      throw new Error("Constructor called without using `new`");
    }

    dig_util_defineProperty(this, "_data", {
      size: 0,
      head: undefined,
      tail: undefined
    });

    if (arr) {
      for (var i = 0; i < arr.length; ++i) {
        this.enqueue(arr[i]);
      }
    }
  };

  Queue.prototype = {
    size: function() { return this._data.size; },

    enqueue: function(elem) {
      var data = this._data;

      if (data.size === 0) {
        data.head = data.tail = { value: elem };
      } else {
        data.tail = data.tail.next = { value: elem };
      }
      data.size++;
    },

    dequeue: function() {
      var data = this._data;

      if (data.size > 0) {
        var value = data.head.value;
        data.head = data.head.next;
        data.size--;
        return value;
      }
    }
  };

  return Queue;
})();
