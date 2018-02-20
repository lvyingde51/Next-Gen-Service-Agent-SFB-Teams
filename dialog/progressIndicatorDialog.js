var builder = require('botbuilder');
const library = new builder.Library('progressDialog');
library.dialog("progressDialog", function(session, args) {
    if (!args) return;
  
    var asyncFn = args.asyncFn;
  
    var options = args.options;
  
    var count = 0;
  
    function sendProgress() {
      if (count++ > 0) {
        session.say(options.text, options.speak, {
          inputHint: builder.InputHint.ignoringInput
        });
        
        if(count==process.env.delayCount)
        {
        clearTimeout(hTimer);
        session.send('Something gone wrong please try again later');
        session.endDialogWithResult({ response: 'Start Over' });
        return;    
        }
      } else {
        var text = options.initialText || options.text;
  
        var speak = options.initialSpeak || options.speak;
  
        session.say(text, speak, { inputHint: builder.InputHint.ignoringInput });
      }
  
      hTimer = setTimeout(sendProgress, options.delay || process.env.Delay);
    }
  
    // Start progress timer
    
    var hTimer = setTimeout(sendProgress, options.initialDelay || process.env.initialDelay);
  
    // Call async function
  
    try {
      asyncFn(function(response) {
        // Stop timer and return response
  
        clearTimeout(hTimer);
       
        session.endDialogWithResult({ response: response });
      });
    } catch (err) {
      session.error(err);
    }
  });
  

module.exports = library;