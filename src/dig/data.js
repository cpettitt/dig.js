/*
 * Various supporting data structures for dig.
 */

dig.data = (function() {
  /*
   * This function will create a queue. If no arguments are supplied then the
   * returned queue will be empty. If an array argument is supplied then a
   * queue will be constructed from the array such that the first element of
   * the array will be element at the head of the queue. If a non-array argument
   * is supplied this function will raise an error.
   */
  function queue(arr) {
    var _size = 0;
    var _head;
    var _tail;

    /*
     * Returns the number of elements in the queue.
     */
    function size() {
      return _size;
    }

    /*
     * Adds the given element to the back of the queue.
     */
    function enqueue(elem) {
      if (_size === 0) {
        _head = _tail = { value: elem };
      } else {
        _tail = _tail.next = { value: elem };
      }
      _size++;
    }

    /*
     * Removes the element at the head of the queue. If there is no element at
     * the head of the queue this function will return `undefined`.
     */
    function dequeue() {
      if (_size > 0) {
        var value = _head.value;
        _head = _head.next;
        _size--;
        return value;
      }
    }

    if (arguments.length === 0) {
      arr = [];
    }

    if (arr === undefined || arr === null || !dig.util.isArray(arr)) {
      throw new Error("Cannot make a queue from: " + arr);
    }

    arr.forEach(function(v) {
      enqueue(v);
    });

    return {
      enqueue: enqueue,
      dequeue: dequeue,
      size: size
    };
  }

  /*
   * Creates a new binary heap with the min-heap property. The implementation
   * is derived from "Introduction to Algorithms", Cormen, et. al.
   *
   * This implementation only currently supports objects.
   *
   * The constructor allows an arbitrary key function to be supplied. By
   * default the heap will sort items by their intrinsic value.
   */
  function binaryHeap(keyFunc) {
    // Definition of terms:
    //
    // elem:  the actual element added by the user
    // key:   computed value of an element (used for determining the next
    //        minimum element)

    // Mapping of elem._digId to a relative index
    var _idToIndex = {};

    // The underlying array that stores the heap elements
    var _arr = [];

    if (!keyFunc) {
      throw new Error("key function must be defined");
    }

    function _decreaseKey(i, key) {
      if (key > _arr[i].key) {
        throw new Error("new key is greater than current key");
      }
      _arr[i].key = key;
      var parent, tmp;
      while (i > 0) {
        parent = i >> 1;
        if (_arr[parent].key < _arr[i].key) {
          break;
        }
        _swap(i, parent);
        i = parent;
      }
    }

    function _swap(i, j) {
      var tmp = _arr[i];
      _arr[i] = _arr[j];
      _arr[j] = tmp;
      _idToIndex[_arr[i].elem._digId] = i;
      _idToIndex[_arr[j].elem._digId] = j;
    }

    function _heapify(i) {
      var l = 2 * i,
          r = l + 1,
          largest;
      if (l < _arr.length && _arr[l].key < _arr[i].key) {
        largest = l;
      } else {
        largest = i;
      }

      if (r < _arr.length && _arr[r].key < _arr[largest].key) {
        largest = r;
      }

      if (largest !== i) {
        _swap(i, largest);
        _heapify(largest);
      }
    }

    /*
     * Returns the number of keys in the heap.
     */
    function size() {
      return _arr.length;
    }

    /*
     * Adds a new key to the heap.
     */
    function add(elem) {
      dig.util.attachId(elem);
      if (elem._digId in _idToIndex) {
        throw new Error("Element is already in the heap: " + JSON.stringify(elem));
      }

      var key = keyFunc(elem);
      if (!dig.util.isNumber(key)) {
        throw new Error("Key function returned non-numeric result: " + key);
      }

      var entry = {elem: elem, key: Number.POSITIVE_INFINITY};
      var index = _idToIndex[elem._digId] = _arr.length;
      _arr.push(entry);
      _decreaseKey(index, key);
    }

    /*
     * Adds a list of elements to the heap.
     */
    function addAll(elems) {
      elems.forEach(function(elem) {
        add(elem);
      });
    }

    /*
     * Returns the minimum key in the heap, but does not remove it from the
     * heap.
     */
    function min() {
      return _arr[0].elem;
    }

    /*
     * Removes the minimum key from the heap and returns it.
     */
    function removeMin() {
      if (_arr.length < 1) {
        throw new Error("Heap underflow");
      }
      _swap(0, _arr.length - 1);
      var min = _arr.pop();
      delete _idToIndex[min._digId];
      _heapify(0);
      return min.elem;
    }

    function decreaseKey(obj, newKey) {
      if (!dig.util.isNumber(newKey)) {
        throw new Error("Non-numeric key given to decreaseKey: " + newKey);
      }

      var i = _idToIndex[obj._digId];
      if (i === undefined) {
        throw new Error("Object is not in the heap: " + JSON.stringify(obj));
      }
      _decreaseKey(i, newKey);
    }

    return {
      size: size,
      add: add,
      addAll: addAll,
      min: min,
      removeMin: removeMin,
      decreaseKey: decreaseKey
    };
  }

  return {
    queue: queue,
    binaryHeap: binaryHeap
  };
})();
