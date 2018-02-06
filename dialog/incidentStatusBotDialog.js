(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var apiService = require('../server/apiServices');
    var incidentstatusArr = [];
    var commonTemplate = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

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
                if (!data) {
                    let msg = 'An error has occurred while fetching the details... Please try again later...';
                    session.endDialog(msg);
                    return false;
                }

                if (data.hasOwnProperty('error')) {
                    let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                    session.endDialog(msg);
                } else {
                    let msg = 'Below are the details for the requested incident :- \nIncident Id : ' + session.userData.ISIncidentId + ' \nShort Description : ' + data.result[0].short_description + ' \nStatus: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' \nAssigned To: ' + data.result[0].assigned_to + ' \nWhat do you want to do next?';
                    session.endDialog(msg);
                }
            });
        }
    ];

    // Search Last 10 Incident Status
    module.exports.prevIncidents = [
        function (session) {
            // Make API call to Service Now and get Response for Last 10 requests...
            incidentstatusArr = [];
            let incidentArr = [];
            apiService.getIncidentStatusByList(function (data) {
                if (!data) {
                    let msg = 'An error has occurred while retrieving the data... Please try again later...';
                    session.endDialog(msg);
                    return false;
                } else {

                    incidentstatusArr = data.result.reverse();
                    // incidentstatusArr.slice((incidentstatusArr.length - 10), incidentstatusArr.length);
                    // incidentstatusArr.slice(Math.max(incidentstatusArr.length - 10, 1));
                    log.consoleDefault(incidentstatusArr);
                    for (let count = 0; count < incidentstatusArr.length && count < 10; count++) {
                        incidentArr.push(incidentstatusArr[count].number);
                    }
                    builder.Prompts.choice(session, 'List of Incidents', incidentArr);
                }
            });
        },
        function (session, results) {
            session.userData.ISIncidentId = results.response.entity;

            //Filter out JSON from previous API call and display the status of Incident from **incidentstatusArr**
            log.consoleDefault(incidentstatusArr);
            let arrIndex = incidentstatusArr.findIndex(x => x.number == session.userData.ISIncidentId);
            let msg = 'Below are the details for the requested incident :- \nIncident Id : ' + session.userData.ISIncidentId + ' \nShort Description : ' + incidentstatusArr[arrIndex].short_description + ' \nStatus: ' + commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang] + ' \nAssigned To: ' + incidentstatusArr[arrIndex].assigned_to + ' \nWhat do you want to do next?';
            session.endDialog(msg);
        }
    ];
}());