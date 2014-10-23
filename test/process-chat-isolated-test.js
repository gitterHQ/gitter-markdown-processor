/* jshint node:true */
/* global describe:true, it:true, after:true */
"use strict";

var assert = require('assert');
var processChat = require('..');
var fs = require('fs');
var path = require('path');

function listTestPairs() {
  var dir = path.join(__dirname, 'markdown-conversions');

  var items = fs.readdirSync(dir);
  return items.filter(function(file) {
    return /\.markdown$/.test(file);
  }).map(function(file) {
    var markdownFile = path.join(dir, file);
    var name = file.replace('.markdown', '');
    var htmlFile = markdownFile.replace('.markdown', '.html');
    var markdown = fs.readFileSync(markdownFile, { encoding: 'utf8' });
    var expectedHtml = fs.readFileSync(htmlFile, { encoding: 'utf8' });

    return {
      name: name,
      markdownFile: markdownFile,
      htmlFile: htmlFile,
      markdown: markdown,
      expectedHtml: expectedHtml
    };



  });
}

describe('process-chat', function() {
  after(function(callback) {
    processChat.testOnly.shutdown(callback);
  });

  describe('tests', function() {
    listTestPairs().forEach(function(item) {
      it('should handle ' + item.name, function(done) {
        processChat(item.markdown, function(err, result) {
          if(err) return done(err);

          var html = result.html;
          assert.equal(html.trim(), item.expectedHtml.trim());
          done();
        });
      });
    });
  });

  describe.skip('performance tests', function() {
    listTestPairs().forEach(function(item) {
      it('should handle ' + item.name, function(done) {
        var completed = 0;
        for(var i = 0; i < 1000; i++) {
          processChat(item.markdown, function(err, result) {
            completed++;
            if(err) return done(err);

            var html = result.html;
            assert.equal(html.trim(), item.expectedHtml.trim());

            if(completed === 1000) return done();
          });

        }
      });
    });

  });

});
