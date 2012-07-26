/*
 * Basic testing for exposed modules and functions  when using the browser
 * version of this library.
 */

var assert = require('assert');

describe('browser library', function() {
  it('should export all module and functions', function() {
    require('../dig.min.js');

    assert.notEqual(undefined, dig);
    assert.notEqual(undefined, dig.util);
    assert.notEqual(undefined, dig.data);
    assert.notEqual(undefined, dig.graph);
    assert.notEqual(undefined, dig.alg);
    assert.notEqual(undefined, dig.alg.sp);
  });
});
