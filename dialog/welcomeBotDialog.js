(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var commonTemplate = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

    // Incident Request Status List
    module.exports.beginGreeting = [
        function (session, args, next) {
            if (session.message.text.toUpperCase() == 'INCIDENT MANAGEMENT' || session.message.text.toUpperCase() == 'SERVICE MANAGEMENT') {
                session.conversationData.GreetingType = session.message.text.toUpperCase();
                next({ response: session.conversationData.GreetingType });
            } else {
                var txt = `Hi ${session.message.user.name ? session.message.user.name : ' '}, I am ${process.env.AgentName}.<br/>I am here to help you out <br/>You can ask me questions like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number eg:INC0010505' <br/>- Show latest incidents <br/>- Say 'help' for any queries <br/>- Say 'goodbye' to leave conversation`;
                var reply = new builder.Message()
                    .address(session.message.address)
                    .text(txt);
                session.send(reply);
                let msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session));
                session.send(msg);
            }
        },
        function (session, results) {
            log.consoleDefault('Inside next fun');
            log.consoleDefault(results);
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
            if (session.conversationData.GreetingType === 'INCIDENT MANAGEMENT') {
                let msg = new builder.Message(session).addAttachment(createIncidentHeroCard(session));
                session.endDialog(msg);
            }
            if (session.conversationData.GreetingType === 'SERVICE MANAGEMENT') {
                let msg = new builder.Message(session).addAttachment(createServiceHeroCard(session));
                session.endDialog(msg);
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
                /*   builder.CardAction.imBack(session, 'Book a Flight', 'Flight Booking Agent'),*/
                builder.CardAction.imBack(session, 'INCIDENT MANAGEMENT', 'INCIDENT MANAGEMENT'),
                builder.CardAction.imBack(session, 'SERVICE MANAGEMENT', 'SERVICE MANAGEMENT')
                // builder.CardAction.imBack(session, 'INCIDENT REQUEST', 'INCIDENT REQUEST'),
                // builder.CardAction.imBack(session, 'INCIDENT STATUS', 'INCIDENT STATUS')
            ]);
    }

    function createIncidentHeroCard(session) {
        return new builder.HeroCard(session)
            .title(process.env.AgentName)
            .images([
                builder.CardImage.create(session, process.env.LogoURL)
            ])
            .buttons([
                builder.CardAction.imBack(session, 'INCIDENT REQUEST', 'INCIDENT REQUEST'),
                builder.CardAction.imBack(session, 'INCIDENT STATUS', 'INCIDENT STATUS')
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
                builder.CardAction.imBack(session, 'SERVICE REQUEST', 'SERVICE REQUEST'),
                builder.CardAction.imBack(session, 'SERVICE STATUS', 'SERVICE STATUS')
            ]);
    }
}());