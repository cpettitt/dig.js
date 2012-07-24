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
     * Returns `true` if there are no more elements in the queue.
     */
    function isEmpty() {
      return _size === 0;
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
      isEmpty: isEmpty,
      size: size
    };
  }

  return {
    queue: queue
  };
})();
