/*
Copyright (c) 2012 Chris Pettitt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function() {
  dig = {};
dig.version = "0.0.5";
dig.util = {};

function dig_util_forEach(array, func) {
  for (var i = 0; i < array.length; ++i) {
    func(array[i]);
  }
}

var dig_util_defineProperty = (function() {
  if (Object.defineProperty) {
    return function(obj, property, value) {
      Object.defineProperty(obj, property, {value: value});
    };
  } else {
    return function(obj, property, value) {
      obj[property] = value;
    };
  }
})();

function dig_util_keys(obj) {
  var arr = [];
  for (var k in obj) {
    arr.push(k);
  }
  return arr;
}

function dig_util_any(arr, pred) {
  for (var i = 0; i < arr.length; ++i) {
    if (pred(arr[i])) {
      return true;
    }
  }

  return false;
}

function dig_util_all(arr, pred) {
  for (var i = 0; i < arr.length; ++i) {
    if (!pred(arr[i])) {
      return false;
    }
  }

  return true;
}

// Radix sort where key 0 is the most significant key.
var dig_util_radixSort = dig.util.radixSort = function(array, k, keyFunc) {
  function inner(array, j) {
    if (j === k) {
      return array;
    }

    var buckets = [];
    for (var i = 0; i < array.length; ++i) {
      var val = array[i];
      var key = keyFunc(j, val);
      if (key !== Math.floor(key) || key < 0) {
        throw new Error("Key is not a natural number: " + key);
      }
      var bucket = buckets[key] = (buckets[key] || []);
      bucket.push(val);
    }

    var toJoin = [];
    for (var i = 0; i < buckets.length; ++i) {
      var bucket = buckets[i];
      if (bucket !== undefined) {
        toJoin.push(inner(bucket, j + 1));
      }
    }

    return Array.prototype.concat.apply([], toJoin);
  }

  return inner(array, 0);
}
dig.data = {};
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
// A directed graph (V, E) where V is a set of nodes and E is a set of edges.
dig.DiGraph = (function() {
  // Returns the node object for u in V or throws an error if the node does
  // node exist.
  function _safeGetNode(g, u) {
    var V = g._nodes;
    if (!(u in V)) {
      throw new Error("Node not in graph: " + u);
    }
    return V[u];
  };

  // Returns the edge object for (u, v) in E or throws an error if the edge
  // does not exist.
  function _safeGetEdge(g, u, v) {
    var key = _edgeKey(u, v);
    if (!(key in g._edges)) {
      throw new Error("No such edge: (" + u + ", " + v + ")");
    }
    return g._edges[key];
  }

  // Creates a key that uniquely identifies the edge (u, v).
  function _edgeKey(u, v) {
    var uStr = u.toString();
    var vStr = v.toString();
    return uStr.length + ":" + uStr + vStr;
  }

  // Throws an error if this graph is immutable.
  function _checkMutable(g) {
    if (g._immutable) {
      throw new Error("Graph is immutable!");
    }
  }

  // Copies the first level of keys and values from src to dst.
  function _shallowCopyAttrs(src, dst) {
    if (Object.prototype.toString.call(src) !== '[object Object]') {
      throw new Error("Attributes are not an object: " + src);
    }
    for (var k in src) {
      dst[k] = src[k];
    }
  }

  // Checks for equality of all keys and values on the two objects.
  function _shallowEqual(lhs, rhs) {
    var lhsKeys = dig_util_keys(lhs);
    var rhsKeys = dig_util_keys(rhs);
    if (lhsKeys.length !== rhsKeys.length) {
      return false;
    }
    for (var k in lhs) {
      if (lhs[k] !== rhs[k]) {
        return false;
      }
    }
    return true;
  }

  function _copyNodesTo(self, g) {
    dig_util_forEach(self.nodes(), function(u) {
      g.addNode(u, self.node(u));
    });
  };

  function _nodesEqual(lhs, rhs) {
    return lhs.order() === rhs.order() &&
           dig_util_all(lhs.nodes(), function(u) {
             return rhs.hasNode(u) && _shallowEqual(lhs.node(u), rhs.node(u));
           });
  }

  function _edgesEqual(lhs, rhs) {
    return lhs.size() === rhs.size() &&
           dig_util_all(lhs.edges(), function(e) {
             return rhs.hasEdge(e.from, e.to) &&
                    _shallowEqual(lhs.edge(e.from, e.to), rhs.edge(e.from, e.to));
           });
  }

  function DiGraph() {
    this._nodes = {};
    this._edges = {};
    this._order = 0;
    this._size = 0;
    this._immutable = false;
  };

  DiGraph.prototype = {
    order: function() {
      return this._order;
    },

    size: function() {
      return this._size;
    },

    equals: function(g) {
      if (g === this) {
        return true;
      }

      return g instanceof DiGraph &&
             _nodesEqual(this, g) &&
             _edgesEqual(this, g);
    },

    copy: function() {
      var g = new DiGraph();
      var self = this;
      _copyNodesTo(self, g);
      dig_util_forEach(self.edges(), function(e) {
        g.addEdge(e.from, e.to, self.edge(e.from, e.to));
      });
      return g;
    },

    immutable: function() {
      var g = this.copy();
      g._immutable = true;
      return g;
    },

    nodes: function() {
      return dig_util_keys(this._nodes);
    },

    hasNode: function(node) {
      return node in this._nodes;
    },

    addNode: function(node, attrs) {
      _checkMutable(this);
      if (arguments.length < 1 || arguments.length > 2) {
        throw new Error("Too many or too few arguments. Argument count: " + arguments.length);
      }

      var entry = this._nodes[node];
      var added = false;
      if (!entry) {
        entry = this._nodes[node] = {
          predecessors: {},
          successors: {},
          attrs: {}
        };
        this._order++;
        added = true;
      }
      if (arguments.length >= 2) {
        _shallowCopyAttrs(attrs, entry.attrs);
      }
      return added;
    },

    addNodes: function() {
      _checkMutable(this);
      for (var i = 0; i < arguments.length; ++i) {
        this.addNode(arguments[i]);
      }
    },

    node: function(u) {
      var attrs = _safeGetNode(this, u).attrs;
      if (this._immutable) {
        var copy = {};
        _shallowCopyAttrs(attrs, copy);
        attrs = copy;
      }
      return attrs;
    },

    removeNode: function(node) {
      _checkMutable(this);
      var self = this;
      if (this.hasNode(node)) {
        dig_util_forEach(this.predecessors(node), function(i) {
          self.removeEdge(i, node);
        });
        dig_util_forEach(this.successors(node), function(k) {
          self.removeEdge(node, k);
        });
        delete this._nodes[node];
        this._order--;
        return true;
      }
      return false;
    },

    edges: function() {
      var edges = [];
      for (var k in this._edges) {
        var edge = this._edges[k];
        edge = {from: edge.from, to: edge.to, attrs: edge.attrs};
        if (this._immutable) {
          var copy = {};
          _shallowCopyAttrs(edge.attrs, copy);
          edge.attrs = copy;
        }
        edges.push(edge);
      }
      return edges;
    },

    hasEdge: function(u, v) {
      return _edgeKey(u, v) in this._edges;
    },

    addEdge: function(u, v, attrs) {
      _checkMutable(this);
      if (arguments.length < 2 || arguments.length > 3) {
        throw new Error("Too many or too few arguments. Argument count: " + arguments.length);
      }

      var fromNode = _safeGetNode(this, u);
      var toNode = _safeGetNode(this, v);
      var edgeKey = _edgeKey(u, v);
      var entry = this._edges[edgeKey];
      var added = false;
      if (!entry) {
        fromNode.successors[v] = true;
        toNode.predecessors[u] = true;
        entry = this._edges[edgeKey] = {
          from: u,
          to: v,
          attrs: {}
        };
        this._size++;
        added = true;
      }
      if (arguments.length >= 3) {
        _shallowCopyAttrs(attrs, entry.attrs);
      }
      return added;
    },

    addPath: function() {
      _checkMutable(this);
      var prev, curr;
      if (arguments.length > 1) {
        prev = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
          curr = arguments[i];
          this.addEdge(prev, curr);
          prev = curr;
        }
      }
    },

    edge: function(u, v) {
      return _safeGetEdge(this, u, v).attrs;
    },

    removeEdge: function(u, v) {
      _checkMutable(this);
      var edgeKey = _edgeKey(u, v);
      if (edgeKey in this._edges) {
        delete this._nodes[u].successors[v];
        delete this._nodes[v].predecessors[u];
        delete this._edges[edgeKey];
        this._size--;
        return true;
      }
      return false;
    },

    indegree: function(node) {
      return this.inEdges(node).length;
    },

    outdegree: function(node) {
      return this.outEdges(node).length;
    },

    degree: function(node) {
      return this.indegree(node) + this.outdegree(node);
    },

    inEdges: function(node) {
      var edges = [];
      var preds = this.predecessors(node);
      for (var i = 0; i < preds.length; i++) {
        edges.push({from: preds[i], to: node});
      }
      return edges;
    },

    outEdges: function(node) {
      var edges = [];
      var sucs = this.successors(node);
      for (var i = 0; i < sucs.length; i++) {
        edges.push({from: node, to: sucs[i]});
      };
      return edges;
    },

    predecessors: function(node) {
      return dig_util_keys(_safeGetNode(this, node).predecessors);
    },

    successors: function(node) {
      return dig_util_keys(_safeGetNode(this, node).successors);
    },

    neighbors: function(node, direction) {
      var entry = _safeGetNode(this, node);
      var obj = {};

      var indir = direction === "in" || direction === "both";
      var outdir = direction === undefined || direction === "out" || direction === "both";

      if (!indir && !outdir) {
        throw new Error("Invalid direction specified: " + direction);
      }

      if (indir) {
        for (var k in entry.predecessors) {
          obj[k] = true;
        }
      }

      if (outdir) {
        for (var k in entry.successors) {
          obj[k] = true;
        }
      }

      return dig_util_keys(obj);
    },

    isAcyclic: function() {
      var components = dig_alg_tarjan(this);
      var self = this;
      return dig_util_all(components, function(component) {
        var v = component[0];
        return component.length === 1 && !self.hasEdge(v, v);
      });
    },

    sources: function() {
      var sources = [];
      var self = this;
      dig_util_forEach(this.nodes(), function(i) { 
        if (self.indegree(i) == 0) {
          sources.push(i);
        }
      });
      return sources;
    },

    sinks: function() {
      var sinks = [];
      var self = this;
      dig_util_forEach(this.nodes(), function(i) {
        if (self.outdegree(i) === 0) {
          sinks.push(i);
        }
      });
      return sinks;
    },

    isDirected: function() {
      return true;
    },

    undirected: function(edgeMerge) {
      var g = new dig.UGraph();
      var visitedEdges = {};

      if (edgeMerge === undefined) {
        edgeMerge = function() { return {}; }
      }

      _copyNodesTo(this, g);
      var self = this;
      dig_util_forEach(this.edges(), function(e) {
        if (!(_edgeKey(e.from, e.to) in visitedEdges)) {
          visitedEdges[_edgeKey(e.from, e.to)] = visitedEdges[_edgeKey(e.to, e.from)] = true;
          var es = [e];
          if (self.hasEdge(e.to, e.from)) {
            es.push({from: e.to, to: e.from, attrs: self.edge(e.to, e.from)});
          }
          g.addEdge(e.from, e.to, edgeMerge(es));
        }
      });
      return g;
    },

    toString: function() {
      return dig_dot_write(this);
    }
  };
  return DiGraph;
})();
dig.UGraph = (function() {
  function _orderVertices(v, w) {
    return (w.toString() > v.toString()) ? [v, w] : [w, v];
  };

  function _delegate() {
    dig_util_forEach(arguments, function(func) {
      UGraph.prototype[func] = function() {
        return this._digraph[func].apply(this._digraph, arguments);
      }
    });
  }

  UGraph = function() {
    this._digraph = new dig.DiGraph();
  }

  UGraph.prototype = {
    copy: function() {
      var g = new UGraph();
      g._digraph = this._digraph.copy();
      return g;
    },

    immutable: function() {
      var g = new UGraph();
      g._digraph = this._digraph.immutable();
      return g;
    },

    equals: function(ugraph) {
      return ugraph instanceof UGraph &&
             this._digraph.equals(ugraph._digraph);
    },

    hasEdge: function(v, w) {
      return this._digraph.hasEdge.apply(this._digraph, _orderVertices(v, w));
    },

    addEdge: function(u, v, label) {
      var args = _orderVertices(u, v);
      if (arguments.length >= 3) {
        args.push(label);
      }
      return this._digraph.addEdge.apply(this._digraph, args);
    },

    addPath: function() {
      var prev, curr;
      if (arguments.length > 1) {
        prev = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
          curr = arguments[i];
          this.addEdge(prev, curr);
          prev = curr;
        }
      }
    },

    edge: function(u, v) {
      return this._digraph.edge.apply(this._digraph, _orderVertices(u, v));
    },

    removeEdge: function(v, w) {
      return this._digraph.removeEdge.apply(this._digraph, _orderVertices(v, w));
    },

    neighbors: function(v) {
      return this._digraph.neighbors(v, "both");
    },

    isDirected: function() {
      return false;
    },

    directed: function() {
      var g = this._digraph.copy();
      // Add edges in both directions
      dig_util_forEach(this.edges(), function(e) {
        g.addEdge(e.from, e.to);
        g.addEdge(e.to, e.from);
      });
      return g;
    },

    isAcyclic: function() {
      var visited = {};

      var self = this;
      function dfs(curr, prev) {
        visited[curr] = true;
        return dig_util_all(self.neighbors(curr), function(next) {
          return (!(next in visited)) ? dfs(next, curr) : next === prev;
        });
      }

      return dig_util_all(this.nodes(), function(v) {
        return (v in visited) || dfs(v, undefined);
      });
    },

    isConnected: function() {
      return dig_alg_components(this).length == 1;
    },

    toString: function() {
      return dig_dot_write(this);
    }
  };

  _delegate("order", "size",
            "nodes", "hasNode", "addNode", "addNodes", "node", "removeNode",
            "edges", "degree");

  return UGraph;
})();
dig.alg = {};
/*
 * Returns an array of all connected components in the input graph. Each
 * connected component of an undirected graph includes nodes that are connected
 * to all other nodes in the component by a path.
 *
 * For more information about connected components, see:
 *
 *    http://en.wikipedia.org/wiki/Connected_component_(graph_theory)
 */
