(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');
    // var bot = require('./incidentStatusBotDialog');
    var requestNumPattern = new RegExp('^[RITMritm]{4}[0-9]{7}$');

    exports.load = function(intentDialog) {
        intentDialog.matches('SR.Status', requestStatus)
    }
    
    var requestStatus = [(session, args) => {

        log.consoleDefault('*** Recent 10 Service Request Status ***'); // Console Start

        let entities = args.entities;

        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        log.consoleDefault(JSON.stringify(session.message.text.substring(session.message.text.indexOf('RITM'))));

        if(session.message.text.indexOf('RITM') > -1 && requestNumPattern.test(session.message.text.substring(session.message.text.indexOf('RITM')))) {
            session.conversationData.SRNumber = session.message.text.substring(session.message.text.indexOf('RITM'));
            log.consoleDefault(session.message.text.indexOf('RITM'));
        } else {
            session.conversationData.SRNumber = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number') ? builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity : '';
        }
        log.consoleDefault(session.conversationData.SRNumber);

        if(session.conversationData.SRNumber === '' || session.conversationData.SRNumber === null || session.conversationData.SRNumber === undefined) {
            return session.beginDialog('srStatus', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with serviceRequest: ' + err.message));
                }
            });
        } else {
            return session.beginDialog('srSearchById', args, function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with serviceRequest: ' + err.message));
                }
            });
        }
    }];
}());