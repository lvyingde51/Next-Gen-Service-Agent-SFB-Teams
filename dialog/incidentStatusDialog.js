(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');
    // var bot = require('./incidentStatusBotDialog');

    exports.load = function(intentDialog) {
        intentDialog.matches('Incident.Status', incidentStatus)
    }
    
    var incidentStatus = [(session, args) => {

        log.consoleDefault('*** Recent 10 Incident Status ***'); // Console Start

        let entities = args.entities;

        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity

        session.conversationData.ISSearchType = builder.EntityRecognizer.findEntity(args.entities, 'number') ? builder.EntityRecognizer.findEntity(args.entities, 'number').entity : '';

        if(!session.conversationData.ISSearchType) {
            return session.beginDialog('incidentStatus', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
                }
            });
        } else {
            return session.beginDialog('incidentID', args, function(err) {
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