var dig_alg_components = dig.alg.components = function(graph) {
  var results = [];
  var visited = {};

  if (graph.isDirected()) {
    throw new Error("components can only be used on undirected graphs");
  }

  function dfs(v, component) {
    if (!(v in visited)) {
      visited[v] = true;
      component.push(v);
      dig_util_forEach(graph.neighbors(v), function(w) {
        dfs(w, component);
      });
    }
  };

  dig_util_forEach(graph.nodes(), function(v) {
    var component = [];
    dfs(v, component);
    if (component.length > 0) {
      results.push(component);
    }
  });

  return results;
};
/*
 * This algorithm returns the solution for the single-source shortest path
 * problem. It returns a map of `map[v] = { distance: d, prececessor: p }` 
 * such that `d` is the shortest weighted distance from `u` to `v`
 * and `[u .. p, v]` is the shortest path from `u` to `v`.
 * 
 * This algorithm takes O(|E|+|V|)*log(|V|) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 */
var dig_alg_dijkstra = dig.alg.dijkstra = function(graph, source) {
  var results = {};
  var q = new dig_data_PriorityQueue();
  var maxDist = Number.POSITIVE_INFINITY;
  var nodeU;
  var u, v;
  var altDist;

  dig_util_forEach(graph.nodes(), function(node) {
    var distance = node == source ? 0 : maxDist;
    results[node] = { distance: distance, predecessor: null };
    q.add(node, distance);
  });

  while (q.size() > 0) {
    nodeU = q.removeMin();
    u = results[nodeU];
    if (u.distance === maxDist) {
      break;
    } 

    dig_util_forEach(graph.neighbors(nodeU), function(nodeV) {
      v = results[nodeV];
      // TODO: support weighted edges
      altDist = u.distance + 1;
      if (altDist < v.distance) {
        v.distance = altDist;
        v.predecessor = nodeU;
        q.decrease(nodeV, v.distance);
      }
    });
  }

  return results;
};

