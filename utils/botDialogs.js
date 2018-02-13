(function () {
    'use strict';
    var builder = require('botbuilder');

    // exports.getMessage = function (session, propertyName, language) {
    //     if (!language) {
    //         language = "ENGLISH";
    //     }

    //     if (session.message.user.aadObjectId) {

    //         let botResp = BOT_MESSAGES_TEAMS[propertyName];

    //         if (botResp) {
    //             let botMsg = botResp[language];

    //             if (botMsg) {

    //                 if (!botMsg.title) {
    //                     botMsg.title = "";
    //                 }
    //                 if (!botMsg.subtitle) {
    //                     botMsg.subtitle = "";
    //                 }
    //                 if (!botMsg.text) {
    //                     botMsg.text = "";
    //                 }
    //                 if (!botMsg.buttons) {
    //                     botMsg.buttons = [];
    //                 }

    //                 return new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
    //                     .title(botMsg.title)
    //                     .subtitle(botMsg.subtitle)
    //                     .text(botMsg.text)
    //                     .images()
    //                     .buttons(botMsg.buttons));
    //             } else {
    //                 return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
    //             }

    //         } else {
    //             return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
    //         }

    //     } else {
    //         let botResp = BOT_MESSAGES[propertyName];
    //         if (botResp) {
    //             let botMsg = botResp[language];
    //             if (botMsg) {
    //                 return botMsg;
    //             } else {
    //                 return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
    //             }

    //         } else {
    //             return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
    //         }

    //         return BOT_MESSAGES[propertyName][language];
    //     }
    // }

    // BOT_MESSAGES_TEAMS = {
    //     "INCIDENTSTATUSBYLIST": {
    //         "ENGLISH": {
    //             "title": "",
    //             "subtitle": "",
    //             "text": "Last 10 Incidents",
    //             "buttons": [
    //                 {
    //                     "type": "imBack",
    //                     "title": "Select",
    //                     "value": "INC0010808"
    //                 }
    //             ]
    //         }
    //     }
    // }

    var greetingMessage = {
        'beginGreeting': (session, platform) => {
            switch (platform) {
                case 'slack':
                    let msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session));
                    session.endDialog(msg);
                    break;
                case 'skypeforbusiness':
                    builder.Prompts.choice(session, 'Choose a service', ['Incident Management', 'Service Management']);
                    break;
            }
        }
    }

    function createWelcomeHeroCard(session) {
        return new builder.HeroCard(session)
            .title(process.env.AgentName)
            .text(`Greetings from ${process.env.AgentName}`)
            .images([
                builder.CardImage.create(session, process.env.LogoURL)
            ])
            .buttons([
                builder.CardAction.imBack(session, 'Incident Management', 'Incident Management'),
                builder.CardAction.imBack(session, 'Service Management', 'Service Management')
            ]);
    }

    function createIncidentHeroCard(session) {
        return new builder.HeroCard(session)
            .title(process.env.AgentName)
            .images([
                builder.CardImage.create(session, process.env.LogoURL)
            ])
            .buttons([
                builder.CardAction.imBack(session, 'Create Incident', 'Create Incident'),
                builder.CardAction.imBack(session, 'Incident Status', 'Incident Status')
            ]);
    }

    function createServiceHeroCard(session) {
        return new builder.HeroCard(session)
            .title(process.env.AgentName)
            .text(`Greetings from ${process.env.AgentName}`)
            .images([
                builder.CardImage.create(session, process.env.LogoURL)
            ])
            .buttons([
                builder.CardAction.imBack(session, 'Create Service Request', 'Create Service Request'),
                builder.CardAction.imBack(session, 'Service Status', 'Service Status')
            ]);
    }
    
    var PLEASE_WAIT_MESSAGE = {
        "DEFAULT" : {
            "ENGLISH" : "Hold on for a moment..."
        }
    };

    module.exports.greetingMessage = greetingMessage;
    module.exports.pleaseWait = PLEASE_WAIT_MESSAGE;

}());