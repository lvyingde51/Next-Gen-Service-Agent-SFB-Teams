(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Last.Incident', createIncident)
    }
    
    var createIncident = [(session,args) => {

        log.consoleDefault('*** Previous Incident ***'); // Console Start

        return session.beginDialog('lastIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with Last Incident: ' + err.message));
            }
        });
        
        
    }];    

}());