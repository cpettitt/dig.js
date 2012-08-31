var dig_data_PriorityQueue = dig.data.PriorityQueue = (function() {
  function PriorityQueue() {
    if (!(this instanceof PriorityQueue)) {
      throw new Error("Constructor called without using `new`");
    }

    dig_util_defineProperty(this, "_arr", []);
    dig_util_defineProperty(this, "_keyIndices", {});
  }

  PriorityQueue.prototype = {
    size: function() {
      return this._arr.length;
    },

    keys: function() {
      return dig_util_keys(this._keyIndices);
    },

    has: function(key) {
      return key in this._keyIndices;
    },

    priority: function(key) {
      var index = this._keyIndices[key];
      if (index !== undefined) {
        return this._arr[index].pri;
      }
    },

    add: function(key, pri) {
      if (!(key in this._keyIndices)) {
        var entry = {key: key, pri: pri};
        var index = this._arr.length;
        this._keyIndices[key] = index;
        this._arr.push(entry);
        _decrease(this, index);
        return true;
      }
      return false;
    },

    min: function() {
      if (this.size() > 0) {
        return this._arr[0].key;
      }
    },

    removeMin: function() {
      _swap(this, 0, this._arr.length - 1);
      var min = this._arr.pop();
      delete this._keyIndices[min.key];
      _heapify(this, 0);
      return min.key;
    },

    decrease: function(key, pri) {
      var index = this._keyIndices[key];
      if (pri > this._arr[index].pri) {
        throw new Error("New priority is greater than current priority. " +
            "Key: " + key + " Old: " + this._arr[index].pri + " New: " + pri);
      }
      this._arr[index].pri = pri;
      _decrease(this, index);
    }
  };

  function _heapify(self, i) {
    var arr = self._arr;
    var l = 2 * i,
        r = l + 1,
        largest = i;
    if (l < arr.length) {
      largest = arr[l].pri < arr[largest].pri ? l : largest;
      if (r < arr.length) {
        largest = arr[r].pri < arr[largest].pri ? r : largest;
      }
      if (largest !== i) {
        _swap(self, i, largest);
        _heapify(self, largest);
      }
    }
  }

  function _decrease(self, index) {
    var arr = self._arr;
    var pri = arr[index].pri;
    var parent;
    while (index > 0) {
      parent = index >> 1;
      if (arr[parent].pri < pri) {
        break;
      }
      _swap(self, index, parent);
      index = parent;
    }
  }

  function _swap(self, i, j) {
    var arr = self._arr;
    var keyIndices = self._keyIndices;
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    keyIndices[arr[i].key] = i;
    keyIndices[arr[j].key] = j;
  }

  return PriorityQueue;
})();
