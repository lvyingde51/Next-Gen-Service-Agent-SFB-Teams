(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var apiService = require('../server/apiServices');
    var incidentArr = [];

    // Incident Request Status List
    module.exports.beginDialog = [
        function (session) {
            builder.Prompts.choice(session, 'How do you want me to search it?', ['By Incident Id', 'Last 10 Incidents']);
        },
        function (session, results) {
            session.userData.ISSearchType = results.response.entity;

            if (session.userData.ISSearchType === 'By Incident Id') {
                session.beginDialog('isSearchById', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchById' + err.message));
                    }
                });
            }
            if (session.userData.ISSearchType === 'Last 10 Incidents') {
                session.beginDialog('isSearchByList', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchByList' + err.message));
                    }
                });
            }
        }
    ];

    // Search Incident Status by ID
    module.exports.incidentID = [
        function (session) {
            builder.Prompts.text(session, 'Please provide your Incident Id');
        },
        function (session, results) {
            session.userData.ISIncidentId = results.response;
            // Make API call to Service Now with Incident Id and get Response...
            apiService.getIncidentStatusByNumber(session.userData.ISIncidentId, function (data) {
                log.consoleDefault(JSON.stringify(data));
                let msg = 'Below are the details for the requested incident:- \nIncident Id : ' + session.userData.ISIncidentId + ' \nShort Description : '+ data.result[0].short_description +' \nStatus: In Progress \nAssigned To: '+ data.result[0].assigned_to +' \nWhat do you want to do next?';
                session.endDialog(msg);
            });
        }
    ];

    // Search Last 10 Incident Status
    module.exports.prevIncidents = [
        function (session) {
            // Make API call to Service Now and get Response for Last 10 requests...
            incidentArr = [];
            builder.Prompts.choice(session, 'List of Incidents', ['INC 0010410', 'INC 0010411', 'INC 0010412', 'INC 0010413', 'INC 0010414']);
        },
        function (session, results) {
            session.userData.ISIncidentId = results.response.entity;

            //Filter out JSON from previous API call and display the status of Incident from **incidentArr**
            let msg = 'Below are the details for the requested incident:- \nIncident Id : INC 0010410 \nShort Description : Mouse not working \nStatus: In Progress \nAssigned To: Don Goodliffe \nWhat do you want to do next?';
            session.endDialog(msg);
        }
    ];
}());