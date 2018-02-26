(function () {
    'use strict';
    var builder = require('botbuilder');

    exports.getMessage = function (session, propertyName, language) {
        if (!language) {
            language = "ENGLISH";
        }
        let botResp = null;
        switch (session.message.source) {
            case 'slack':
                botResp = BOT_MESSAGES_SLACK[propertyName];
                if (botResp) {
                    let botMsg = botResp[language];
                    if (botMsg) {
                        return BOT_MESSAGES_SLACK[propertyName][language](session);
                        // if (!botMsg.title) {
                        //     botMsg.title = "";
                        // }
                        // if (!botMsg.subtitle) {
                        //     botMsg.subtitle = "";
                        // }
                        // if (!botMsg.text) {
                        //     botMsg.text = "";
                        // }
                        // if (!botMsg.buttons) {
                        //     botMsg.buttons = [];
                        // }

                        // return new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                        //     .title(botMsg.title)
                        //     .subtitle(botMsg.subtitle)
                        //     .text(botMsg.text)
                        //     .images()
                        //     .buttons(botMsg.buttons));
                    } else {
                        return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                    }
                } else {
                    return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
                }
                break;
            case 'msteams':
                botResp = BOT_MESSAGES_TEAMS[propertyName];
                if (botResp) {
                    let botMsg = botResp[language];
                    if (botMsg) {
                        return BOT_MESSAGES_TEAMS[propertyName][language](session);
                    } else {
                        return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                    }
                } else {
                    return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
                }
                break;
            default:
                botResp = BOT_MESSAGES[propertyName];
                if (botResp) {
                    let botMsg = botResp[language];
                    if (botMsg) {
                        return BOT_MESSAGES[propertyName][language](session);
                    } else {
                        return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                    }
                } else {
                    return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
                }
                break;
        }
    }

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

    function createHeroCard(session, title, resp, imageUrlArr, buttonArr) {
        // if (imageUrlArr.length <= 0 && buttonArr.length <= 0) {
        //     return new builder.HeroCard(session)
        //     .title(title)
        //     .text(resp);
        // } else if (imageUrlArr.length > 0 && buttonArr.length <= 0) {
        //     return new builder.HeroCard(session)
        //     .title(title)
        //     .text(resp)
        //     .images(imageUrlArr);
        // } else if (imageUrlArr.length <= 0 && buttonArr.length > 0) {
        //     return new builder.HeroCard(session)
        //     .title(title)
        //     .text(resp)
        //     .buttons(buttonArr);
        // } else {
        //     return new builder.HeroCard(session)
        //     .title(title)
        //     .text(resp)
        //     .images(imageUrlArr)
        //     .buttons(buttonArr);
        // }

        console.log('hero card');
        let card = new builder.HeroCard(session)
            .title(title)
            .text(resp)
            .images(imageUrlArr)
            .buttons(buttonArr);
        return card;
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
            "ENGLISH": "Hang tight... Searching for your incident..."
        },
        "INCIDENTLIST": {
            "ENGLISH": "Stay put... Getting your incidents..."
        },
        "CREATESR": {
            "ENGLISH": "Hang around... Creating your request..."
        },
        "SRSTATUS": {
            "ENGLISH": "Stand by... Looking for your service request..."
        },
        "SRLIST": {
            "ENGLISH": "One moment please... Getting your requests..."
        },
        "INCIDENTREOPEN": {
            "ENGLISH": "One sec... Sending your request..."
        },
        "INCIDENTCLOSE": {
            "ENGLISH": "Just a moment... Closing your incident..."
        },
        "INCIDENTADDCOMMENT": {
            "ENGLISH": "Alright... Sending your comment..."
        }
    };

    var BOT_MESSAGES = {
        "GREETING": {
            "ENGLISH": (session) => {
                return `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`;
            }
        },
        "CREATEINCIDENT_1": {
            "ENGLISH": "I have created your incident!"
        },
        "CREATEINCIDENT_2": {
            "ENGLISH": "Incident Id :"
        },
        "INCIDENTSTATUS": {
            "ENGLISH": {

            }
        },
        "CREATESR": {
            "ENGLISH": {

            }
        },
        "SRSTATUS": {
            "ENGLISH": {

            }
        }
    };

    var BOT_MESSAGES_TEAMS = {
        "GREETING": {
            "ENGLISH": (session) => {
                return createHeroCard(session, process.env.AgentName, `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`, [], [])
            }
        },
        "CREATEINCIDENT_1": {
            "ENGLISH": "I have created your incident!"
        },
        "CREATEINCIDENT_2": {
            "ENGLISH": {
                "title": "",
                "subtitle": "",
                "text": "",
                "buttons": []
            }
        },
        "INCIDENTSTATUS": {
            "ENGLISH": {

            }
        },
        "CREATESR": {
            "ENGLISH": {

            }
        },
        "SRSTATUS": {
            "ENGLISH": {

            }
        }
    };

    var BOT_MESSAGES_SLACK = {
        "GREETING": {
            "ENGLISH": (session) => {
                return createHeroCard(session, process.env.AgentName, `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`, [], [])
            }
        },
        "CREATEINCIDENT_1": {
            "ENGLISH": "_I have created your incident!_"
        },
        "CREATEINCIDENT_2": {
            "ENGLISH": {
                "title": "",
                "subtitle": "",
                "text": "",
                "buttons": []
            }
        },
        "INCIDENTSTATUS": {
            "ENGLISH": {

            }
        },
        "CREATESR": {
            "ENGLISH": {

            }
        },
        "SRSTATUS": {
            "ENGLISH": {

            }
        }
    };

    var ERROR_MESSAGES = {
        "DEFAULT": {
            "ENGLISH": "Oops! There was an error connecting to our service desk. Please try again later."
        },
        "INCIDENTNOTFOUND": {
            "ENGLISH": "Uh-oh! I couldn't find this incident. Please try again with a valid incident id."
        },
        "SRIDNOTFOUND": {
            "ENGLISH": "Oh no..this Service Id does not exist. Please try again with a valid service number."
        },
        "INCIDENTOPEN": {
            "ENGLISH": "Whoops! This incident is already open!"
        },
        "INVALIDINCIDENTFORMAT": {
            "ENGLISH": "It seems you have entered the incident number in wrong format!"
        },
        "INVALIDSERVICEFORMAT": {
            "ENGLISH": "It seems you have entered the service number in wrong format!"
        }
    };

    module.exports.greetingMessage = greetingMessage;
    module.exports.pleaseWait = PLEASE_WAIT_MESSAGE;
    module.exports.sendError = ERROR_MESSAGES;

}());