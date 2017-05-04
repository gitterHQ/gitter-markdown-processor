/* jshint node:true */
/* global describe:true, it:true, after:true */
"use strict";

var assert = require('assert');
var processChat = require('../lib/process-chat');
var fs = require('fs');
var path = require('path');

describe('process-chat', function() {

  var dir = path.join(__dirname, 'markdown-conversions');

  var items = fs.readdirSync(dir);
  items.filter(function(file) {
    return /\.markdown$/.test(file);
  }).forEach(function(file) {
    var markdownFile = path.join(dir, file);
    var htmlFile = markdownFile.replace('.markdown', '.html');
    var markdown = fs.readFileSync(markdownFile, { encoding: 'utf8' });
    var expectedHtml = fs.readFileSync(htmlFile, { encoding: 'utf8' });
    it('should handle ' + file, function() {
      var html = processChat(markdown).html;
      assert.equal(html.trim(), expectedHtml.trim());
    });

  });

  it('should isolate link references between messages', function() {
    var inputMd1 = '[Community for developers to chat][1]\n\n[1]: https://gitter.im/';
    var inputMd2 = 'arr[1]';
    var html1 = processChat(inputMd1).html;
    assert.equal(html1.trim(), '<a href="https://gitter.im/" rel="nofollow noopener noreferrer" target="_blank" class="link">Community for developers to chat</a>');
    var html2 = processChat(inputMd2).html;
    assert.equal(html2.trim(), 'arr[1]');
  });


});
