(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Create.Incident', createIncident)
    }
    
    var createIncident = [(session,args) => {

        log.consoleDefault('*** Create Incident ***'); // Console Start

        let entities = args.entities;

        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        session.beginDialog('createIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
            }
        });
        
        
    }];

    bot.dialog('createIncident', [
        function (session) {
            builder.Prompts.choice(session, 'Please Choose a Severity level.', ['High', 'Medium', 'Low']);
        },
        function(session, results) {
            session.userData.CISeverity = results.response.entity;

        }    
    ]);

}());