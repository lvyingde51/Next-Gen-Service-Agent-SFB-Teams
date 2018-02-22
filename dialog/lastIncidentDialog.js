(function () {
    'use strict';    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    /* ### Matching Last Intent ### */
    exports.load = function(intentDialog) {
        intentDialog.matches('Last.Incident', createIncident)
    }
    
    /* ### After Matched Last Intent - Init the Bot Dialog ### */
    var createIncident = [(session,args) => {
        log.consoleDefault('*** Previous Incident ***'); 
        return session.beginDialog('lastIncident', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with Last Incident: ' + err.message));
            }
        });       
    }];    
}());