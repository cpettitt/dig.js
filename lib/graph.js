/*
 * The core graph library.
 */
dig.graph = (function() {
  function _numKeys(obj) {
    if (typeof Object.keys !== undefined) {
      return Object.keys(obj).length;
    }

    var count = 0;
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        count++;
      }
    }
    return count;
  }

  function graph() {
    var _nextId = 0;
    var _nodes = [];
    var _edges = {};

    function _assignId(n) {
      if (!n.hasOwnProperty("_digId")) {
        Object.defineProperty(n, "_digId", {value: _nextId++});
      }
    }

    function _edgeId(from, to) {
      return from._digId + "->" + to._digId
    }

    function _adjId(node) {
      return node._digId;
    }

    function _copyEdge(e) {
      var copy = {
        from: e.from,
        to: e.to
      };
      if ("label" in e) {
        copy.label = e.label;
      }
      return copy;
    }

    function _incidentEdges(n, type) {
      var edges = [];
      var incidents = _nodes[n._digId][type];
      for (var i in incidents) {
        edges.push(_copyEdge(incidents[i]));
      }
      return edges;
    }

    function _checkContainsNode(n) {
      if (!containsNode(n)) {
        throw new Error("Node is not in graph: " + JSON.stringify(n));
      }
    }

    function _checkContainsEdge(from, to) {
      if (!containsEdge(from, to)) {
        throw new Error("Edge is not in graph. From: " + JSON.stringify(from) + " to: " + JSON.stringify(to));
      }
    }

    function addNodes(ns) {
      ns.forEach(function(n) {
        addNode(n);
      });
      return this;
    }

    function addNode(n) {
      if (containsNode(n)) {
        throw new Error("Node is already contained in graph: " + n);
      }

      _assignId(n);
      _nodes[n._digId] = {
        node: n,
        inEdges: {},
        outEdges: {} 
      };
      return graph;
    }

    function removeNode(n) {
      _checkContainsNode(n);

      var node = _nodes[n._digId];
      for (var a in node.inEdges) {
        var edge = node.inEdges[a];
        removeEdge(edge.from, edge.to, edge.label);
      }
      for (var a in node.outEdges) {
        var edge = node.outEdges[a];
        removeEdge(edge.from, edge.to, edge.label);
      }
      delete _nodes[n._digId];

      return graph;
    }

    function nodes() {
      var nodes = [];
      _nodes.forEach(function(n) { nodes.push(n.node); });
      return nodes;
    }

    function containsNode(n) {
      return n._digId in _nodes;
    }

    /*
     * Adds an edge to the graph with an optional label. If an edge already
     * edists between `from` and `to` then this function will throw an error.
     * Use `addOrUpdateEdge` to safely add or update an edge without throwing an
     * error.
     *
     * If the given label is not specified or is left `undefined` then calls to
     * `getEdge(from, to)` will return `undefined`. The label can be changed
     * later using `updateEdge` or `addOrUpdateEdge`.
     *
     * This method returns the graph to allow for function chaining.
     */
    function addEdge(from, to, label) {
      if (containsEdge(from, to)) {
        throw new Error("Edge already exists. From: " + JSON.stringify(from) + " to: " + JSON.stringify(to));
      };
      return addOrUpdateEdge(from, to, label);
    }

    /*
     * Returns the label associated with the edge from the `from` node to the
     * `to` node. If no such edge exists, this function returns `undefined`.
     * Note, however, that this function will also return `undefined` when
     * there is an edge with no label. Use `containsEdge` to distinguish
     * between these cases.
     */
    function getEdge(from, to) {
      var edge = _edges[_edgeId(from, to)];
      if (edge) {
        return edge.label;
      }
    }

    /*
     * Updates the label for an edge that already exists. If the edge does not
     * exists this function will throw an error. Use `addOrUpdateEdge` to
     * safely add or change an edge without raising an error.
     *
     * If the given label is not specified or is left `undefined` then calls to
     * `getEdge(from, to)` will return `undefined`.
     *
     * This function returns the graph to allow for function chaining.
     */
    function updateEdge(from, to, label) {
      _checkContainsEdge(from, to);
      return addOrUpdateEdge(from, to, label);
    }

    /*
     * Adds or updates an edge.
     *
     * If the given label is not specified or is left `undefined` then calls to
     * `getEdge(from, to)` will return `undefined`.
     *
     * This function returns the graph to allow for function chaining.
     */
    function addOrUpdateEdge(from, to, label) {
      var edge = _edges[_edgeId(from, to)];
      if (!edge) {
        edge = {
          from: from,
          to: to
        };
        _checkContainsNode(from);
        _checkContainsNode(to);

        _edges[_edgeId(from, to)] = edge;
        _nodes[from._digId].outEdges[_adjId(to)] = edge;
        _nodes[to._digId].inEdges[_adjId(from)] = edge;
      }

      if (label !== undefined) {
        edge.label = label;
      } else {
        delete edge.label;
      }

      return graph;
    }

    /*
     * Removes the specified edge, if it exists. If it does not exist, this
     * function will throw an error. Use `containsEdge` if you're not sure if
     * the edge exists.
     *
     * This function returns the graph to allow for function chaining.
     */
    function removeEdge(from, to) {
      _checkContainsEdge(from, to);

      var edgeId = _edgeId(from, to);
      delete _edges[edgeId];

      delete _nodes[from._digId].outEdges[_adjId(to)];
      delete _nodes[to._digId].inEdges[_adjId(from)];
      
      return graph;
    }


    function edges() {
      var edges = [];
      for (var e in _edges) {
        edges.push(_copyEdge(_edges[e]));
      }
      return edges;
    }

    function containsEdge(from, to) {
      return _edgeId(from, to) in _edges;
    }

    function inEdges(n) {
      return _incidentEdges(n, "inEdges");
    }

    function indegree(n) {
      return _numKeys(_nodes[n._digId].inEdges);
    }

    function outEdges(n) {
      return _incidentEdges(n, "outEdges");
    }

    function outdegree(n) {
      return _numKeys(_nodes[n._digId].outEdges);
    }

    function degree(n) {
      return indegree(n) + outdegree(n);
    }

    function predecessors(n) {
      return inEdges(n).map(function(e) { return e.from; });
    }

    function successors(n) {
      return outEdges(n).map(function(e) { return e.to; });
    }

    function neighbors(n) {
      return predecessors(n).concat(successors(n));
    }

    function sources() {
      var sources = [];
      nodes().forEach(function(node) {
        if (indegree(node) === 0) {
          sources.push(node);
        }
      });
      return sources;
    }

    function sinks() {
      var sinks = [];
      nodes().forEach(function(node) {
        if (outdegree(node) === 0) {
          sinks.push(node);
        }
      });
      return sinks;
    }

    function copy() {
      var graph = dig.graph();
      graph.addNodes(nodes());
      edges().forEach(function(e) {
        graph.addEdge(e.from, e.to, e.label);
      });
      return graph;
    }

    var graph = {
      addNodes: addNodes,
      addNode: addNode,
      removeNode: removeNode,
      nodes: nodes,
      containsNode: containsNode,
      addEdge: addEdge,
      getEdge: getEdge,
      updateEdge: updateEdge,
      addOrUpdateEdge: addOrUpdateEdge,
      removeEdge: removeEdge,
      edges: edges,
      containsEdge: containsEdge,
      inEdges: inEdges,
      indegree: indegree,
      outEdges: outEdges,
      outdegree: outdegree,
      degree: degree,
      predecessors: predecessors,
      successors: successors,
      neighbors: neighbors,
      sources: sources,
      sinks: sinks,
      copy: copy
    };

    return graph;
  };

  return graph;
})();
