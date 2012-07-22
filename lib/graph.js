/*
 * The core graph library.
 */
(function() {
  if (typeof module !== 'undefined') {
    module.exports = graph;
  } else {
    dig.graph = graph;
  }

  function numKeys(obj) {
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

  // TODO Allow non-use of Object.defineProperty for older browsers

  function graph() {
    var _nextId = 0;
    var _nodes = [];
    var _edges = {};

    function _makeSet(arr) {
      arr.sort();
      var prev;
      return arr.filter(function(elem) {
        if (elem === prev) {
          return false;
        }
        prev = elem;
        return true;
      });
    }

    function _assignId(n) {
      if (!n.hasOwnProperty("_digId")) {
        Object.defineProperty(n, "_digId", {value: _nextId++});
      }
    }

    function _edgeId(from, to, label) {
      return from._digId + "->" + to._digId + "(" + label + ")";
    }

    function _adjId(node, label) {
      return node._digId + "(" + label + ")";
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
        throw new Error("Node is not in graph: " + n);
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

    function addEdge(from, to, label) {
      var edge = {
        from: from,
        to: to
      };

      if (arguments.length >= 3) {
        edge.label = label;
      }

      if (containsEdge(from, to, label)) {
        throw new Error("Edge already exists. From: " + from + " to: " + to + " label: " + label);
      };
      _checkContainsNode(from);
      _checkContainsNode(to);

      _edges[_edgeId(from, to, label)] = edge;

      _nodes[from._digId].outEdges[_adjId(to, label)] = edge;
      _nodes[to._digId].inEdges[_adjId(from, label)] = edge;

      return graph;
    }

    function removeEdge(from, to, label) {
      if (!containsEdge(from, to, label)) {
        throw new Error("Edge does not exist. From: " + from + " to: " + to + " label: " + label);
      }

      var edgeId = _edgeId(from, to, label);
      delete _edges[edgeId];

      delete _nodes[from._digId].outEdges[_adjId(to, label)];
      delete _nodes[to._digId].inEdges[_adjId(from, label)];
      
      return graph;
    }

    function edges() {
      var edges = [];
      for (var e in _edges) {
        edges.push(_copyEdge(_edges[e]));
      }
      return edges;
    }

    function containsEdge(from, to, label) {
      return _edgeId(from, to, label) in _edges;
    }

    function inEdges(n) {
      return _incidentEdges(n, "inEdges");
    }

    function indegree(n) {
      return numKeys(_nodes[n._digId].inEdges);
    }

    function outEdges(n) {
      return _incidentEdges(n, "outEdges");
    }

    function outdegree(n) {
      return numKeys(_nodes[n._digId].outEdges);
    }

    function degree(n) {
      return indegree(n) + outdegree(n);
    }

    function predecessors(n) {
      return _makeSet(inEdges(n).map(function(e) { return e.from; }));
    }

    function successors(n) {
      return _makeSet(outEdges(n).map(function(e) { return e.to; }));
    }

    function neighbors(n) {
      return _makeSet(predecessors(n).concat(successors(n)));
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
        graph.addEdge(e.from, e.to);
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
})();
