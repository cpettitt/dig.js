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
