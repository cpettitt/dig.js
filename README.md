dig - Graph Algorithms for JavaScript
=====================================

dig is a library of graph algorithms for use with JavaScript.

Building
========

Before building this library you need to install the npm node package manager
[1].

Then follow these steps in this directory:

    $ npm install
    $ make

This will build two libraries in this directory: `dig.js` and `dig.min.js`. The
former is useful for debugging purposes, while the latter is compact and more
suitable for production use.

If you want to verify the integrity of the libraries, use:

    $ make test


[1]: http://npmjs.org/

Known Issues
============

This library will not work with versions of Internet Explorer earlier than IE
9. It uses the following functions which are known to be missing or not work
correctly:

- [`Object.defineProperty`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [`Array.forEach`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach)

License
=======

dig.js is licensed under the terms of the MIT License. See the LICENSE file
for details.
