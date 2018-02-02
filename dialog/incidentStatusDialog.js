(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    exports.load = function(intentDialog) {
        intentDialog.matches('Incident.Status', incidentStatus)
    }
    
    var incidentStatus = [(session,args) => {

        log.consoleDefault('*** Recent 10 Incident Status ***'); // Console Start

        let entities = args.entities;

        log.consoleDefault(JSON.stringify(entities)); // Console Entity
        
        
    }];

}());