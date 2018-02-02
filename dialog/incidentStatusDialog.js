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

        session.beginDialog('incidentStatus', function(err) {
            if(err) {
                session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
            }
        });
    }];

    bot.dialog('incidentStatus', [
        function (session) {
            builder.Prompts.choice(session, 'how do you want me to search it?', ['By Incident Id', 'Last 10 Incidents']);
        },
        function(session, results) {
            session.userData.ISSearchType = results.response.entity;

            if(session.userData.ISSearchType === 'By Incident Id') {
                session.beginDialog('isSearchById', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchById' + err.message));
                    }
                });
            }
            if(session.userData.ISSearchType === 'Last 10 Incidents') {
                session.beginDialog('isSearchByList', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchByList' + err.message));
                    }
                });
            }
        }    
    ]);
}());