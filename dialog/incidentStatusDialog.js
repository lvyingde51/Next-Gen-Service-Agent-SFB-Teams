(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');
    // var bot = require('./incidentStatusBotDialog');
    var incidentNumPattern = new RegExp('^[INCinc]{3}[0-9]{7}$');

    exports.load = function(intentDialog) {
        intentDialog.matches('Incident.Status', incidentStatus)
    }
    
    var incidentStatus = [(session, args) => {

        log.consoleDefault('*** Recent 10 Incident Status ***'); // Console Start

        let entities = args.entities;

        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        log.consoleDefault(session.conversationData.IncidentNumber);

        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber') ? builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity : session.conversationData.IncidentNumber;

        if(session.conversationData.IncidentNumber === '' && session.message.text.toLowerCase().indexOf('inc') > -1 && incidentNumPattern.test(session.message.text.toLowerCase().substring(session.message.text.toLowerCase().indexOf('inc')))) {
            session.conversationData.IncidentNumber = session.message.text.toLowerCase().substring(session.message.text.toLowerCase().indexOf('inc'));
            log.consoleDefault(session.message.text.toLowerCase().indexOf('inc'));
        }
        
        log.consoleDefault(session.conversationData.IncidentNumber);

        if(session.conversationData.IncidentNumber === '' || session.conversationData.IncidentNumber === null || session.conversationData.IncidentNumber === undefined) {
            return session.beginDialog('incidentStatus', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
                }
            });
        } else {
            session.conversationData.IncidentNumber = session.conversationData.IncidentNumber.toUpperCase();
            return session.beginDialog('isSearchById', args, function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
                }
            });
        }

        //************** Commented due to mismatch of conversational flow****************//
        // if(!entities) {
        //     return session.beginDialog('incidentStatus', function(err) {
        //         if(err) {
        //             session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
        //         }
        //     });
        // } else {
        //     return session.beginDialog('getincidentStatus', entities, function(err) {
        //         if(err) {
        //             session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
        //         }
        //     });
        // }
    }];

}());