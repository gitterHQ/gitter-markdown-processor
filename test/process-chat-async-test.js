/* jshint node:true */
/* global describe:true, it:true, after:true */
"use strict";

var assert = require('assert');
var processChatAsync = require('../lib/process-chat-async');
var fs = require('fs');
var path = require('path');

describe('process-chat-async', function() {

  var dir = path.join(__dirname, 'markdown-conversions');

  var items = fs.readdirSync(dir);
  items.filter(function(file) {
    return /\.markdown$/.test(file);
  }).forEach(function(file) {
    var markdownFile = path.join(dir, file);
    var htmlFile = markdownFile.replace('.markdown', '.html');
    var markdown = fs.readFileSync(markdownFile, { encoding: 'utf8' });
    var expectedHtml = fs.readFileSync(htmlFile, { encoding: 'utf8' });

    it('should handle ' + file, function(done) {
      processChatAsync(markdown)
        .then(function(result) {
          var html = result.html;
          assert.equal(html.trim(), expectedHtml.trim());
        })
        .nodeify(done);
    });

  });

  it('should detect japanese', function(done) {
    processChatAsync("世界こんにちは、お元気ですか？")
      .then(function(result) {
        assert.equal(result.lang, 'ja');
      })
      .nodeify(done);
  });

  it('should detect korean', function(done) {
    processChatAsync("세계 안녕하세요, 어떻게 지내 ?")
      .then(function(result) {
        assert.equal(result.lang, 'ko');
      })
      .nodeify(done);
  });

  it('should detect russian', function(done) {
    processChatAsync("Привет мир , как ты?")
      .then(function(result) {
        assert.equal(result.lang, 'ru');
        return processChatAsync("1. Привет мир , как ты?");
      })
      .nodeify(done);
  });

  it('should detect chinese (simplified)', function(done) {
    processChatAsync("您好，欢迎来到小胶质")
      .then(function(result) {
        assert.equal(result.lang, 'zh');
      })
      .nodeify(done);
  });

  it('should detect chinese (traditional)', function(done) {
    processChatAsync("您好，歡迎來到小膠質")
      .then(function(result) {
        assert.equal(result.lang, 'zh-Hant');
      })
      .nodeify(done);
  });

  it('should detect afrikaans', function(done) {
    processChatAsync("hoe is jy meneer?")
      .then(function(result) {
        assert.equal(result.lang, 'af');
        return processChatAsync("## hoe is jy meneer?");
      })
      .then(function(result) {
        assert.equal(result.lang, 'af');
      })
      .nodeify(done);
  });

  it('should deal with unreliable text snippets', function(done) {
    return processChatAsync("あ、app/assets/javascripts/main.js は requirejs.config なんですか")
      .then(function(result) {
        assert.equal(result.lang, 'ja');
      })
      .nodeify(done);
  });

  it('should handle greek', function(done) {
    return processChatAsync("Μουλιάζουμε τα ξερά σύκα στο κρασί. Ζεσταίνουμε σε τηγάνι τη 1 κουτ. σούπας λάδι και σοτάρουμε το μπέικον, μέχρι να ροδίσει. Αλατοπιπερώνουμε και ρίχνουμε το χυμό λεμονιού,το υπόλοιπο λάδι και το σπανάκι. Ανακατεύουμε ίσα να λαδωθεί το σπανάκι και να μαραθεί λίγο. Στραγγίζουμε τα σύκα και τα ανακατεύουμε με το μείγμα του τηγανιού. Απλώνουμε τη σαλάτα πάνω στις φρυγανισμένες φέτες ψωμί και σερβίρουμε")
      .then(function(result) {
        assert.equal(result.lang, 'el');
      })
      .nodeify(done);
  });

});
