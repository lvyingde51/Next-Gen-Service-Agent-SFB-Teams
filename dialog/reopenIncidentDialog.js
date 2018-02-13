(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Reopen.Incident', createIncident)
    }
    
    var createIncident = [(session,args) => {

        log.consoleDefault('*** Reopen Incident ***'); // Console Start

        let entities = args.entities;
        
        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber')?builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity:'';
        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        return session.beginDialog('reopenIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with reopenIncident: ' + err.message));
            }
        });
        
        
    }];    

}());