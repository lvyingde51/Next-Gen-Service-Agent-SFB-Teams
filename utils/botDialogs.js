(function () {
    'use strict';
    var builder = require('botbuilder');

    exports.getMessage = function (session, propertyName, language) {
        if (!language) {
            language = "ENGLISH";
        }

        if (session.message.user.aadObjectId) {

            let botResp = BOT_MESSAGES_TEAMS[propertyName];

            if (botResp) {
                let botMsg = botResp[language];

                if (botMsg) {

                    if (!botMsg.title) {
                        botMsg.title = "";
                    }
                    if (!botMsg.subtitle) {
                        botMsg.subtitle = "";
                    }
                    if (!botMsg.text) {
                        botMsg.text = "";
                    }
                    if (!botMsg.buttons) {
                        botMsg.buttons = [];
                    }

                    return new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                        .title(botMsg.title)
                        .subtitle(botMsg.subtitle)
                        .text(botMsg.text)
                        .images()
                        .buttons(botMsg.buttons));
                } else {
                    return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                }

            } else {
                return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
            }

        } else {
            let botResp = BOT_MESSAGES[propertyName];
            if (botResp) {
                let botMsg = botResp[language];
                if (botMsg) {
                    return botMsg;
                } else {
                    return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                }

            } else {
                return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
            }

            return BOT_MESSAGES[propertyName][language];
        }
    }

    BOT_MESSAGES_TEAMS = {
        "INCIDENTSTATUSBYLIST": {
            "ENGLISH": {
                "title": "",
                "subtitle": "",
                "text": "Last 10 Incidents",
                "buttons": [
                    {
                        "type": "imBack",
                        "title": "Select",
                        "value": "INC0010808"
                    }
                ]
            }
        }
    }

}());