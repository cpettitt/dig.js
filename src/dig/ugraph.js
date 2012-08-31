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
