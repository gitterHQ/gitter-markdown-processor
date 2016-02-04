/*jshint node:true */
"use strict";

var cld = require('cld');
var Promise = require('bluebird');

module.exports = exports = function detectLang(text) {

  var options = {
    isHTML       : false,
    languageHint : 'en' // Todo: pass this through from the client headers
  };

  return Promise.fromCallback(function(callback) {
      cld.detect(text, callback);
    })
    .then(function(result) {
      if(!result || !result.languages || !Array.isArray(result.languages)) return;

      // Sometimes there are undefined values in the array
      // Seems to be when the result is unreliable
      var langs = result.languages.filter(function(f) {
        return !!f;
      });

      var primary = langs.shift();

      if(!primary) return;

      return primary.code;
    })
    .catch(function() {
      return; // Ignore errors
    });
};
