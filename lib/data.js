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
   * This implementation only currently supports primitive types whose identity
   * is preserved when coerced to a string.
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

    var _arr = [];

    keyFunc = keyFunc || function(x) { return x; };

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
      var entry = {elem: elem, key: Number.POSITIVE_INFINITY};
      _arr.push(entry);
      _decreaseKey(_arr.length - 1, keyFunc(elem));
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
      var min = _arr[0];
      _arr[0] = _arr[_arr.length - 1];
      _arr.pop();
      _heapify(0);
      return min.elem;
    }

    return {
      size: size,
      add: add,
      addAll: addAll,
      min: min,
      removeMin: removeMin
    };
  }

  return {
    queue: queue,
    binaryHeap: binaryHeap
  };
})();
