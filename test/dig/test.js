assert = require('assert');

assert.notOk = function(value, message) {
  assert.equal(false, value, message);
};

require_src = function(path) {
  require('../../src/' + path);
}

dig ={};
