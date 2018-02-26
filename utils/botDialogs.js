(function () {
    'use strict';
    var builder = require('botbuilder');

    exports.getMessage = function (session, propertyName, language) {
        if (!language) {
            language = "ENGLISH";
        }
        let botResp = null;
        let botMsg = null;
        switch (session.message.source) {
            case 'slack':
                botResp = BOT_MESSAGES_SLACK[propertyName];
                if (botResp) {
                    botMsg = botResp[language];
                    if (botMsg) {
                        return botMsg(session);
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
                    botMsg = botResp[language];
                    if (botMsg) {
                        return botMsg(session);
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
                    botMsg = botResp[language];
                    if (botMsg) {
                        return botMsg(session);
                    } else {
                        return 'Error :: Bot Message is not available for Property ' + propertyName + ' on Language ' + language;
                    }
                } else {
                    return 'Error :: Bot Message configuration is not available for Property ' + propertyName;
                }
                break;
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

        return new builder.Message(session).addAttachment(new builder.HeroCard(session)
            .title(title)
            .text(resp)
            .images(imageUrlArr)
            .buttons(buttonArr));
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
        },
        "PROCESSING": {
            "ENGLISH": "Please wait... This is taking a little longer than expected..."
        }
    };

    var BOT_MESSAGES = {
        "GREETING": {
            "ENGLISH": (session) => {
                return `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`;
            }
        },
        "INCIDENTMGMT": {
            "ENGLISH": (session) => {
                return builder.Prompts.choice(session, 'Choose a service', ['Create Incident', 'Incident Status']);
            }
        },
        "SERVICEMGMT": {
            "ENGLISH": (session) => {
                return builder.Prompts.choice(session, 'Choose a service', ['Create Service Request', 'Service Status']);
            }
        },
        "SHORTDESCPROMPT": {
            "ENGLISH": (session) => {
                "Please give me a short description of the incident you’d like to report"
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
        },
        "ADDCOMMENT": {
            "ENGLISH": (session) => {
                return `Okay, Please enter your comment`;
            }
        },
        "THANKYOU": {
            "ENGLISH": (session) => {
                return `Happy to help`;
            }
        }
    };

    var BOT_MESSAGES_TEAMS = {
        "GREETING": {
            "ENGLISH": (session) => {
                return createHeroCard(session, process.env.AgentName, `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`, [], [])
            }
        },
        "INCIDENTMGMT": {
            "ENGLISH": (session) => {
                let buttonsArr = [];
                buttonsArr.push(builder.CardAction.imBack(session, 'Create Incident', 'Create Incident'));
                buttonsArr.push(builder.CardAction.imBack(session, 'Incident Status', 'Incident Status'));
                return createHeroCard(session, 'Incident Management', '', [], buttonsArr)
            }
        },
        "SERVICEMGMT": {
            "ENGLISH": (session) => {
                let buttonsArr = [];
                buttonsArr.push(builder.CardAction.imBack(session, 'Create Service Request', 'Create Service Request'));
                buttonsArr.push(builder.CardAction.imBack(session, 'Service Status', 'Service Status'));
                return createHeroCard(session, 'Service Management', '', [], buttonsArr)
            }
        },
        "SHORTDESCPROMPT": {
            "ENGLISH": (session) => {
                "Please give me a short description of the incident you’d like to report"
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
        },
        "ADDCOMMENT": {
            "ENGLISH": (session) => {
                return `Okay, Please enter your comment`;
            }
        },
        "THANKYOU": {
            "ENGLISH": (session) => {
                return `Happy to help`;
            }
        }
    };

    var BOT_MESSAGES_SLACK = {
        "GREETING": {
            "ENGLISH": (session) => {
                return createHeroCard(session, process.env.AgentName, `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`, [], [])
            }
        },
        "INCIDENTMGMT": {
            "ENGLISH": (session) => {
                let buttonsArr = [];
                buttonsArr.push(builder.CardAction.imBack(session, 'Create Incident', 'Create Incident'));
                buttonsArr.push(builder.CardAction.imBack(session, 'Incident Status', 'Incident Status'));
                return createHeroCard(session, 'Incident Management', '', [], buttonsArr)
            }
        },
        "SERVICEMGMT": {
            "ENGLISH": (session) => {
                let buttonsArr = [];
                buttonsArr.push(builder.CardAction.imBack(session, 'Create Service Request', 'Create Service Request'));
                buttonsArr.push(builder.CardAction.imBack(session, 'Service Status', 'Service Status'));
                return createHeroCard(session, 'Service Management', '', [], buttonsArr)
            }
        },
        "SHORTDESCPROMPT": {
            "ENGLISH": (session) => {
                "Please give me a short description of the incident you’d like to report"
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
        },
        "ADDCOMMENT": {
            "ENGLISH": (session) => {
                return `Okay, Please enter your comment`;
            }
        },
        "THANKYOU": {
            "ENGLISH": (session) => {
                return `Happy to help`;
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

    module.exports.pleaseWait = PLEASE_WAIT_MESSAGE;
    module.exports.sendError = ERROR_MESSAGES;

}());