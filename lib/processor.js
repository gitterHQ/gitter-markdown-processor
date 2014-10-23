/* jshint node:true */
"use strict";

var workerFarm = require('worker-farm');
var htmlencode = require('htmlencode');
var version = require('../package.json').version;

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
  this.farm(text, function(err, result) {
    if(err && err.type === 'TimeoutError') {
      result = {
        text: text,
        html: htmlencode.htmlEncode(text).replace(/\n|&#10;/g,'<br>'),
        urls: [],
        mentions: [],
        issues: [],
        markdownProcessingFailed: true
      };
    }

    callback(err, result);
  });
};

Processor.prototype.shutdown = function(callback) {
  workerFarm.end(this.farm, callback);
};

Processor.version = version;

module.exports = Processor;
