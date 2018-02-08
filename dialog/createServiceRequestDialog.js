(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('SR.Create', createServiceRequest)
    }
    
    var createServiceRequest = [(session,args) => {

        log.consoleDefault('*** Create Service Request ***'); // Console Start

        let entities = args.entities;
        // session.conversationData.category = '';
        // session.conversationData.shortDescription = '';
        // session.conversationData.severity = '';
        // session.conversationData.severity = builder.EntityRecognizer.findEntity(args.entities, 'urgency')?builder.EntityRecognizer.findEntity(args.entities, 'urgency').entity:'';
        // session.conversationData.shortDescription = builder.EntityRecognizer.findEntity(args.entities, 'shortDescription')?builder.EntityRecognizer.findEntity(args.entities, 'shortDescription').entity:'';
        // session.conversationData.category = builder.EntityRecognizer.findEntity(args.entities, 'category')?builder.EntityRecognizer.findEntity(args.entities, 'category').entity:'';
        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        return session.beginDialog('createServiceRequest', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
            }
        });
        
        
    }];    

}());