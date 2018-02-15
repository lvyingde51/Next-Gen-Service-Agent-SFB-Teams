(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var commonTemplate = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

    // Incident Request Status List
    module.exports.beginGreeting = [
        function (session, args, next) {
            log.consoleDefault(session.message.source);
            log.consoleDefault(session.message.text);
            log.consoleDefault(session.message.text.toUpperCase());
            log.consoleDefault(session.message.text.toUpperCase() == 'INCIDENT MANAGEMENT');
            if (session.message.text.toUpperCase() == 'INCIDENT MANAGEMENT' || session.message.text.toUpperCase() == 'SERVICE MANAGEMENT') {
                session.conversationData.GreetingType = session.message.text.toUpperCase();
                log.consoleDefault(session.conversationData.GreetingType);
                next({ response: session.conversationData.GreetingType });
            } else {
                // var txt = `Hi ${session.message.user.name ? session.message.user.name : ' '}, I am your ${process.env.AgentName}.I can help you create incidents and requests.You can also ask me the status of your incidents/requests.<br/>If you are stuck at any point, you can type ‘help’. Or if you’d like to stop what you are currently doing you can type ‘goodbye’.<br/>How may I help you today?`;
                // builder.Prompts.choice(session, txt, ['Incident Management', 'Service Management']);

                var txt = `Hi ${session.message.user.name ? session.message.user.name.split(' ')[0] : ' '}, I can help you create incidents and requests. You can also ask me the status of your incidents/requests.<br/><br/>If you are stuck at any point, you can type ‘help’.<br/><br/>How may I help you today?`;
                var msg = '';
                // var reply = new builder.Message()
                //     .address(session.message.address)
                //     .text(txt);
                // session.send(reply);

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
        },
        function (session, results) {
            log.consoleDefault(results);

            if (results.response.entity) {
                let resp = results.response.entity;
                session.conversationData.GreetingType = resp.toUpperCase();
            }

            session.endDialog();
            session.beginDialog('chooseManagement', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with chooseManagement: ' + err.message));
                }
            });
        }
    ];

    module.exports.chooseManagement = [
        function (session, args) {
            log.consoleDefault(session.message.text);
            log.consoleDefault(session.conversationData.GreetingType);
            if (session.conversationData.GreetingType === 'INCIDENT MANAGEMENT' && session.message.source != 'skypeforbusiness') {
                let msg = new builder.Message(session).addAttachment(createIncidentHeroCard(session));
                session.endDialog(msg);
            }
            else if (session.conversationData.GreetingType === 'SERVICE MANAGEMENT' && session.message.source != 'skypeforbusiness') {
                let msg = new builder.Message(session).addAttachment(createServiceHeroCard(session));
                session.endDialog(msg);
            }
            else if (session.conversationData.GreetingType === 'INCIDENT MANAGEMENT' && session.message.source === 'skypeforbusiness') {
                builder.Prompts.choice(session, 'Choose a service', ['Create Incident', 'Incident Status']);
            }
            else if (session.conversationData.GreetingType === 'SERVICE MANAGEMENT' && session.message.source === 'skypeforbusiness') {
                builder.Prompts.choice(session, 'Choose a service', ['Create Service Request', 'Service Status']);
            }
        },
        function (session, results) {
            switch (results.response.entity) {
                case 'Create Incident':
                    session.endDialog();
                    session.beginDialog('createIncident', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with createIncident: ' + err.message));
                        }
                    });
                    break;
                case 'Incident Status':
                    session.endDialog();
                    session.beginDialog('incidentStatus', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
                        }
                    });
                    break;
                case 'Create Service Request':
                    session.endDialog();
                    session.beginDialog('createServiceRequest', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with createServiceRequest: ' + err.message));
                        }
                    });
                    break;
                case 'Service Status':
                    session.endDialog();
                    session.beginDialog('srStatus', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with srStatus: ' + err.message));
                        }
                    });
                    break;
            }
        }
    ];

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
}());