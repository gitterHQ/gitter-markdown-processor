/*jslint node:true, unused:true*/
/*global describe:true, it:true */
"use strict";

var assert = require('assert');
var matcher = require('../lib/decoration-url-matcher');

describe('decoration-url-matcher', function() {

  describe('GitLab', function() {
    it('should match an issue url', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/issues/216');
      assert.equal(result.type, 'issue');
      assert.equal(result.provider, 'gitlab');
      assert.equal(result.repo, 'gitlab-org/gitlab-ce');
      assert.equal(result.id, '216');
      assert.equal(result.text, 'gitlab-org/gitlab-ce#216');
    });

    it('should match an issue url in a sub-group', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitter/webapp/issues/1755');
      assert.equal(result.type, 'issue');
      assert.equal(result.provider, 'gitlab');
      assert.equal(result.repo, 'gitlab-org/gitter/webapp');
      assert.equal(result.id, '1755');
      assert.equal(result.text, 'gitlab-org/gitter/webapp#1755');
    });

    it('shouldnt match an issue url with non-numeric ID', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/issues/abc');
      assert(!result);
    });

    it('should match a merge request url', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/1');
      assert.equal(result.type, 'mr');
      assert.equal(result.provider, 'gitlab');
      assert.equal(result.repo, 'gitlab-org/gitlab-ce');
      assert.equal(result.id, '1');
      assert.equal(result.text, 'gitlab-org/gitlab-ce!1');
    });

    it('shouldnt match a merge request url without ID', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/');
      assert(!result);
    });

    it('should match a commit url', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/commit/eb9ca0e7e1ea4c2151abc320199e844f794bda54');
      assert.equal(result.type, 'commit');
      assert.equal(result.provider, 'gitlab');
      assert.equal(result.repo, 'gitlab-org/gitlab-ce');
      assert.equal(result.id, 'eb9ca0e7e1ea4c2151abc320199e844f794bda54');
      assert.equal(result.text, 'gitlab-org/gitlab-ce@eb9ca0e');
    });

    it('shouldnt match an odd commit url', function() {
      var result = matcher('https://gitlab.com/gitlab-org/gitlab-ce/commit/xxxxxxxxxxxx');
      assert(!result);
    });
  });

  describe('GitHub', function() {
    it('should match an issue url', function() {
      var result = matcher('https://github.com/gitterHQ/gitter/issues/216');
      assert.equal(result.type, 'issue');
      assert.equal(result.provider, 'github');
      assert.equal(result.repo, 'gitterHQ/gitter');
      assert.equal(result.id, '216');
      assert.equal(result.text, 'gitterHQ/gitter#216');
    });

    it('should match a pull request url', function() {
      var result = matcher('https://github.com/gitterHQ/gitter/pull/1');
      assert.equal(result.type, 'pr');
      assert.equal(result.provider, 'github');
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
      assert.equal(result.provider, 'github');
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
});
