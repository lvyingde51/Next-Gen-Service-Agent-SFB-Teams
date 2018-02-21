(function () {
    'use strict';
    var builder = require('botbuilder');    
    var log = require('../utils/logs');
    /* ### Matching Create Intent ### */
    exports.load = function(intentDialog) {
        intentDialog.matches('Create.Incident', createIncident)
    }

    /* ### After Matched Create Intent - Init the Bot Dialog ### */
    var createIncident = [(session,args) => {
        let entities = args.entities;
        session.conversationData.category = '';
        session.conversationData.shortDescription = '';
        session.conversationData.severity = '';
        session.conversationData.severity = builder.EntityRecognizer.findEntity(args.entities, 'urgency')?builder.EntityRecognizer.findEntity(args.entities, 'urgency').entity:'';
        session.conversationData.shortDescription = builder.EntityRecognizer.findEntity(args.entities, 'shortDescription')?builder.EntityRecognizer.findEntity(args.entities, 'shortDescription').entity:'';
        session.conversationData.category = builder.EntityRecognizer.findEntity(args.entities, 'category')?builder.EntityRecognizer.findEntity(args.entities, 'category').resolution.values[0]:'';
        log.consoleDefault('*** Create Incident ***');
        log.consoleDefault('*** Create Incident - Arguments ***',JSON.stringify(args));
        log.consoleDefault('*** Create Incident - Argument Entities ***',JSON.stringify(entities));        
        return session.beginDialog('createIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with Create Incident: ' + err.message));
            }
        });       
    }];    
}());