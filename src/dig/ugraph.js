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

    equals: function(ugraph) {
      return ugraph instanceof UGraph &&
             this.order() === ugraph.order() &&
             dig_util_all(this.nodes(), function(v) { return ugraph.hasNode(v); }) &&
             dig_util_all(this.edges(), function(e) { return ugraph.hasEdge(e.from, e.to); });
    },

    hasEdge: function(v, w) {
      return this._digraph.hasEdge.apply(this._digraph, _orderVertices(v, w));
    },

    addEdge: function(v, w) {
      return this._digraph.addEdge.apply(this._digraph, _orderVertices(v, w));
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
      var g = new dig.DiGraph();
      dig_util_forEach(this.nodes(), function(v) {
        g.addNode(v);
      });
      dig_util_forEach(this.edges(), function(e) {
        g.addEdge(e.from, e.to);
        g.addEdge(e.to, e.from);
      });
      return g;
    },

    undirected: function() {
      return this.copy();
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
  };

  _delegate("order", "size",
            "nodes", "hasNode", "addNode", "addNodes", "removeNode",
            "edges", "degree");

  return UGraph;
})();
