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
            if (session.message.text.toUpperCase() == 'INCIDENT MANAGEMENT' || session.message.text.toUpperCase() == 'SERVICE MANAGEMENT') {
                session.conversationData.GreetingType = session.message.text.toUpperCase();
                next({ response: session.conversationData.GreetingType });
            } else {
                var txt = `Hi ${session.message.user.name ? session.message.user.name : ' '}, I am ${process.env.AgentName}.<br/>I am here to help you out <br/>You can ask me questions like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number eg:INC0010505' <br/>- Show latest incidents <br/>- Say 'help' for any queries <br/>- Say 'goodbye' to leave conversation`;
                var reply = new builder.Message()
                    .address(session.message.address)
                    .text(txt);
                session.send(reply);

                switch (session.message.source) {
                    case 'slack':
                        let msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session));
                        session.endDialog(msg);
                        break;
                    case 'skypeforbusiness':
                        builder.Prompts.choice(session, 'Choose a service', ['Incident Management', 'Service Management']);
                        break;
                }
            }
        },
        function (session, results) {
            log.consoleDefault(results);
            session.conversationData.GreetingType = results.response.entity;
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
}());