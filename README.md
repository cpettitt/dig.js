dig - Graph Algorithms for JavaScript
=====================================

dig is a library of graph algorithms for use with JavaScript.

Building
========

[![Build Status](https://secure.travis-ci.org/cpettitt/dig.js.png)](http://travis-ci.org/cpettitt/dig.js)

Before building this library you need to install the npm node package manager
[1].

Then follow these steps in this directory:

    $ make

This will build two libraries in this directory: `dig.js` and `dig.min.js`. The
former is useful for debugging purposes, while the latter is compact and more
suitable for production use.

If you want to verify the integrity of the libraries, use:

    $ make test


[1]: http://npmjs.org/

License
=======

dig.js is licensed under the terms of the MIT License. See the LICENSE file
for details.