/*
 * This algorithm returns the solution for the all-pairs shortest path problem.
 * It returns a matrix `mat[u][v]` with elements
 * `{ distance: d, predecessor: p }` such that `d` is the shortest weighted
 * distance from `u` to `v` and `[u .. p, v]` is the shortest path to `v`.
 * 
 * This algorithm takes O(|V|*(|E|+|V|)*log(|V|)) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 */
var dig_alg_disjkstraAll = dig.alg.dijkstraAll = function(graph) {
  var results = {};
  dig_util_forEach(graph.nodes(), function(node) {
    results[node] = dig_alg_dijkstra(graph, node);
  });
  return results;
};
/*
 * This algorithm returns the solution for the all-pairs shortest path problem.
 * It returns a matrix `mat[u][v]` with elements
 * `{ distance: d, predecessor: p }` such that `d` is the shortest weighted
 * distance from `u` to `v` and `[u .. p, v]` is the shortest path to `v`.
 * 
 * This algorithm takes O(|V|^3) time.
 *
 * See wikipedia page for more details:
 *
 * http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
var dig_alg_floydWarshall = dig.alg.floydWarshall = function(graph) {
  var results = {};
  var nodes = graph.nodes();
  var altDistance;
  var rowI, rowK;
  var ik, kj, ij;
  var maxDist = Number.POSITIVE_INFINITY;

  dig_util_forEach(nodes, function(i) {
    rowI = results[i] = {};
    dig_util_forEach(nodes, function(j) {
      if (i == j) {
        rowI[j] = { distance: 0, predecessor: null };  
      } else if (graph.hasEdge(i, j)) {
        rowI[j] = { distance: 1, predecessor: i };
      } else {
        rowI[j] = { distance: maxDist, predecessor: null };
      }
    });
  });

  dig_util_forEach(nodes, function(k) {
    rowK = results[k];
    dig_util_forEach(nodes, function(i) {
      rowI = results[i];
      dig_util_forEach(nodes, function(j) {
        ik = rowI[k];
        kj = rowK[j];
        ij = rowI[j];
        altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}
/*
 * Given a graph (directed or undirected) and an initial set of nodes this
 * algorithm will assign level 0 to the initial set of nodes and assign level
 * 1 to nodes reachable from that set, and so on. The returned object maps the
 * node ids to their level.
 *
 * It is possible that some nodes will not be visited if the graph is not
 * connected.
 */
var dig_alg_levels = dig.alg.levels = function(g, roots) {
  var queue = new dig_data_Queue();
  var levels = {};

  if (roots.length === undefined) {
    roots = [roots];
  }

  function levelAndQueue(u, level) {
    queue.enqueue(u);
    levels[u] = level;
  }

  dig_util_forEach(roots, function(u) {
    levelAndQueue(u, 0);
  });

  var curr, u;
  while (queue.size() !== 0) {
    u = queue.dequeue();
    dig_util_forEach(g.neighbors(u), function(v) {
      if (!(v in levels)) {
        levelAndQueue(v, levels[u] + 1);
      }
    });
  }

  return levels;
}
/*
 * Given an undirected graph, find a minimum spanning tree and return it as
 * an undirected graph (an unrooted tree). This function uses Prim's
 * algorithm as described in "Introduction to Algorithms", Third Edition,
 * Comen, et al., Pg 634.
 */
var dig_alg_prim = dig.alg.prim = function(graph, weight) {
  var parents = {};
  var result = new dig.UGraph();
  var q = new dig_data_PriorityQueue();

  if (graph.isDirected()) {
    throw new Error("prim can only be used on undirected graphs");
  }

  if (graph.order() == 0) {
    return result;
  }

  dig_util_forEach(graph.nodes(), function(v) {
    q.add(v, Number.POSITIVE_INFINITY);
    result.addNode(v);
  });

  // Start from an arbitary node
  q.decrease(graph.nodes()[0], 0);

  var u, v, parent;
  while (q.size() > 0) {
    u = q.removeMin();
    if (u in parents) {
      result.addEdge(u, parents[u]);
    }
    dig_util_forEach(graph.neighbors(u), function(v) {
      var pri = q.priority(v);
      if (pri !== undefined) {
        var edgeWeight = weight(u, v);
        if (edgeWeight < pri) {
          parents[v] = u;
          q.decrease(v, edgeWeight);
        }
      }
    });
  }

  return result;
};
// Algorithm derived from: 
// http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
var dig_alg_tarjan = dig.alg.tarjan = function(graph) {
  var index = 0;
  var stack = new dig.data.Stack();
  var visited = {}; // node -> index + lowlink
  var results = [];

  if (!graph.isDirected()) {
    throw new Error("tarjan can only be called for directed graphs");
  }

  function scc(v) {
    var vEntry;

    vEntry = visited[v] = {
      index: index,
      lowlink: index
    };
    index++;
    stack.push(v);

    dig_util_forEach(graph.successors(v), function(w) {
      if (!(w in visited)) {
        scc(w);
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].lowlink);
      } else if (stack.has(w)) {
        vEntry.lowlink = Math.min(vEntry.lowlink, visited[w].index);
      }
    });

    var component;
    var w;
    if (vEntry.lowlink == vEntry.index) {
      component = [];
      do {
        w = stack.pop();
        component.push(w);
      } while (w !== v);
      results.push(component);
    }
  }

  dig_util_forEach(graph.nodes(), function(v) {
    if (!(v in visited)) {
      scc(v);
    }
  });

  return results;
};
var dig_alg_topsort = dig.alg.topsort = function(graph) {
  var visited = {};
  var stack = {};
  var results = [];

  if (!graph.isDirected()) {
    throw new Error("topsort can only be called for directed graphs");
  }

  function visit(node) {
    if (node in stack) {
      throw new Error("graph has at least one cycle!");
    }

    if (!(node in visited)) {
      stack[node] = true;
      visited[node] = true;
      dig_util_forEach(graph.predecessors(node), function(pred) {
        visit(pred);
      });
      delete stack[node];
      results.push(node);
    }
  }

  var sinks = graph.sinks();
  if (graph.order() != 0 && sinks.length == 0) {
    throw new Error("graph has at least one cycle!");
  }

  dig_util_forEach(graph.sinks(), function(sink) {
    visit(sink);
  });

  return results;
}
dig.dot = {};
dig.dot.alg = {};
/*
 * Lays out the given graph.
 *
 * NOTE: this is a work in progress.
 */
dig.dot.layout = function(g) {
  var aux = g.copy();
  dig.dot.layout.rank(aux);
  dig.dot.layout.addDummyNodes(aux);
  dig.dot.layout.order(aux);
  dig.dot.layout.position()
    .graph(aux);

  dig_util_forEach(aux.nodes(), function(u) {
    if (g.hasNode(u)) {
      g.node(u).x = aux.node(u).x;
      g.node(u).y = aux.node(u).y;
    }
  });

  return aux;
}

/*
 * This function updates the given graph of ranked nodes to ensure that no
 * edge is longer than unit length. It acheives this by inserting dummy nodes
 * (marked by a dummy attribute) where necessary. For example, if rank(u) = 2
 * and rank(v) = 4 and there is an edge (u, v), this function will replace the
 * edge (u, v) with two edges (u, w), (w, v) so that no edge has a length
 * greater than 1. In this example, rank(w) = 1.
 *
 * This function does not preserve edge labels.
 */
