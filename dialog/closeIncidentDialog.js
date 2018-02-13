(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Close.Incident', createIncident)
    }
    
    var createIncident = [(session,args) => {

        log.consoleDefault('*** Close Incident ***'); // Console Start

        let entities = args.entities;
        
        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber')?builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity:'';
        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        return session.beginDialog('closeIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with closeIncident: ' + err.message));
            }
        });
        
        
    }];    

}());