(function () {
    'use strict';
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    /* ### Matching Close Intent ### */
    exports.load = function(intentDialog) {
        intentDialog.matches('Close.Incident', closeIncident)
    }

    /* ### After Matched Close Intent - Init the Bot Dialog ### */
    var closeIncident = [(session,args) => {
        let entities = args.entities;
        /* ### Getting Incident Number from Entity Recognizer ### */
        session.conversationData.IncidentNumber = builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber')?builder.EntityRecognizer.findEntity(args.entities, 'IncidentNumber').entity:'';
        log.consoleDefault('*** Close Incident ***');
        log.consoleDefault('*** Close Incident - Arguments ***',JSON.stringify(args));
        log.consoleDefault('*** Close Incident - Argument Entities ***',JSON.stringify(entities));
        return session.beginDialog('closeIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with closeIncident: ' + err.message));
            }
        });
    }];
}());