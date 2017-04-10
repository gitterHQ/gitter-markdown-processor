/*jshint globalstrict:true, trailing:false, unused:true, node:true */
"use strict";

var marked    = require('gitter-marked');
var highlight = require('highlight.js');
var _         = require('underscore');
var util      = require('util');
var katex     = require('katex');
var matcher   = require('./github-url-matcher');
var htmlencode = require('htmlencode');

var options = { gfm: true, tables: true, sanitize: true, breaks: true, linkify: true, skipComments: true };

var lexer = new marked.Lexer(options);

var JAVA =  'java';
var SCRIPT = 'script:';
var scriptUrl = JAVA + SCRIPT;
var dataUrl = 'data:';
var httpUrl = 'http://';
var httpsUrl = 'https://';
var noProtocolUrl = '//';

highlight.configure( { classPrefix: '', languages : [
  "apache",
  "applescript",
  "css",
  "bash",
  "clojure-repl",
  "clojure",
  "javascript",
  "coffeescript",
  "cpp",
  "cs",
  "d",
  "dart",
  "delphi",
  "diff",
  "django",
  "dockerfile",
  "dos",
  "elixir",
  "erb",
  "erlang-repl",
  "erlang",
  "fortran",
  "fsharp",
  "gcode",
  "gherkin",
  "go",
  "gradle",
  "groovy",
  "haml",
  "handlebars",
  "haskell",
  "http",
  "ini",
  "java",
  "json",
  "kotlin",
  "less",
  "lisp",
  "livescript",
  "lua",
  "makefile",
  "markdown",
  "mathematica",
  "matlab",
  "nginx",
  "objectivec",
  "perl",
  "php",
  "powershell",
  "prolog",
  "puppet",
  "python",
  "q",
  "r",
  "rib",
  "rsl",
  "ruby",
  "rust",
  "scala",
  "scheme",
  "scilab",
  "scss",
  "smali",
  "smalltalk",
  "sml",
  "sql",
  "stylus",
  "swift",
  "tcl",
  "tex",
  "typescript",
  "vbnet",
  "vbscript-html",
  "vbscript",
  "vim",
  "x86asm",
  "xml"
]});


function checkForIllegalUrl(href) {
  if(!href) return "";

  href = href.trim();
  var hrefLower = href.toLowerCase();

  if(hrefLower.indexOf(scriptUrl) === 0 || hrefLower.indexOf(dataUrl) === 0) {
    /* Rickroll the script kiddies */
    return "https://goo.gl/7NDM3x";
  }

  if(hrefLower.indexOf(httpUrl) !== 0 && hrefLower.indexOf(httpsUrl) !== 0 && hrefLower.indexOf(noProtocolUrl) !== 0)  {
    return httpUrl + href;
  }

  return href;
}

function getRenderer(renderContext) {

  var renderer = new marked.Renderer();

  // Highlight code blocks
  renderer.code = function(code, lang) {
    lang = (lang + '').toLowerCase();

    if (lang === "text") {
      return util.format('<pre><code class="text">%s</code></pre>', htmlencode.htmlEncode(code));
    }

    if (highlight.getLanguage(lang))
      return util.format('<pre><code class="%s">%s</code></pre>', lang, highlight.highlight(lang, code).value);

    return util.format('<pre><code>%s</code></pre>', highlight.highlightAuto(code).value);
  };

  // Highlight code blocks
  renderer.latex = function(latexCode) {
    try {
      return katex.renderToString(latexCode);
    } catch(e) {
      return util.format('<pre><code>%s: %s</code></pre>', e.message, latexCode);
    }
  };

  // Extract urls mentions and issues from paragraphs
  renderer.paragraph = function(text) {
    renderContext.paragraphCount++;
    return util.format('<p>%s</p>', text);
  };

  renderer.issue = function(repo, issue, text) {
    renderContext.issues.push({
      number: issue,
      repo: repo ? repo : undefined
    });

    var out = '<span data-link-type="issue" data-issue="' + issue + '"';
    if(repo) {
      out += util.format(' data-issue-repo="%s"', repo);
    }
    out += ' class="issue">' + text + '</span>';
    return out;
  };

  renderer.commit = function(repo, sha) {
    var text = repo+'@'+sha.substring(0, 7);
    var out = '<span data-link-type="commit" ' +
              'data-commit-sha="' + sha + '" ' +
              'data-commit-repo="' + repo + '" ' +
              'class="commit">' + text + '</span>';
    return out;
  };

  renderer.link = function(href, title, text) {
    href = checkForIllegalUrl(href);
    var githubData = matcher(href);
    if(githubData) {
      return renderer[githubData.type](githubData.repo, githubData.id, githubData.text);
    } else {
      renderContext.urls.push({ url: href });
      return util.format('<a href="%s" rel="nofollow" target="_blank" class="link">%s</a>', href, text);
    }
  };

  renderer.image = function(href, title, text) {
    href = checkForIllegalUrl(href);
    renderContext.urls.push({ url: href });
    return util.format('<img src="%s" title="%s" alt="%s" rel="nofollow">', href, title, text);
  };

  renderer.mention = function(href, title, text) {
    var screenName = text.charAt(0) === '@' ? text.substring(1) : text;
    renderContext.mentions.push({ screenName: screenName });
    return util.format('<span data-link-type="mention" data-screen-name="%s" class="mention">%s</span>', screenName, text);
  };

  renderer.groupmention = function(name, text) {
    renderContext.mentions.push({ screenName: name, group: true });
    return util.format('<span data-link-type="groupmention" data-group-name="%s" class="groupmention">%s</span>', name, text);
  };

  renderer.email = function(href, title, text) {
    checkForIllegalUrl(href);

    renderContext.urls.push({ url: href });
    return util.format('<a href="%s" rel="nofollow">%s</a>', href, text);
  };

  renderer.heading = function(text, level/*, raw */) {
    return '<h' +
      level +
      '>' +
      text +
      '</h' +
      level +
      '>\n';
  };

  renderer.text = function(text) {
    /* Used for language detection */
    renderContext.plainText.push(text);
    return text;
  };

  return renderer;
}



module.exports = exports = function processChat(text) {

  var renderContext = {
    urls: [],
    mentions: [],
    issues: [],
    plainText: [],
    paragraphCount: 0
  };

  var html = "";

  if(text) {
    text = "" + text; // Force to string
    var renderer = getRenderer(renderContext);
    // Reset any references, see https://github.com/gitterHQ/gitter/issues/1041
    lexer.tokens = [];
    lexer.tokens.links = {};

    var tokens = lexer.lex(text);
    var parser = new marked.Parser(_.extend({ renderer: renderer }, options));
    html = parser.parse(tokens);
    if(renderContext.paragraphCount === 1) {
      html = html.replace(/<\/?p>/g,'');
    }
  } else {
    text = "";
  }

  return {
    text: text,
    html: html,
    urls: renderContext.urls,
    mentions: renderContext.mentions,
    issues: renderContext.issues,
    plainText: renderContext.plainText.join(' ')
  };
};
