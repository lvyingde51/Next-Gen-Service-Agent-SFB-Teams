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
            var txt = `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I am your ${process.env.AgentName}. I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’. Or if you’d like to stop what you are currently doing you can type ‘goodbye’.<br/><br/>How may I help you today?`;
            var msg = '';
            switch (session.message.source) {
                case 'skypeforbusiness':
                    builder.Prompts.choice(session, txt, ['Incident Management', 'Service Management']);
                    break;
                case 'slack':
                    txt = `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I am your ${process.env.AgentName}. I can help you create incidents and requests. You can also ask me the status of your incidents/requests.\n\nIf you are stuck at any point, you can type ‘help’. Or if you’d like to stop what you are currently doing you can type ‘goodbye’.\n\nHow may I help you today?`;
                    msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session, txt));
                    session.endDialog(msg);
                    break;
                default:
                    msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session, txt));
                    session.endDialog(msg);
                    break;
            }
        }
    }

    function createWelcomeHeroCard(session, resp) {
        return new builder.HeroCard(session)
            .title(process.env.AgentName)
            .text(resp)
            // .images([
            //     builder.CardImage.create(session, process.env.LogoURL)
            // ])
            .buttons([
                /* builder.CardAction.imBack(session, 'Create Incident', 'Create Incident'),
                 builder.CardAction.imBack(session, 'Get Incidents','Get Incidents'),
                 builder.CardAction.imBack(session, 'Create Service Request', 'Create Service Request'),
                 builder.CardAction.imBack(session, 'Get Service Status','Get Service Status')*/
            ]);
    }

    function createIncidentHeroCard(session) {
        return new builder.HeroCard(session)
            .title('Incident Management')
            // .images([
            //     builder.CardImage.create(session, process.env.IncidentLogo)
            // ])
            .buttons([
                builder.CardAction.imBack(session, 'Create Incident', 'Create Incident'),
                builder.CardAction.imBack(session, 'Incident Status', 'Incident Status')
            ]);
    }

    function createServiceHeroCard(session) {
        return new builder.HeroCard(session)
            .title('Service Management')
            // .images([
            //     builder.CardImage.create(session, process.env.ServiceReqLogo)
            // ])
            .buttons([
                builder.CardAction.imBack(session, 'Create Service Request', 'Create Service Request'),
                builder.CardAction.imBack(session, 'Service Status', 'Service Status')
            ]);
    }

    var PLEASE_WAIT_MESSAGE = {
        "DEFAULT": {
            "ENGLISH": "Hold on for a moment..."
        },
        "CREATEINCIDENT": {
            "ENGLISH": "Hold on... Adding your incident..."
        },
        "INCIDENTSTATUS": {
            "ENGLISH": "Hold on... Checking your incident status..."
        },
        "INCIDENTLIST": {
            "ENGLISH": "Hold on... Loading list of incidents..."
        },
        "CREATESR": {
            "ENGLISH": "Hold on... Creating your Service request..."
        },
        "SRSTATUS": {
            "ENGLISH": "Hold on... Checking your service request status..."
        },
        "SRLIST": {
            "ENGLISH": "Hold on... Loading list of service requests..."
        },
        "INCIDENTREOPEN": {
            "ENGLISH": "Hold on... We are reopening your incident..."
        },
        "INCIDENTCLOSE": {
            "ENGLISH": "Hold on... We are closing your incident..."
        },
        "INCIDENTADDCOMMENT": {
            "ENGLISH": "Hold on... We are adding your comment..."
        }
    };

    module.exports.greetingMessage = greetingMessage;
    module.exports.pleaseWait = PLEASE_WAIT_MESSAGE;

}());