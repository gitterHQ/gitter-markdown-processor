/*jshint node:true */
"use strict";

var cld = require('cld');
var Q = require('q');

module.exports = exports = function detectLang(text) {
  var d = Q.defer();

  var options = {
    isHTML       : false,
    languageHint : 'en' // Todo: pass this through from the client headers
  };

  cld.detect(text, function(err, result) {
    if(err) return d.resolve(); // Ignore errors

    if(!result || !result.languages || !Array.isArray(result.languages)) return d.resolve();

    // Sometimes there are undefined values in the array
    // Seems to be when the result is unreliable
    var langs = result.languages.filter(function(f) {
      return !!f;
    });

    var primary = langs.shift();

    if(!primary) return d.resolve();

    return d.resolve(primary.code);
  });

  return d.promise;
};
