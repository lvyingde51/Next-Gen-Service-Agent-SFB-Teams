/*-----------------------------------------------------------------------------
Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var createIncidentDialog = require('./dialog/createIncidentDialog');
var createIncidentBotDialog = require('./dialog/createIncidentBotDialog');
var incidentStatusDialog = require('./dialog/incidentStatusDialog');
var incidentStatusBotDialog = require('./dialog/incidentStatusBotDialog');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
.matches('Greeting', (session) => {
   // session.send('You reached Bot Welcome intent, you said \'%s\'.', session.message.text);
   var isGroup = session.message.address.conversation.isGroup;
   var txt = isGroup ? "Hello everyone!" : `Hi ${session.message.user.name ? session.message.user.name : ' '}, I am BI Service Agent.<br/>I am here to help you out <br/>You can ask me questions like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number eg:INC0010505' <br/>- Show latest incidents <br/>- Say 'help' for any queries <br/>- Say 'goodbye' to leave conversation`;
   var reply = new builder.Message()
           .address(session.message.address)
           .text(txt);
   bot.send(reply);
   let msg = new builder.Message(session).addAttachment(createHeroCard(session));
   session.send(msg);
})
.matches('Help', (session) => {
    session.send(`If you have any issue, you can reach us at helpdesk@hexaware.com<br/>or call us on 044-67487500`);
})
.matches('Cancel', (session) => {
    session.send('You reached Cancel intent, you said \'%s\'.', session.message.text);
})
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});
console.log('Matched intent is '+JSON.stringify(intents));

// Custom Intent Handling Starts Here
createIncidentDialog.load(intents);
incidentStatusDialog.load(intents);


bot.dialog('/', intents);

// Custom Dialog Handling Starts Here
bot.dialog('createIncident', createIncidentBotDialog.beginDialog);
bot.dialog('shortDescription', createIncidentBotDialog.shortDescription);
bot.dialog('category', createIncidentBotDialog.category);
bot.dialog('viewResult', createIncidentBotDialog.viewResult);
bot.dialog('incidentStatus', incidentStatusBotDialog.beginDialog);
// bot.dialog('getincidentStatus', incidentStatusBotDialog.getincidentStatus);
bot.dialog('isSearchById', incidentStatusBotDialog.incidentID);
bot.dialog('isSearchByList', incidentStatusBotDialog.prevIncidents);
bot.recognizer({
    recognize: function (context, done) {
    var intent = { score: 0.0 };
  
          if (context.message.text) {
              switch (context.message.text.toLowerCase()) {
                  case 'help':
                      intent = { score: 1.0, intent: 'Help' };
                      break;
                  case 'goodbye':
                      intent = { score: 1.0, intent: 'Goodbye' };
                      break;
              }
          }
          done(null, intent);
      }
  });
bot.endConversationAction('goodbyeAction', "Ok... See you later.", { matches: 'Goodbye' });
bot.on('conversationUpdate', function (session,message) {
     if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : `Hi ${message.user.name ? message.user.name : ' '}, I am BI Service Agent.<br/>I am here to help you out <br/>You can ask me questions like:<br/>- Create high severity incident <br/>- Incident status for "incident number without INC eg:0010505" <br/>- Show latest incidents <br/>- Say help for any queries <br/>- Say 'goodbye' to leave conversation`;
        var reply = new builder.Message()
                .address(message.address)
                .text(txt);
        bot.send(reply);
        let msg = new builder.Message(session).addAttachment(createHeroCard(session));
        session.send(msg);
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
    }
});
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});
function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('BI Service Agent')
        .text('Greetings from BI Service Agent')
        .images([
            builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Boehringer_Ingelheim_Logo.svg/1200px-Boehringer_Ingelheim_Logo.svg.png')
        ])
        .buttons([
         /*   builder.CardAction.imBack(session, 'Book a Flight', 'Flight Booking Agent'),*/
            builder.CardAction.imBack(session, 'create incident', 'INCIDENT REQUEST'),
            builder.CardAction.imBack(session, 'incident status', 'INCIDENT STATUS')
        ]);
}
