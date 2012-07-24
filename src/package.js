require('../lib/dig.js');

var sys = require('sys');

sys.puts(JSON.stringify({
  "name": "dig",
  "version": dig.version,
  "description": "Graph algorithms",
  "main": "index.js",
  "directories": {
    "src": "src",
    "test": "test"
  },
  "scripts": {
    "test": "mocha -R spec"
  },
  "keywords": [
    "graph",
    "algorithms"
  ],
  "devDependencies": {
    "mocha": "1.2.x",
    "uglify-js": "1.3.x"
  },
  "author": "Chris Pettitt <chris@samsarin.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/cpettitt/dig.js.git"
  },
  "license": "MIT"
}, null, 2));