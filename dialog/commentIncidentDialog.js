(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Comment.Incident', commentIncident)
    }
    
    var commentIncident = [(session,args) => {

        log.consoleDefault('*** Comment Incident ***'); // Console Start

        let entities = args.entities;
        
        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber')?builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity:'';
        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        return session.beginDialog('commentIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with commentIncident: ' + err.message));
            }
        });
        
        
    }];    

}());