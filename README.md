gitter-markdown-processor
=====================

Processes Gitter markdown messages and returns html with metadata.

```javascript
var processor = new Processor();

processor.parse('Can someone look at #12?', function(err, result) {
  console.log(result);
  /*
   * {
   *   html: 'Can someone look at <span data-link-type="issue" data-issue="12" class="issue">#12</span>?',
   *   urls: [],
   *   mentions: [],
   *   issues: [ { number: '12' } ]
   * }
   */
});

processor.shutdown(function(err) {
  if(err) console.error('Uh oh, you should check for leftover processes', err);
});

```
