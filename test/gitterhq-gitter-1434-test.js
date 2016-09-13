/* jshint node:true */
/* global describe:true, it:true, after:true */
"use strict";

var assert = require('assert');
var processChat = require('../lib/process-chat');

describe('test-1434', function() {

  it('should handle not choke', function() {
    var html = processChat('> [foo (www.bar.org/bazquxpl/gar-1.2.ply)]').html;
    assert.equal(html.trim(), '<blockquote>\n[foo (www.bar.org/bazquxpl/gar-1.2.ply)]</blockquote>');
  });

});
