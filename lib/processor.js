/* jshint node:true */
"use strict";

var workerFarm    = require('worker-farm');
var shutdown      = require('shutdown');
var Q             = require('q');
var StatusError   = require('statuserror');
var htmlencode    = require('htmlencode');

var Processor = function() {
  this.farm = workerFarm({
      maxConcurrentWorkers: 1,
      maxConcurrentCallsPerWorker: 1,
      maxCallTime: 3000
    },
    require.resolve('./process-chat-async')
  );
};

Processor.prototype.process = function(text, callback) {
  var d = Q.defer();
  this.farm(text, d.makeNodeResolver());

  return d.promise
    .fail(function(err) {

      if(err.type === 'TimeoutError') {
        var newError = new StatusError(500, "Markdown processing failed");

        var html = htmlencode.htmlEncode(text);
        html = html.replace(/\n|&#10;/g,'<br>');
        return {
          text: text,
          html: html,
          urls: [],
          mentions: [],
          issues: [],
          markdownProcessingFailed: true
        };
      }
      throw err;
    })
    .nodeify(callback);
};

Processor.prototype.shutdown = function(callback) {
  workerFarm.end(this.farm, callback);
};

module.exports = Processor;
