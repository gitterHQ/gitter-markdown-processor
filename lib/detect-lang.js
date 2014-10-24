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

    if(!result || !result.languages || !result.languages.length) return d.resolve();

    var primary = result.languages[0];
    return d.resolve(primary.code);
  });

  return d.promise;
};
