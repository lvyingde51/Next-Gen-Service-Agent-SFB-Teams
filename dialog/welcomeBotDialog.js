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
            let msg = new builder.Message(session).addAttachment(createHeroCard(session));
            session.send(msg);
        },
        function (session, results) {

            if (results.response.text.toLowerCase() === 'INCIDENT MANAGEMENT') {
                // session.beginDialog('isSearchById', function (err) {
                //     if (err) {
                //         session.send(new builder.Message().text('Error Occurred with INCIDENT MANAGEMENT ' + err.message));
                //     }
                // });
            }
            if (session.conversationData.ISSearchType === 'SERVICE MANAGEMENT') {
                // session.beginDialog('isSearchByList', function (err) {
                //     if (err) {
                //         session.send(new builder.Message().text('Error Occurred with SERVICE MANAGEMENT ' + err.message));
                //     }
                // });
            }
        }
    ];

    function createHeroCard(session) {
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
}());