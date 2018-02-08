(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Create.SR', createServiceRequest)
    }
    
    var createServiceRequest = [(session,args) => {

        log.consoleDefault('*** Create Service Request ***'); // Console Start

        let entities = args.entities;
        session.conversationData.SoftwareName = '';
        session.conversationData.SoftwareName = builder.EntityRecognizer.findEntity(args.entities, 'SoftwareName') ? builder.EntityRecognizer.findEntity(args.entities, 'SoftwareName').entity : '';
        log.consoleDefault(JSON.stringify(args)); // Console Args
        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        return session.beginDialog('createServiceRequest', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
            }
        });                
    }];    

}());