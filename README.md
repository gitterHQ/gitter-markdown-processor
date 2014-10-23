gitter-chat-processor
=====================

Processes Gitter markdown messages and returns html with metadata.

```javascript
var processor = new Processor();

processor.parse('Can someone look at #12?', function(err, result) {
  
});

processor.cleanup(function(err) {
  if(err) console.error('Uh oh, you should check for leftover processes', err);
});

```
