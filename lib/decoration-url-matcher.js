"use strict";

var url = require('url');

var URL_RE = /(?:\/(.*))+?\/(.*)\/(issues|merge_requests|pull|commit)\/([a-f0-9]+)$/;

function isValidIssueNumber(val) {
  var number = Number(val);
  return number > 0 && number < Infinity;
}

function isValidCommitHash(val) {
  var hash = val.match(/[a-f0-9]*/)[0] || '';
  return val.length === hash.length;
}

module.exports = function(href) {
  // https://github.com/gitterHQ/gitter/issues/1685
  // https://github.com/gitterHQ/gitter/pull/21
  // https://github.com/gitterHQ/ui-components/commit/ba64903a90bfaac2ac137af514e3dab62a302a5d
  //
  // https://gitlab.com/gitlab-org/gitter/webapp/issues/14
  // https://gitlab.com/gitlab-org/gitter/webapp/merge_requests/1075
  // https://gitlab.com/gitlab-org/gitter/styleguide/commit/6a61175e447548d9e1f3e5ed8e329d8578a38bb1
  var urlObj = url.parse(href);
  var pathMatches = urlObj.pathname.match(URL_RE);

  var isGitLab = urlObj.hostname === 'gitlab.com';
  var isGitHub = urlObj.hostname === 'github.com';

  if((isGitHub || isGitLab) && !urlObj.hash && pathMatches) {

    var group = pathMatches[1];
    var project = pathMatches[2];
    var pathType = pathMatches[3];
    var id = pathMatches[4];

    if((pathType === 'issues' || pathType === 'merge_requests' || pathType === 'pull') && id && isValidIssueNumber(id)) {
      var type = 'issue';
      if(project === 'issues') {
        type = 'issue';
      }
      else if(pathType === 'merge_requests') {
        type = 'mr';
      }
      else if(pathType === 'pull') {
        type = 'pr';
      }

      return {
        type: type,
        provider: isGitLab ? 'gitlab' : 'github',
        repo: group + '/' + project,
        id: id,
        href: href,
        text: group + '/' + project + (isGitLab && type === 'mr' ? '!' : '#') + id
      };
    } else if(pathType === 'commit' && id && isValidCommitHash(id)) {
      return {
        type: 'commit',
        provider: isGitLab ? 'gitlab' : 'github',
        repo: group + '/' + project,
        id: id,
        href: href,
        text: group + '/' + project + '@' + id.substring(0,7)
      };
    }
  }

};