dig.dot.layout.addDummyNodes = function(g) {
  dig_util_forEach(g.edges(), function(e) {
    var dummyCount = 1,
        prefix = "_d-" + e.from + "-" + e.to + "-",
        u = e.from,
        v = e.to,
        rankU = parseInt(g.node(u).rank),
        rankV = parseInt(g.node(v).rank),
        delta = rankU < rankV ? 1 : -1;
    g.removeEdge(u, v);
    for (rankU += delta; rankU != rankV; rankU += delta) {
      var w = prefix + dummyCount++;
      g.addNode(w, {rank: rankU, dummy: true});
      g.addEdge(u, w);
      u = w;
    }
    g.addEdge(u, v);
  });
}

/*
 * Helper function that creates a map that contains the order of nodes in a
 * particular layer.
 */
function dig_dot_layout_orderMap(g, layer) {
  var order = {};
  for (var i = 0; i < layer.length; ++i) {
    order[layer[i]] = i;
  }
  return order;
}
/*
 * This function searches through a ranked and ordered graph and counts the
 * number of edges that cross. This algorithm is derived from:
 *
 *    W. Barth et al., Bilayer Cross Counting, JGAA, 8(2) 179–194 (2004)
 */
dig.dot.layout.crossCount = (function() {
  dig_dot_layout_bilayerCrossCount = function(g, norths, souths) {
    var southPos = dig_dot_layout_orderMap(g, souths);

    var es = [];
    for (var i = 0; i < norths.length; ++i) {
      var curr = [];
      var u = norths[i];
      dig_util_forEach(g.neighbors(u, "both"), function(v) {
        // v may not be in southPos is the edge is to a layer other than souths
        if (v in southPos) {
          curr.push(southPos[v]);
        }
      });
      es = es.concat(dig_util_radixSort(curr, 1, function(_, x) { return x; }));
    }

    var firstIdx = 1;
    while (firstIdx < souths.length) {
      firstIdx <<= 1;
    }
    var treeSize = 2 * firstIdx - 1;
    firstIdx -= 1;
    var tree = [];
    for (var i = 0; i < treeSize; ++i) {
      tree[i] = 0;
    }

    var crosscount = 0;
    for (var i = 0; i < es.length; ++i) {
      var idx = es[i] + firstIdx;
      tree[idx]++;
      while (idx > 0) {
        if (idx % 2) {
          crosscount += tree[idx + 1];
        }
        idx = (idx - 1) >> 1;
        tree[idx]++;
      }
    }

    return crosscount;
  }

  return function(g, ranks) {
    var cc = 0;
    for (var i = 1; i < ranks.length; ++i) {
      cc += dig_dot_layout_bilayerCrossCount(g, ranks[i-1], ranks[i]);
    }
    return cc;
  }
})();
/*
 * Given a (possible cyclic) directed graph with ranked nodes, this function
 * will attempt to find an ordering of nodes in each rank that minimizes
 * overall edge crossings in the graph.
 *
 * Ordering will be returned as an array of ranks with each rank containing
 * an array of ordered nodes for the rank. This function will also set an
 * `order` attribute on each node in the graph.
 */
