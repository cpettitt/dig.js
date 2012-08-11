dig.DiGraph = (function() {
  function _safeGetNode(graph, node) {
    var nodes = graph._nodes;
    if (!(node in nodes)) {
      throw new Error("Node not in graph: " + node);
    }
    return nodes[node];
  }

  function DiGraph() {
    var nodes = this._nodes = {};
    this._order = 0;
    this._size = 0;
  }

  DiGraph.prototype = {
    order: function() {
      return this._order;
    },

    size: function() {
      return this._size;
    },

    equals: function(digraph) {
      return digraph instanceof DiGraph &&
             this.order() === digraph.order() &&
             dig_util_all(this.nodes(), function(v) { return digraph.hasNode(v); }) &&
             dig_util_all(this.edges(), function(e) { return digraph.hasEdge(e.from, e.to); });
    },

    copy: function() {
      var g = new DiGraph();
      dig_util_forEach(this.nodes(), function(v) {
        g.addNode(v);
      });
      dig_util_forEach(this.edges(), function(e) {
        g.addEdge(e.from, e.to);
      });
      return g;
    },

    nodes: function() {
      return dig_util_objToArr(this._nodes);
    },

    hasNode: function(node) {
      return node in this._nodes;
    },

    addNode: function(node) {
      if (!this.hasNode(node)) {
        this._nodes[node] = {
          predecessors: {},
          successors: {}
        };
        this._order++;
        return true;
      }
      return false;
    },

    addNodes: function() {
      for (var i = 0; i < arguments.length; ++i) {
        this.addNode(arguments[i]);
      }
    },

    removeNode: function(node) {
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
      for (var i in this._nodes) {
        for (var j in this._nodes[i].successors) {
          edges.push({from: i, to: j});
        };
      };
      return edges;
    },

    hasEdge: function(from, to) {
      return this.hasNode(from) && to in this._nodes[from].successors;
    },

    addEdge: function(from, to) {
      var fromNode = _safeGetNode(this, from);
      var toNode = _safeGetNode(this, to);
      if (!this.hasEdge(from, to)) {
        fromNode.successors[to] = true;
        toNode.predecessors[from] = true;
        this._size++;
        return true;
      }
      return false;
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

    removeEdge: function(from, to) {
      if (this.hasEdge(from, to)) {
        delete this._nodes[from].successors[to];
        delete this._nodes[to].predecessors[from];
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
      return dig_util_objToArr(_safeGetNode(this, node).predecessors);
    },

    successors: function(node) {
      return dig_util_objToArr(_safeGetNode(this, node).successors);
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

      return dig_util_objToArr(obj);
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

    directed: function() {
      return this.copy();
    },

    undirected: function() {
      var g = new dig.UGraph();
      dig_util_forEach(this.nodes(), function(v) {
        g.addNode(v);
      });
      dig_util_forEach(this.edges(), function(e) {
        g.addEdge(e.from, e.to);
      });
      return g;
    },
  };
  return DiGraph;
})();
