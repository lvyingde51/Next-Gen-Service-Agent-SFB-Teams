(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    module.exports.beginDialog = [
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
    ];
}());