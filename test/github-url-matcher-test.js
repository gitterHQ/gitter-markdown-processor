/*jslint node:true, unused:true*/
/*global describe:true, it:true */
"use strict";

var assert = require('assert');
var matcher = require('../lib/github-url-matcher');

describe('github-url-matcher', function() {

  it('should match an issue url', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/issues/216');
    assert.equal(result.type, 'issue');
    assert.equal(result.repo, 'gitterHQ/gitter');
    assert.equal(result.id, '216');
    assert.equal(result.text, 'gitterHQ/gitter#216');
  });

  it('should match a pull request url', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/pull/1');
    assert.equal(result.type, 'issue');
    assert.equal(result.repo, 'gitterHQ/gitter');
    assert.equal(result.id, '1');
    assert.equal(result.text, 'gitterHQ/gitter#1');
  });

  it('shouldnt match an odd japanese issue url', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/issues/460]をマージしてもよろしいでしょうか？');
    assert(!result);
  });

  it('shouldnt match an odd issue url', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/issues/214]p');
    assert(!result);
  });

  it('should match a commit url', function() {
    var result = matcher('https://github.com/twbs/bootstrap/commit/c8a8e768510cc1bd9e72d5cade23fba715efb59f');
    assert.equal(result.type, 'commit');
    assert.equal(result.repo, 'twbs/bootstrap');
    assert.equal(result.id, 'c8a8e768510cc1bd9e72d5cade23fba715efb59f');
    assert.equal(result.text, 'twbs/bootstrap@c8a8e76');
  });

  it('shouldnt match an odd commit url', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/commit/xxxxxxxxxxxx');
    assert(!result);
  });

  it('shouldnt match an odd commit url with no hash', function() {
    var result = matcher('https://github.com/gitterHQ/gitter/commit/');
    assert(!result);
  });

});