dig.dot.layout.order = (function() {
  /*
   * Returns an array of ranks where each rank has an array of nodes in the given
   * rank. This initial pass attempts to generate a good starting point from
   * which to generate an ordering with minimal edge crossings, but almost
   * certainly some iteration will reduce edge crossing.
   */
  function init(g) {
    // We currently use DFS as described in the graphviz paper.
    var ordering = [];
    var visited = {};

    function dfs(u) {
      if (u in visited) {
        return;
      }
      visited[u] = true;

      var rankNum = g.node(u).rank;
      if (!(rankNum in ordering)) {
        ordering[rankNum] = [];
      }
      ordering[rankNum].push(u);

      dig_util_forEach(g.successors(u), function(v) {
        dfs(v);
      });
    }

    dig_util_forEach(g.nodes(), function(u) {
      if (g.node(u).rank === 0) {
        dfs(u);
      }
    });

    return ordering;
  }

  function improveOrdering(g, i, ordering) {
    if (i % 2) {
      for (var j = 1; j < ordering.length; ++j) {
        ordering[j] = improveRankOrdering(g, ordering[j - 1], ordering[j]);
      }
    } else {
      for (var j = ordering.length - 2; j >= 0; --j) {
        ordering[j] = improveRankOrdering(g, ordering[j + 1], ordering[j]);
      }
    }
    return ordering;
  }

  /*
   * Given a fixed layer and a movable layer in a graph this function will
   * attempt to find an improved ordering for the movable layer such that
   * edge crossings may be reduced.
   *
   * This algorithm is based on the barycenter method.
   */
  function improveRankOrdering(g, fixed, movable) {
    var weights = rankWeights(g, fixed, movable);

    var result = [];

    var layer = movable.slice(0);
    
    // Move fixed nodes into the result array first
    for (var i = 0; i < layer.length; ++i) {
      var u = layer[i];
      if (weights[u] === -1) {
        result[i] = u;
        layer[i] = null;
      }
    }

    layer.sort(function(x, y) { return (x ? weights[x] : -1) - (y ? weights[y] : -1); });

    var nextIdx = 0;
    for (var i = 0; i < layer.length; ++i) {
      if (layer[i] !== null) {
        while (result[nextIdx] !== undefined) {
          ++nextIdx;
        }
        result[nextIdx] = layer[i];
      }
    }

    return result;
  }

  /*
   * Given a fixed layer and a movable layer in a graph, this function will
   * return weights for the movable layer that can be used to reorder the layer
   * for potentially reduced edge crossings.
   */
  function rankWeights(g, fixed, movable) {
    var fixedPos = dig_dot_layout_orderMap(g, fixed);
    var weights = {};
    for (var i = 0; i < movable.length; ++i) {
      var weight = -1;
      var u = movable[i];
      var sucs = g.neighbors(movable[i], "both");
      if (sucs.length > 0) {
        weight = 0;
        dig_util_forEach(sucs, function(v) {
          // Only calculate the weight if the node is in the fixed rank
          if (v in fixedPos) {
            weight = fixedPos[v];
          }
        });
        weight = weight / sucs.length;
      }
      weights[u] = weight;
    }
    return weights;
  }

  return function(g) {
    // TODO make this configurable
    var MAX_ITERATIONS = 24;

    var ordering = init(g);
    var bestOrdering = ordering;
    var bestCC = dig.dot.layout.crossCount(g, ordering);

    for (var i = 0; i < MAX_ITERATIONS; ++i) {
      ordering = improveOrdering(g, i, ordering);
      var cc = dig.dot.layout.crossCount(g, ordering);
      if (cc > bestCC) {
        bestOrdering = ordering;
        bestCC = cc;
      }
    }

    // Add order to node
    for (var i = 0; i < bestOrdering.length; ++i) {
      for (var j = 0; j < bestOrdering[i].length; ++j) {
        g.node(bestOrdering[i][j]).order = j;
      }
    }

    return bestOrdering;
  }
})();
dig.dot.layout.position = function() {
  var _nodeSep = 50;
  var _rankSep = 50;

  function nodeSep(newVal) {
    if (arguments.length > 0) {
      _nodeSep = newVal;
      return self;
    } else {
      return _nodeSep;
    }
  }

  function rankSep(newVal) {
    if (arguments.length > 0) {
      _rankSep = newVal;
      return self;
    } else {
      return _rankSep;
    }
  }

  function makeOrderArray(g) {
    var ordering = [];
    dig_util_forEach(g.nodes(), function(u) {
      var attrs = g.node(u);
      var rank = ordering[attrs.rank];
      if (rank === undefined) {
        rank = ordering[attrs.rank] = [];
      }
      rank[attrs.order] = u;
    });
    return ordering;
  }

  function makeOrderMap(ordering) {
    var map = {};
    for (var i = 0; i < ordering.length; ++i) {
      for (var j = 0; j < ordering[i].length; ++j) {
        map[ordering[i][j]] = {
          rank: i,
          order: j
        };
      }
    }
    return map;
  }

  function makeMedianMap(g, orderArray, orderMap) {
    var medianMap = findMedians(g, orderArray, orderMap);
    filterMedianConflicts(g, orderArray, orderMap, medianMap);
    return medianMap;
  }

  function findMedians(g, orderArray, orderMap) {
    var medians = {};
    dig_util_forEach(g.nodes(), function(u) {
      medians[u] = [];
    });

    var prevLayer = null;
    for (var i = 0; i < orderArray.length; ++i) {
      var currLayer = orderArray[i];
      if (prevLayer !== null) {
        for (var j = 0; j < currLayer.length; ++j) {
          var u = currLayer[j];
          var preds = [];
          dig_util_forEach(g.neighbors(u, "both"), function(v) {
            if (orderMap[v].rank === i - 1) {
              preds.push(v);
            }
          });
          var vs = dig_util_radixSort(preds,
                                      1,
                                      function(_, x) { return orderMap[x].order; });
          if (vs.length > 0) {
            var mid = (vs.length - 1) / 2;
            medians[u] = vs.slice(Math.floor(mid), Math.ceil(mid) + 1);
          }
        }
      }
      prevLayer = currLayer;
    }
    return medians;
  }

  function filterMedianConflicts(g, orderArray, orderMap, medianMap) {
    var prevLayer = null;
    for (var i = 0; i < orderArray.length; ++i) {
      var currLayer = orderArray[i];
      if (prevLayer !== null) {
        var prevStart = 0;
        var prevEnd;
        var currStart = 0;
        for (var currPos = 0; currPos < currLayer.length; ++currPos) {
          var u = currLayer[currPos];
          var inner = null;
          if (g.node(u).dummy) {
            dig_util_forEach(medianMap[u], function(v) {
              if (g.node(v).dummy) {
                inner = v;
              }
            });
          }
          if (currPos + 1 === currLayer.length || inner !== null) {
            prevEnd = prevLayer.length - 1;
            if (inner !== null) {
              prevEnd = orderMap[inner];
            }
            for (; currStart <= currPos; ++currStart) {
              u = currLayer[currStart];
              var meds = medianMap[u];
              for (var j = 0; j < meds.length; ++j) {
                var v = meds[j];
                var pos = orderMap[v].order;
                if ((pos < prevStart || pos > prevEnd) && !(g.node(u).dummy && g.node(v).dummy)) {
                  meds.splice(j, 1);
                  --j;
                }
              }
            }
            prevStart = prevEnd;
          }
        }
      }
      prevLayer = currLayer;
    }
  }

  function verticalAlignment(g, orderArray, orderMap, medianMap) {
    var root = {};
    dig_util_forEach(g.nodes(), function(u) { root[u] = u; });

    var align = {};
    dig_util_forEach(g.nodes(), function(u) { align[u] = u; });

    for (var i = 1; i < orderArray.length; ++i) {
      var r = -1;
      var prevLayer = orderArray[i - 1];
      var currLayer = orderArray[i];
      for (var j = 0; j < currLayer.length; ++j) {
        var v = currLayer[j];
        for (var k = 0; k < medianMap[v].length; ++k) {
          var u = medianMap[v][k];
          var uPos = orderMap[u].order;
          if (align[v] == v && r < uPos) {
            align[u] = v;
            align[v] = root[v] = root[u];
            r = uPos;
          }
        }
      }
    }
    return {
      root: root,
      align: align
    }
  }

  function horizontalCompaction(g, orderArray, orderMap, alignment) {
    var sink = {};
    dig_util_forEach(g.nodes(), function(v) { sink[v] = v; });

    var shift = {};
    dig_util_forEach(g.nodes(), function(v) { shift[v] = Number.POSITIVE_INFINITY; });

    var x = {};

    function placeBlock(v) {
      if (!x[v]) {
        x[v] = 0;
        var w = v;
        do
        {
          if (orderMap[w].order > 0) {
            var pred = orderArray[orderMap[w].rank][orderMap[w].order - 1];
            var u = alignment.root[pred];
            placeBlock(u);
            if (sink[v] === v) {
              sink[v] = sink[u];
            }
            if (sink[v] !== sink[u]) {
              shift[sink[u]] = Math.min(shift[sink[u]], x[v] - x[u] - g.node(u).width - _nodeSep);
            } else {
              x[v] = Math.max(x[v], x[u] + g.node(u).width + _nodeSep);
            }
          }
          w = alignment.align[w];
        } while (w !== v);
      }
    }

    dig_util_forEach(g.nodes(), function(u) {
      if (alignment.root[u] === u) {
        placeBlock(u);
      }
    });

    dig_util_forEach(g.nodes(), function(u) {
      x[u] = x[alignment.root[u]];
      var delta = shift[sink[alignment.root[u]]];
      if (delta < Number.POSITIVE_INFINITY) {
        x[u] = x[u] + delta;
      }
    });

    return x;
  }

  function flipOrderHoriz(ordering) {
    for (var i = 0; i < ordering.length; ++i) {
      ordering[i].reverse();
    }
  }

  function flipOrderVert(ordering) {
    ordering.reverse();
  }

  function flipPosition(g, orderArray, xs) {
    var maxCoord = Number.NEGATIVE_INFINITY;
    dig_util_forEach(g.nodes(), function(u) {
      var coord = xs[u] + g.node(u).width;
      if (coord > maxCoord) {
        maxCoord = coord;
      }
    });

    for (var i = 0; i < orderArray.length; ++i) {
      var rank = orderArray[i];
      var last = rank[rank.length - 1];
      for (var j = 0; j < rank.length; ++j) {
        var u = rank[j];
        xs[u] = maxCoord - xs[u] - g.node(u).width;
      }
    }
    return xs;
  }

  function flipMedians(medianMap) {
    for (var k in medianMap) {
      medianMap[k].reverse();
    }
  }

  function pass(g, orderArray, orderMap, medianMap) {
    var alignment = verticalAlignment(g, orderArray, orderMap, medianMap);
    return horizontalCompaction(g, orderArray, orderMap, alignment);
  }

  /*
   * Runs the position algorithm on the given graph with the configuration
   * set in the instance of the position algorithm.
   */
  function graph(g) {
    dig_util_forEach(g.nodes(), function(u) {
      g.node(u).y = _rankSep * g.node(u).rank;
      if (!("width" in g.node(u))) {
        g.node(u).width = g.node(u).dummy ? 1 : 50;
      }
    });

    var orderArray = makeOrderArray(g);
    var originalOrderArray = orderArray.slice(0);
    var xs = [];

    // Upper Left
    var orderMap = makeOrderMap(orderArray);
    var medianMap = makeMedianMap(g, orderArray, orderMap);
    xs.push(pass(g, orderArray, orderMap, medianMap));

    // Upper Right
    flipOrderHoriz(orderArray);
    orderMap = makeOrderMap(orderArray);
    flipMedians(medianMap);
    xs.push(flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap)));
    
    // Lower Right
    flipOrderVert(orderArray);
    orderMap = makeOrderMap(orderArray);
    medianMap = makeMedianMap(g, orderArray, orderMap);
    xs.push(flipPosition(g, originalOrderArray, pass(g, orderArray, orderMap, medianMap)));

    // Lower Left
    flipOrderHoriz(orderArray);
    orderMap = makeOrderMap(orderArray);
    flipMedians(medianMap);
    xs.push(pass(g, orderArray, orderMap, medianMap));

    dig_util_forEach(g.nodes(), function(u) {
      var xArray = [];
      for (var i = 0; i < xs.length; ++i) {
        xArray.push(xs[i][u]);
      }
      xArray.sort();
      g.node(u).x = (xArray[1] + xArray[2]) / 2;
    });
  }

  var self = {
    graph: graph,
    nodeSep: nodeSep,
    rankSep: rankSep
  }

  return self;
}
/*
 * This function takes a (possibly cyclic) directed graph as input and finds a
 * ranking for the nodes that satisfies all constraints. A ranking is used to
 * determine which nodes will be in the same layer.
 *
 * When this function completes each node `u` will have a `rank` attribute,
 * that can be retrieved using `g.node(u).rank`. Ranks start at 0.
 */
