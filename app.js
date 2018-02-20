/*-----------------------------------------------------------------------------
Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require("restify");
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var welcomeDialog = require("./dialog/welcomeDialog");
var welcomeBotDialog = require("./dialog/welcomeBotDialog");
var createIncidentDialog = require("./dialog/createIncidentDialog");
var createIncidentBotDialog = require("./dialog/createIncidentBotDialog");
var incidentStatusDialog = require("./dialog/incidentStatusDialog");
var incidentStatusBotDialog = require("./dialog/incidentStatusBotDialog");
var requestStatusDialog = require("./dialog/requestStatusDialog");
var requestStatusBotDialog = require("./dialog/requestStatusBotDialog");
var createServiceRequestDialog = require("./dialog/createServiceRequestDialog");
var createServiceRequestBotDialog = require("./dialog/createServiceRequestBotDialog");
var reopenIncidentDialog = require("./dialog/reopenIncidentDialog");
var commentIncidentDialog = require("./dialog/commentIncidentDialog");
var closeIncidentDialog = require("./dialog/closeIncidentDialog");
var reopenCommentCloseBotDialog = require("./dialog/reopenCommentCloseBotDialog");
var lastIncidentDialog = require("./dialog/lastIncidentDialog");
var lastIncidentBotDialog = require("./dialog/lastIncidentBotDialog");

var QnAClient = require("./lib/client");
var defaultBotDialog = require("./dialog/defaultBotDialog");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log("%s listening to %s", server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  openIdMetadata: process.env.BotOpenIdMetadata
});

var qnaClient = new QnAClient({
  knowledgeBaseId: process.env.KB_ID,
  subscriptionKey: process.env.QNA_KEY
  // Optional field: Score threshold
});

// Listen for messages from users
server.post("/api/messages", connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = "botdata";
var azureTableClient = new botbuilder_azure.AzureTableClient(
  tableName,
  process.env["AzureWebJobsStorage"]
);
var tableStorage = new botbuilder_azure.AzureBotStorage(
  { gzipData: false },
  azureTableClient
);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set("storage", tableStorage);

const logUserConversation = event => {
  console.log("message: " + event.text + ", user: " + event.address.user.name);
};

// Middleware for logging
bot.use({
  receive: function(event, next) {
    logUserConversation(event);
    next();
  },
  send: function(event, next) {
    logUserConversation(event);
    next();
  }
});

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName =
  process.env.LuisAPIHostName || "westus.api.cognitive.microsoft.com";

const LuisModelUrl =`https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3b34deef-fe27-4fb0-85b5-268a626040fa?subscription-key=a0a7d96d1a674912bc12d18d1c61648b&staging=true&verbose=true&timezoneOffset=0&q=`
 /* "https://" +
  luisAPIHostName +
  "/luis/v1/application?id=" +
  luisAppId +"&staging=true"
  "&subscription-key=" +
  luisAPIKey;*/

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
  .matches("SmallTalk", session => {
    qnaClient.post({ question: session.message.text }, function(err, res) {
      if (err) {
        console.error("Error from callback:", err);
        session.send("Oops - something went wrong.");
        return;
      }

      if (res) {
        // Send reply from QnA back to user
        session.send(res);
      } else {
        // Put whatever default message/attachments you want here
        session.send(
          "Hmm, I didn't quite understand you there. Care to rephrase?"
        );
      }
    });
  })
  .matches("Help", session => {
    session.send(
      `I am here to help you out <br/>You can ask me queries like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number INC0010505' <br/>- Show latest incidents <br/>- Say 'goodbye' to leave conversation`
    );
  })
  .matches("Cancel", session => {
    session.endConversation("Ok... See you later.");
  })
  /*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
  .onDefault(session => {
    console.log("Entered Default");
    session.beginDialog("default", function(err) {
      if (err) {
        session.send(
          new builder.Message().text(
            "Error Occurred with default: " + err.message
          )
        );
      }
    });
  });
console.log("Matched intent is " + JSON.stringify(intents));

// Custom Intent Handling Starts Here
welcomeDialog.load(intents);
createIncidentDialog.load(intents);
incidentStatusDialog.load(intents);
requestStatusDialog.load(intents);
createServiceRequestDialog.load(intents);
reopenIncidentDialog.load(intents);
commentIncidentDialog.load(intents);
closeIncidentDialog.load(intents);
lastIncidentDialog.load(intents);

bot.dialog("/", intents);

// Custom Dialog Handling Starts Here
bot.dialog("displayGreeting", welcomeBotDialog.beginGreeting);
bot.dialog("chooseManagement", welcomeBotDialog.chooseManagement);
bot.dialog("createIncident", createIncidentBotDialog.beginDialog);
bot.dialog("shortDescription", createIncidentBotDialog.shortDescription);
bot.dialog("category", createIncidentBotDialog.category);
bot.dialog("viewResult", createIncidentBotDialog.viewResult);
bot.dialog("incidentStatus", incidentStatusBotDialog.beginDialog);
bot.dialog("isSearchById", incidentStatusBotDialog.incidentID);
bot.dialog("isSearchByList", incidentStatusBotDialog.prevIncidents);
bot.dialog("updateIncident", incidentStatusBotDialog.updateIncident);
bot.dialog("srStatus", requestStatusBotDialog.beginDialog);
bot.dialog("srSearchById", requestStatusBotDialog.serviceID);
bot.dialog("srSearchByList", requestStatusBotDialog.prevIncidents);
bot.dialog("createServiceRequest", createServiceRequestBotDialog.beginDialog);
bot.dialog("showSoftwareList", createServiceRequestBotDialog.softwareList);
bot.dialog("createSR", createServiceRequestBotDialog.createSR);
bot.dialog("default", defaultBotDialog.beginDialog);
bot.dialog("reopenIncident", reopenCommentCloseBotDialog.reopenIncident);
bot.dialog("closeIncident", reopenCommentCloseBotDialog.closeIncident);
bot.dialog("commentIncident", reopenCommentCloseBotDialog.commentIncident);
bot.dialog("lastIncident", lastIncidentBotDialog.beginDialog);
bot.recognizer({
  recognize: function(context, done) {
    var intent = { score: 0.0 };

    if (context.message.text) {
      switch (context.message.text.toLowerCase()) {
        case "help":
          intent = { score: 1.0, intent: "Help" };
          break;
        case "goodbye":
          intent = { score: 1.0, intent: "Goodbye" };
          break;
          case "Good Bye":
          intent = { score: 1.0, intent: "Goodbye" };
          break;
          case "exit":
          intent = { score: 1.0, intent: "Goodbye" };
          break; 
          case "quit":
          intent = { score: 1.0, intent: "Goodbye" };
          break;
          case "Thank You":
          intent = { score: 1.0, intent: "Goodbye" };
          break; 
          case "Thankyou":
          intent = { score: 1.0, intent: "Goodbye" };
          break; 
          case "Thanks":
          intent = { score: 1.0, intent: "Goodbye" };
          break;   
        case "cancel":
          intent = { score: 1.0, intent: "Cancel" };
          break;
      }
    }
    done(null, intent);
  }
});
bot.endConversationAction("goodbyeAction", "Ok... See you later.", {
  matches: "Goodbye"
});
bot.on("conversationUpdate", function(message) {
/*if (message.membersAdded && message.membersAdded.length > 0) {
    // Say hello
    //var isGroup = message.address.conversation.isGroup;
    var txt = `Hi ${
      session.message.user.name ? session.message.user.name : " "
    }, I am your ${
      process.env.AgentName
    }.<br/>I can help you create incidents and requests.<br/>You can also ask me the status of your incidents/requests.<br/>If you are stuck at any point, you can type ‘help’. Or if you’d like to stop what you are currently doing you can type ‘goodbye’.<br/>How may I help you today?`;
    var reply = new builder.Message().address(message.address).text(txt);
    bot.send(reply);
  } else if (message.membersRemoved) {
    // See if bot was removed
    var botId = message.address.bot.id;
    for (var i = 0; i < message.membersRemoved.length; i++) {
      if (message.membersRemoved[i].id === botId) {
        // Say goodbye
        var reply = new builder.Message()
          .address(message.address)
          .text("Goodbye");
        bot.send(reply);
        break;
      }
    }
  }*/
});

bot.on("error", function(e) {
  console.log("And error ocurred", e);
  /* var reply = new builder.Message()
    .text(`If you have any issue, you can reach us at helpdesk@hexaware.com<br/>or call us on 044-67487500`);
    bot.send(reply);*/
});
bot
  .dialog("helpDialog", function(session) {
    session.endDialog(
      `I am here to help you out <br/>You can ask me queries like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number INC0010505' <br/>- Show latest incidents <br/>- Say 'goodbye' to leave conversation`
    );
  })
  .triggerAction({ matches: "Help" });

function progress(session, options, asyncFn) {
  session.beginDialog("progressDialog", {
    asyncFn: asyncFn,

    options: options
  });
}

bot.dialog("progressDialog", function(session, args) {
  if (!args) return;

  var asyncFn = args.asyncFn;

  var options = args.options;

  var count = 0;

  function sendProgress() {
    if (count++ > 0) {
      session.say(options.text, options.speak, {
        inputHint: builder.InputHint.ignoringInput
      });
      
      if(count==3)
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

    hTimer = setTimeout(sendProgress, options.delay || 9000);
  }

  // Start progress timer

  var hTimer = setTimeout(sendProgress, options.initialDelay || 2000);

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
