(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    module.exports.beginDialog= [
        function (session) {
            builder.Prompts.choice(session, 'What is the Severity', ['High', 'Medium', 'Low']);
        },
        function(session, results) {
            session.userData.severity = results.response.entity;

            session.beginDialog('shortDescription', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                }
            });
            
        }
    ];
    module.exports.shortDescription= [
        function (session) {
            builder.Prompts.text(session, 'Please Provide your Short Description of the incident');
        },
        function(session, results) {
            session.userData.shortDescription = results.response;

            session.beginDialog('category', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with category' + err.message));
                }
            });
            
        }
    ];
}());