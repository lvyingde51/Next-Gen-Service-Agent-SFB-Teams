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

        log.consoleDefault(JSON.stringify(entities)); // Console Entity

        return session.beginDialog('incidentStatus', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
            }
        });
    }];

}());