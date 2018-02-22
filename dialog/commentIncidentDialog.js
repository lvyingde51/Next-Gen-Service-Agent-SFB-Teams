(function () {
    'use strict';    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    /* ### Matching Comment Intent ### */
    exports.load = function(intentDialog) {
        intentDialog.matches('Comment.Incident', commentIncident)
    }
    
    /* ### After Matched Comment Intent - Init the Bot Dialog ### */
    var commentIncident = [(session,args) => {
        let entities = args.entities;
        /* ### Getting Incident Number from Entity Recognizer ### */
        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber')?builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity:'';
        log.consoleDefault('*** Comment Incident ***');
        log.consoleDefault('*** Comment Incident - Arguments ***',JSON.stringify(args));
        log.consoleDefault('*** Comment Incident - Argument Entities ***',JSON.stringify(entities));      
        return session.beginDialog('commentIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with commentIncident: ' + err.message));
            }
        });
    }];    
}());