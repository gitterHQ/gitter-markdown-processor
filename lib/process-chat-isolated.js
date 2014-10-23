/* jshint node:true */
"use strict";

var workerFarm    = require('worker-farm');
var shutdown      = require('shutdown');
var Q             = require('q');
var StatusError   = require('statuserror');
var htmlencode    = require('htmlencode');

var farm;

function startWorkerFarm() {
  farm = workerFarm({
      maxConcurrentWorkers: 1,
      maxConcurrentCallsPerWorker: 1,
      maxCallTime: 3000
    },
    require.resolve('./process-chat-async'));

  shutdown.addHandler('markdown_cluster', 1, function(callback) {
    shutdownFarm(callback);
  });

}

function processChatIsolated(text, callback) {
  if(!farm) startWorkerFarm();

  var d = Q.defer();
  farm(text, d.makeNodeResolver());

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
}

function shutdownFarm(callback) {
  if(farm) {
    workerFarm.end(farm, callback);
    farm = null;
  } else {
    setImmediate(callback);
  }
}

processChatIsolated.testOnly = {
  shutdown: function(done) {
    shutdownFarm(function() {
      setTimeout(done, 150);
        // Add an extra time on cos mocha will just exit without waiting
        // for the child to shutdown
    });
  }
};

module.exports = exports = processChatIsolated;
