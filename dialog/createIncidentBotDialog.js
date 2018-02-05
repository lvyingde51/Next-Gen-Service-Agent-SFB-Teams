(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
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
    module.exports.category= [
        function (session) {
            builder.Prompts.choice(session, 'Please Select your Category of the incident', ['Enquiry']);
        },
        function(session, results) {
            session.userData.category = results.response.entity;

            session.beginDialog('viewResult', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                }
            });
        }
    ];
    module.exports.viewResult= [
        function (session) {
            var dataService = "{short_description: "+session.userData.shortDescription+",caller_id: 'Pourab Karchaudhuri',category:"+session.userData.category+",urgency: "+session.userData.severity+",comments: 'Testing Create incident' },json: true }";
             console.log('||||||||||||||||||',dataService);
            apiService.createIncidentService(dataService, function (data) {
                console.log('^^^^^^^^^^^^^^^^^^^^^',data);
                let msg = 'Successfully created incident:- \nIncident Id : INC 0010410 \nShort Description : Mouse not working \nStatus: In Progress \nAssigned To: Don Goodliffe \nWhat do you want to do next?';
                session.endDialog(msg);
            });
            
        }
    ];
}());