dig.dot.layout.rank = (function() {
  /*
   * This function modifies the supplied directed graph to make it acyclic by
   * reversing edges that participate in cycles. This algorithm currently uses
   * a basic DFS traversal.
   *
   * This algorithm does not preserve attributes.
   */
  function makeAcyclic(g) {
    var onStack = {};
    var visited = {};

    function dfs(u) {
      if (u in visited) {
        return;
      }
      visited[u] = true;
      onStack[u] = true;
      dig_util_forEach(g.successors(u), function(v) {
        if (v in onStack) {
          if (!g.hasEdge(v, u)) {
            g.addEdge(v, u);
          }
          g.removeEdge(u, v);
        } else {
          dfs(v);
        }
      });
      delete onStack[u];
    }

    dig_util_forEach(g.nodes(), function(u) {
      dfs(u);
    });
  };

  /*
   * Finds a feasible ranking (description below) for the given graph and assigns
   * a rank attribute to each node for that ranking.
   *
   * A feasible ranking is one such that for all edges e, length(e) >=
   * min_length(e). For our purposes min_length(e) is always 1 and length(e)
   * is defined as rank(v) - rank(u) for (u, v) = e.
   *
   * It is possible to improve the result of this function using either exact or
   * iterative heuristic methods.
   */
  function init(g) {
    var pq = new dig_data_PriorityQueue();
    dig_util_forEach(g.nodes(), function(u) {
      pq.add(u, g.indegree(u));
    });

    var current = [];
    var rankNum = 0;
    while (pq.size() > 0) {
      for (var min = pq.min(); pq.priority(min) === 0; min = pq.min()) {
        pq.removeMin();
        g.node(min).rank = rankNum;
        current.push(min);
      }

      if (current.length === 0) {
        throw new Error("Input graph is not acyclic!");
      }

      dig_util_forEach(current, function(u) {
        dig_util_forEach(g.successors(u), function(v) {
          pq.decrease(v, pq.priority(v) - 1);
        });
      });

      current = [];
      rankNum++;
    }
  };

  return function(g) { 
    if (!g.isDirected()) {
      throw new Error("Input graph must be directed!");
    }

    var aux = g.copy();
    makeAcyclic(aux);
    init(aux);
    dig_util_forEach(aux.nodes(), function(u) {
      g.node(u).rank = aux.node(u).rank;
    });
  }
})();
var dig_dot_read = dig.dot.read = function(dot) {
  var parseTree = dig_dot_parser.parse(dot);
  var graph = parseTree.type === "digraph" ? new dig.DiGraph() : new dig.UGraph();

  function handleStmt(stmt) {
    switch (stmt.type) {
      case "node":
        var id = stmt.id;
        graph.addNode(id, stmt.attrs);
        break;
      case "edge":
        var prev;
        dig_util_forEach(stmt.elems, function(elem) {
          handleStmt(elem);

          switch(elem.type) {
            case "node":
              if (prev) {
                graph.addEdge(prev, elem.id, stmt.attrs);
              }
              prev = elem.id; 
              break;
            default:
              // We don't currently support subgraphs incident on an edge
              throw new Error("Unsupported type incident on edge: " + elem.type);
          }
        });
        break;
      case "attr":
        // Ignore attrs
        break;
      default:
        throw new Error("Unsupported statement type: " + stmt.type);
    }
  }

  dig_util_forEach(parseTree.stmts, function(stmt) {
    handleStmt(stmt);
  });
  return graph;
}
var dig_dot_write = dig.dot.write = (function() {
  function id(obj) {
    return '"' + obj.toString().replace('"', '\\"') + '"';
  }

  function _writeNode(u, attrs) {
    var str = "    " + id(u);
    var hasAttrs = false;
    for (var k in attrs) {
      if (!hasAttrs) {
        str += ' [';
        hasAttrs = true;
      } else {
        str += ',';
      }
      str += id(k) + "=" + id(attrs[k]);
    }
    if (hasAttrs) {
      str += "]";
    }
    str += "\n";
    return str;
  }

  function _writeEdge(edgeConnector, u, v, attrs) {
    var str = "    " + id(u) + " " + edgeConnector + " " + id(v);
    var hasAttrs = false;
    for (var k in attrs) {
      if (!hasAttrs) {
        str += ' [';
        hasAttrs = true;
      } else {
        str += ',';
      }
      str += id(k) + "=" + id(attrs[k]);
    }
    if (hasAttrs) {
      str += "]";
    }
    str += "\n";
    return str;
  }

  return function(g) {
    var edgeConnector = g.isDirected() ? "->" : "--";
    var str = (g.isDirected() ? "digraph" : "graph") + " {\n";

    dig_util_forEach(g.nodes(), function(u) {
      str += _writeNode(u, g.node(u));
    });

    dig_util_forEach(g.edges(), function(e) {
      str += _writeEdge(edgeConnector, e.from, e.to, e.attrs);
    });

    str += "}\n";
    return str;
  };
})();
dig_dot_parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "stmtList": parse_stmtList,
        "stmt": parse_stmt,
        "attrStmt": parse_attrStmt,
        "inlineAttrStmt": parse_inlineAttrStmt,
        "nodeStmt": parse_nodeStmt,
        "edgeStmt": parse_edgeStmt,
        "subgraphStmt": parse_subgraphStmt,
        "attrList": parse_attrList,
        "attrListBlock": parse_attrListBlock,
        "aList": parse_aList,
        "edgeRHS": parse_edgeRHS,
        "idDef": parse_idDef,
        "nodeIdOrSubgraph": parse_nodeIdOrSubgraph,
        "nodeId": parse_nodeId,
        "port": parse_port,
        "compassPt": parse_compassPt,
        "id": parse_id,
        "node": parse_node,
        "edge": parse_edge,
        "graph": parse_graph,
        "digraph": parse_digraph,
        "subgraph": parse_subgraph,
        "strict": parse_strict,
        "graphType": parse_graphType,
        "whitespace": parse_whitespace,
        "comment": parse_comment,
        "_": parse__
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = [];
        result1 = parse__();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse__();
        }
        if (result0 !== null) {
          pos2 = pos;
          result1 = parse_strict();
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos2;
            }
          } else {
            result1 = null;
            pos = pos2;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_graphType();
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result4 = parse_id();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result5 = [];
                  result6 = parse__();
                  while (result6 !== null) {
                    result5.push(result6);
                    result6 = parse__();
                  }
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 123) {
                      result6 = "{";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"{\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = [];
                      result8 = parse__();
                      while (result8 !== null) {
                        result7.push(result8);
                        result8 = parse__();
                      }
                      if (result7 !== null) {
                        result8 = parse_stmtList();
                        result8 = result8 !== null ? result8 : "";
                        if (result8 !== null) {
                          result9 = [];
                          result10 = parse__();
                          while (result10 !== null) {
                            result9.push(result10);
                            result10 = parse__();
                          }
                          if (result9 !== null) {
                            if (input.charCodeAt(pos) === 125) {
                              result10 = "}";
                              pos++;
                            } else {
                              result10 = null;
                              if (reportFailures === 0) {
                                matchFailed("\"}\"");
                              }
                            }
                            if (result10 !== null) {
                              result11 = [];
                              result12 = parse__();
                              while (result12 !== null) {
                                result11.push(result12);
                                result12 = parse__();
                              }
                              if (result11 !== null) {
                                result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11];
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, type, id, stmts) {
                return {type: type, id: id, stmts: stmts};
              })(pos0, result0[2], result0[4], result0[8]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stmtList() {
        var result0, result1, result2, result3, result4, result5, result6, result7;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_stmt();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 59) {
              result2 = ";";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\";\"");
              }
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = [];
              pos2 = pos;
              result4 = [];
              result5 = parse__();
              while (result5 !== null) {
                result4.push(result5);
                result5 = parse__();
              }
              if (result4 !== null) {
                result5 = parse_stmt();
                if (result5 !== null) {
                  result6 = [];
                  result7 = parse__();
                  while (result7 !== null) {
                    result6.push(result7);
                    result7 = parse__();
                  }
                  if (result6 !== null) {
                    if (input.charCodeAt(pos) === 59) {
                      result7 = ";";
                      pos++;
                    } else {
                      result7 = null;
                      if (reportFailures === 0) {
                        matchFailed("\";\"");
                      }
                    }
                    result7 = result7 !== null ? result7 : "";
                    if (result7 !== null) {
                      result4 = [result4, result5, result6, result7];
                    } else {
                      result4 = null;
                      pos = pos2;
                    }
                  } else {
                    result4 = null;
                    pos = pos2;
                  }
                } else {
                  result4 = null;
                  pos = pos2;
                }
              } else {
                result4 = null;
                pos = pos2;
              }
              while (result4 !== null) {
                result3.push(result4);
                pos2 = pos;
                result4 = [];
                result5 = parse__();
                while (result5 !== null) {
                  result4.push(result5);
                  result5 = parse__();
                }
                if (result4 !== null) {
                  result5 = parse_stmt();
                  if (result5 !== null) {
                    result6 = [];
                    result7 = parse__();
                    while (result7 !== null) {
                      result6.push(result7);
                      result7 = parse__();
                    }
                    if (result6 !== null) {
                      if (input.charCodeAt(pos) === 59) {
                        result7 = ";";
                        pos++;
                      } else {
                        result7 = null;
                        if (reportFailures === 0) {
                          matchFailed("\";\"");
                        }
                      }
                      result7 = result7 !== null ? result7 : "";
                      if (result7 !== null) {
                        result4 = [result4, result5, result6, result7];
                      } else {
                        result4 = null;
                        pos = pos2;
                      }
                    } else {
                      result4 = null;
                      pos = pos2;
                    }
                  } else {
                    result4 = null;
                    pos = pos2;
                  }
                } else {
                  result4 = null;
                  pos = pos2;
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, rest) {
                var result = [first];
                for (var i = 0; i < rest.length; ++i) {
                    result.push(rest[i][1]);
                }
                return result;
              })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stmt() {
        var result0;
        
        result0 = parse_attrStmt();
        if (result0 === null) {
          result0 = parse_subgraphStmt();
          if (result0 === null) {
            result0 = parse_inlineAttrStmt();
            if (result0 === null) {
              result0 = parse_edgeStmt();
              if (result0 === null) {
                result0 = parse_nodeStmt();
              }
            }
          }
        }
        return result0;
      }
      
      function parse_attrStmt() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_graph();
        if (result0 === null) {
          result0 = parse_node();
          if (result0 === null) {
            result0 = parse_edge();
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_attrList();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, type, attrs) {
                return { type: "attr", attrType: type, attrs: attrs || {}};
              })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_inlineAttrStmt() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_id();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 61) {
              result2 = "=";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result4 = parse_id();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, k, v) {
                var attrs = {};
                attrs[k] = v;
                return { type: "inlineAttr", attrs: attrs };
              })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_nodeStmt() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_nodeId();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_attrList();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, id, attrs) { return {type: "node", id: id, attrs: attrs || {}}; })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_edgeStmt() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_nodeIdOrSubgraph();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_edgeRHS();
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result4 = parse_attrList();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, lhs, rhs, attrs) {
                var elems = [lhs];
                for (var i = 0; i < rhs.length; ++i) {
                    elems.push(rhs[i]);
                }
                return { type: "edge", elems: elems, attrs: attrs || {} };
              })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_subgraphStmt() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        result0 = parse_subgraph();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            pos3 = pos;
            result2 = parse_id();
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos3;
              }
            } else {
              result2 = null;
              pos = pos3;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos2;
            }
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 123) {
            result1 = "{";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"{\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse__();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse__();
            }
            if (result2 !== null) {
              result3 = parse_stmtList();
              if (result3 !== null) {
                result4 = [];
                result5 = parse__();
                while (result5 !== null) {
                  result4.push(result5);
                  result5 = parse__();
                }
                if (result4 !== null) {
                  if (input.charCodeAt(pos) === 125) {
                    result5 = "}";
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"}\"");
                    }
                  }
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, id, stmts) {
                id = id[2] || [];
                return { type: "subgraph", id: id[0], stmts: stmts };
              })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_attrList() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_attrListBlock();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = [];
          result3 = parse__();
          while (result3 !== null) {
            result2.push(result3);
            result3 = parse__();
          }
          if (result2 !== null) {
            result3 = parse_attrListBlock();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = [];
            result3 = parse__();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse__();
            }
            if (result2 !== null) {
              result3 = parse_attrListBlock();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, rest) {
                var result = first;
                for (var i = 0; i < rest.length; ++i) {
                    result = rightBiasedMerge(result, rest[i][1]);
                }
                return result;
              })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_attrListBlock() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 91) {
          result0 = "[";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_aList();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, aList) { return aList; })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_aList() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_idDef();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = [];
          result3 = parse__();
          while (result3 !== null) {
            result2.push(result3);
            result3 = parse__();
          }
          if (result2 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result3 = ",";
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            result3 = result3 !== null ? result3 : "";
            if (result3 !== null) {
              result4 = [];
              result5 = parse__();
              while (result5 !== null) {
                result4.push(result5);
                result5 = parse__();
              }
              if (result4 !== null) {
                result5 = parse_idDef();
                if (result5 !== null) {
                  result2 = [result2, result3, result4, result5];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = [];
            result3 = parse__();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse__();
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 44) {
                result3 = ",";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\",\"");
                }
              }
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result4 = [];
                result5 = parse__();
                while (result5 !== null) {
                  result4.push(result5);
                  result5 = parse__();
                }
                if (result4 !== null) {
                  result5 = parse_idDef();
                  if (result5 !== null) {
                    result2 = [result2, result3, result4, result5];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, rest) {
                var result = first;
                for (var i = 0; i < rest.length; ++i) {
                    result = rightBiasedMerge(result, rest[i][3]);
                }
                return result;
              })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_edgeRHS() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        if (input.substr(pos, 2) === "--") {
          result0 = "--";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"--\"");
          }
        }
        if (result0 !== null) {
          result1 = (function(offset) { return directed; })(pos) ? null : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 === null) {
          pos2 = pos;
          if (input.substr(pos, 2) === "->") {
            result0 = "->";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"->\"");
            }
          }
          if (result0 !== null) {
            result1 = (function(offset) { return directed; })(pos) ? "" : null;
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos2;
            }
          } else {
            result0 = null;
            pos = pos2;
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_nodeIdOrSubgraph();
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result4 = parse_edgeRHS();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, rhs, rest) {
                var result = [rhs];
                for (var i = 0; i < rest.length; ++i) {
                    result.push(rest[i]);
                }
                return result;
              })(pos0, result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_idDef() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_id();
        if (result0 !== null) {
          pos2 = pos;
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 61) {
              result2 = "=";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                result4 = parse_id();
                if (result4 !== null) {
                  result1 = [result1, result2, result3, result4];
                } else {
                  result1 = null;
                  pos = pos2;
                }
              } else {
                result1 = null;
                pos = pos2;
              }
            } else {
              result1 = null;
              pos = pos2;
            }
          } else {
            result1 = null;
            pos = pos2;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, k, v) {
                var result = {};
                result[k] = v[3];
                return result;
              })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_nodeIdOrSubgraph() {
        var result0;
        var pos0;
        
        result0 = parse_subgraphStmt();
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_nodeId();
          if (result0 !== null) {
            result0 = (function(offset, id) { return { type: "node", id: id, attrs: {} }; })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_nodeId() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_id();
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_port();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, id) { return id; })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_port() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse__();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse__();
          }
          if (result1 !== null) {
            result2 = parse_id();
            if (result2 !== null) {
              result3 = [];
              result4 = parse__();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse__();
              }
              if (result3 !== null) {
                pos1 = pos;
                if (input.charCodeAt(pos) === 58) {
                  result4 = ":";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\":\"");
                  }
                }
                if (result4 !== null) {
                  result5 = [];
                  result6 = parse__();
                  while (result6 !== null) {
                    result5.push(result6);
                    result6 = parse__();
                  }
                  if (result5 !== null) {
                    result6 = parse_compassPt();
                    if (result6 !== null) {
                      result4 = [result4, result5, result6];
                    } else {
                      result4 = null;
                      pos = pos1;
                    }
                  } else {
                    result4 = null;
                    pos = pos1;
                  }
                } else {
                  result4 = null;
                  pos = pos1;
                }
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos0;
                }
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_compassPt() {
        var result0;
        
        if (input.charCodeAt(pos) === 110) {
          result0 = "n";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"n\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 2) === "ne") {
            result0 = "ne";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"ne\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 101) {
              result0 = "e";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"e\"");
              }
            }
            if (result0 === null) {
              if (input.substr(pos, 2) === "se") {
                result0 = "se";
                pos += 2;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"se\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 115) {
                  result0 = "s";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"s\"");
                  }
                }
                if (result0 === null) {
                  if (input.substr(pos, 2) === "sw") {
                    result0 = "sw";
                    pos += 2;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"sw\"");
                    }
                  }
                  if (result0 === null) {
                    if (input.charCodeAt(pos) === 119) {
                      result0 = "w";
                      pos++;
                    } else {
                      result0 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"w\"");
                      }
                    }
                    if (result0 === null) {
                      if (input.substr(pos, 2) === "nw") {
                        result0 = "nw";
                        pos += 2;
                      } else {
                        result0 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"nw\"");
                        }
                      }
                      if (result0 === null) {
                        if (input.charCodeAt(pos) === 99) {
                          result0 = "c";
                          pos++;
                        } else {
                          result0 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"c\"");
                          }
                        }
                        if (result0 === null) {
                          if (input.charCodeAt(pos) === 95) {
                            result0 = "_";
                            pos++;
                          } else {
                            result0 = null;
                            if (reportFailures === 0) {
                              matchFailed("\"_\"");
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_id() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        if (/^[a-zA-Z\u0200-\u0377_]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z\\u0200-\\u0377_]");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[a-zA-Z\u0200-\u0377_0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\u0200-\\u0377_0-9]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[a-zA-Z\u0200-\u0377_0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[a-zA-Z\\u0200-\\u0377_0-9]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, fst, rest) { return fst + rest.join(""); })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 45) {
            result0 = "-";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          result0 = result0 !== null ? result0 : "";
          if (result0 !== null) {
            if (input.charCodeAt(pos) === 46) {
              result1 = ".";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\".\"");
              }
            }
            if (result1 !== null) {
              if (/^[0-9]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
              if (result3 !== null) {
                result2 = [];
                while (result3 !== null) {
                  result2.push(result3);
                  if (/^[0-9]/.test(input.charAt(pos))) {
                    result3 = input.charAt(pos);
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("[0-9]");
                    }
                  }
                }
              } else {
                result2 = null;
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, sign, dot, after) { return sign + dot + after.join(""); })(pos0, result0[0], result0[1], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 45) {
              result0 = "-";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"-\"");
              }
            }
            result0 = result0 !== null ? result0 : "";
            if (result0 !== null) {
              if (/^[0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
              if (result2 !== null) {
                result1 = [];
                while (result2 !== null) {
                  result1.push(result2);
                  if (/^[0-9]/.test(input.charAt(pos))) {
                    result2 = input.charAt(pos);
                    pos++;
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("[0-9]");
                    }
                  }
                }
              } else {
                result1 = null;
              }
              if (result1 !== null) {
                pos2 = pos;
                if (input.charCodeAt(pos) === 46) {
                  result2 = ".";
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\".\"");
                  }
                }
                if (result2 !== null) {
                  result3 = [];
                  if (/^[0-9]/.test(input.charAt(pos))) {
                    result4 = input.charAt(pos);
                    pos++;
                  } else {
                    result4 = null;
                    if (reportFailures === 0) {
                      matchFailed("[0-9]");
                    }
                  }
                  while (result4 !== null) {
                    result3.push(result4);
                    if (/^[0-9]/.test(input.charAt(pos))) {
                      result4 = input.charAt(pos);
                      pos++;
                    } else {
                      result4 = null;
                      if (reportFailures === 0) {
                        matchFailed("[0-9]");
                      }
                    }
                  }
                  if (result3 !== null) {
                    result2 = [result2, result3];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
                result2 = result2 !== null ? result2 : "";
                if (result2 !== null) {
                  result0 = [result0, result1, result2];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, sign, before, after) { return sign + before.join("") + (after[0] || "") + (after[1] || []).join(""); })(pos0, result0[0], result0[1], result0[2]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              if (input.charCodeAt(pos) === 34) {
                result0 = "\"";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\"\"");
                }
              }
              if (result0 !== null) {
                result1 = [];
                if (/^[^"]/.test(input.charAt(pos))) {
                  result2 = input.charAt(pos);
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("[^\"]");
                  }
                }
                while (result2 !== null) {
                  result1.push(result2);
                  if (/^[^"]/.test(input.charAt(pos))) {
                    result2 = input.charAt(pos);
                    pos++;
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("[^\"]");
                    }
                  }
                }
                if (result1 !== null) {
                  if (input.charCodeAt(pos) === 34) {
                    result2 = "\"";
                    pos++;
                  } else {
                    result2 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"\\\"\"");
                    }
                  }
                  if (result2 !== null) {
                    result0 = [result0, result1, result2];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, id) { return id.join(""); })(pos0, result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("identifier");
        }
        return result0;
      }
      
      function parse_node() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 4).toLowerCase() === "node") {
          result0 = input.substr(pos, 4);
          pos += 4;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"node\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_edge() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 4).toLowerCase() === "edge") {
          result0 = input.substr(pos, 4);
          pos += 4;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"edge\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_graph() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 5).toLowerCase() === "graph") {
          result0 = input.substr(pos, 5);
          pos += 5;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"graph\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_digraph() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 7).toLowerCase() === "digraph") {
          result0 = input.substr(pos, 7);
          pos += 7;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"digraph\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_subgraph() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 8).toLowerCase() === "subgraph") {
          result0 = input.substr(pos, 8);
          pos += 8;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"subgraph\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_strict() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 6).toLowerCase() === "strict") {
          result0 = input.substr(pos, 6);
          pos += 6;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"strict\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, k) { return k.toLowerCase(); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_graphType() {
        var result0;
        var pos0;
        
        result0 = parse_graph();
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_digraph();
          if (result0 !== null) {
            result0 = (function(offset, graph) {
                  directed = graph === "digraph";
                  return graph;
                })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_whitespace() {
        var result0, result1;
        
        reportFailures++;
        if (/^[ \t\r\n]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\r\\n]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[ \t\r\n]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[ \\t\\r\\n]");
              }
            }
          }
        } else {
          result0 = null;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = pos;
        if (input.substr(pos, 2) === "//") {
          result0 = "//";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"//\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^\n]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^\n]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\n]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          if (input.substr(pos, 2) === "/*") {
            result0 = "/*";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"/*\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            pos1 = pos;
            pos2 = pos;
            reportFailures++;
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              if (input.length > pos) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("any character");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
            while (result2 !== null) {
              result1.push(result2);
              pos1 = pos;
              pos2 = pos;
              reportFailures++;
              if (input.substr(pos, 2) === "*/") {
                result2 = "*/";
                pos += 2;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"*/\"");
                }
              }
              reportFailures--;
              if (result2 === null) {
                result2 = "";
              } else {
                result2 = null;
                pos = pos2;
              }
              if (result2 !== null) {
                if (input.length > pos) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("any character");
                  }
                }
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = pos1;
                }
              } else {
                result2 = null;
                pos = pos1;
              }
            }
            if (result1 !== null) {
              if (input.substr(pos, 2) === "*/") {
                result2 = "*/";
                pos += 2;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"*/\"");
                }
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("comment");
        }
        return result0;
      }
      
      function parse__() {
        var result0;
        
        result0 = parse_whitespace();
        if (result0 === null) {
          result0 = parse_comment();
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
          var directed;
      
          function rightBiasedMerge(lhs, rhs) {
              var result = {};
              for (var k in lhs) {
                  result[k] = lhs[k];
              }
              for (var k in rhs) {
                  result[k] = rhs[k];
              }
              return result;     
          }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
})();
