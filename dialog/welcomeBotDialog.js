(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var commonTemplate = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

    // Incident Request Status List
    module.exports.beginGreeting = [
        function (session, args) {
            var txt = `Hi ${session.message.user.name ? session.message.user.name : ' '}, I am ${process.env.AgentName}.<br/>I am here to help you out <br/>You can ask me questions like:<br/>- Create high severity incident <br/>- Incident status for 'Incident Number eg:INC0010505' <br/>- Show latest incidents <br/>- Say 'help' for any queries <br/>- Say 'goodbye' to leave conversation`;
            var reply = new builder.Message()
                .address(session.message.address)
                .text(txt);
            session.send(reply);
            let msg = new builder.Message(session).addAttachment(createWelcomeHeroCard(session));
            session.send(msg);
        },
        function (session, results) {
            if (results.response.text.toUpperCase() === 'INCIDENT MANAGEMENT') {
                let msg = new builder.Message(session).addAttachment(createIncidentHeroCard(session));
                session.endDialog(msg);
            }
            if (results.response.text.toUpperCase() === 'SERVICE MANAGEMENT') {
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
                builder.CardImage.create(session,process.env.LogoURL)
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
                builder.CardImage.create(session,process.env.LogoURL)
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
                builder.CardImage.create(session,process.env.LogoURL)
            ])
            .buttons([
                builder.CardAction.imBack(session, 'SERVICE REQUEST', 'SERVICE REQUEST'),
                builder.CardAction.imBack(session, 'SERVICE STATUS', 'SERVICE STATUS')
            ]);
    }
}());