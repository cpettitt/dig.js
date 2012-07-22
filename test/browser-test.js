/*
 * Basic testing for exposed modules and functions  when using the browser
 * version of this library.
 */

var assert = require('assert');

require('../dig.min.js')

describe('browser library', function() {
  it('should export all module and functions', function() {
    assert.ok(dig);
    assert.ok(dig.graph);
    assert.ok(dig.util);
    assert.ok(dig.alg.topsort);
  });
});
