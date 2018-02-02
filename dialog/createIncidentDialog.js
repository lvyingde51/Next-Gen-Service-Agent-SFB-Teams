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
        
        
    }];

}());