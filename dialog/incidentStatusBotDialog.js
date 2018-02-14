(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var moment = require('moment');
    var apiService = require('../server/apiServices');
    var incidentstatusArr = [];
    var commonTemplate = require('../utils/commonTemplate');
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'INCIDENTSTATUS';

    // Incident Request Status List
    module.exports.beginDialog = [
        function (session, args) {
            builder.Prompts.choice(session, 'How do you want me to search it?', ['By Incident Id', 'Last 10 Incidents']);            
        },
        function (session, results) {
            session.conversationData.ISSearchType = results.response.entity;

            if (session.conversationData.ISSearchType === 'By Incident Id') {
                session.beginDialog('isSearchById', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
                    }
                });
            }
            if (session.conversationData.ISSearchType === 'Last 10 Incidents') {
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
        function (session, args, next) {            
            if (!session.conversationData.ISIncidentId) {
                builder.Prompts.text(session, 'Please provide your Incident Id');
            } else {
                next({ response: session.conversationData.ISIncidentId });
            }
        },
        function (session, results) {
            session.conversationData.ISIncidentId = results.response;
            // Make API call to Service Now with Incident Id and get Response...
            session.send(pleaseWait["INCIDENTSTATUS"][lang]);
            apiService.getStatusByNumber(session.conversationData.ISIncidentId, reqType, function (data) {
                log.consoleDefault(JSON.stringify(data));
                if (!data) {
                    let msg = 'An error has occurred while fetching the details... Please try again later...';
                    session.endDialog(msg);
                    return false;
                }

                if (data.hasOwnProperty('error')) {
                    let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again!!!';
                    session.endDialog(msg);

                    session.conversationData.ISIncidentId = '';
                    session.beginDialog('isSearchById', null, function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
                        }
                    });
                } else {
                    let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
                    log.consoleDefault(assignedTo);
                    log.consoleDefault(commonTemplate.incidentStatus[data.result[0].state][lang]);
                    if(assignedTo == '-') {
                        let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.ISIncidentId + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: Unassigned';
                        session.endDialog(msg);
                    } else {
                        // session.send(pleaseWait["DEFAULT"][lang]);
                        apiService.getAssignedToDetails(assignedTo, function (resp) {
                            if (!resp) {
                                let msg = 'An error has occurred while fetching the details... Please try again later...';
                                session.endDialog(msg);
                                return false;
                            } else {
                                log.consoleDefault(JSON.stringify(resp));
                                let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.ISIncidentId + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                                session.endDialog(msg);
                            }
                        });
                    }                                        
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
            session.send(pleaseWait["INCIDENTLIST"][lang]);
            apiService.getStatusByList(reqType, function (data) {
                if (!data) {
                    let msg = 'An error has occurred while retrieving the data... Please try again later...';
                    session.endDialog(msg);
                    return false;
                } else {
                    incidentstatusArr = data.result.reverse();
                    // incidentstatusArr.slice((incidentstatusArr.length - 10), incidentstatusArr.length);
                    // incidentstatusArr.slice(Math.max(incidentstatusArr.length - 10, 1));
                    log.consoleDefault(incidentstatusArr);
                    var incidentDate = ''; 
                    for (let count = 0; count < incidentstatusArr.length && count < 10; count++) {
                        incidentDate = moment(incidentstatusArr[count].sys_updated_on).format('LLL');
                        incidentArr.push(incidentstatusArr[count].number + ' - ' + incidentstatusArr[count].category + ' - ' + incidentDate);
                    }
                    builder.Prompts.choice(session, 'List of Incidents', incidentArr);
                }
            });
        },
        function (session, results) {
            let incidentId = results.response.entity.split('-')[0];
            session.conversationData.ISIncidentId = incidentId.trim();

            //Filter out JSON from previous API call and display the status of Incident from **incidentstatusArr**
            let arrIndex = incidentstatusArr.findIndex(x => x.number == session.conversationData.ISIncidentId);
            log.consoleDefault(session.conversationData.ISIncidentId);
            let assignedTo = incidentstatusArr[arrIndex].assigned_to == '' ? '-' : incidentstatusArr[arrIndex].assigned_to.link;
            log.consoleDefault(assignedTo);
            if(assignedTo == '-') {
                let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.ISIncidentId + ' <br/>Short Description : ' + incidentstatusArr[arrIndex].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang] + ' <br/>Assigned To: Unassigned';
                session.endDialog(msg);
                return false;
            } else {
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getAssignedToDetails(assignedTo, function (resp) {
                    if (!resp) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    } else {
                        log.consoleDefault(JSON.stringify(resp));
                        let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.ISIncidentId + ' <br/>Short Description : ' + incidentstatusArr[arrIndex].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                        session.endDialog(msg);
                    }
                });
            }
        }
    ];

    //************** Commented due to mismatch of conversational flow****************//
    // Fetch Incident Status Directly
    // module.exports.getincidentStatus = [
    //     function (session, args) {
    //         try {
    //             log.consoleDefault(args); // Console Args
    //             session.conversationData.ISIncidentId = args[0].resolution.value;

    //             // Make API call to Service Now with Incident Id and get Response...
    //             session.send(pleaseWait["INCIDENTSTATUS"][lang]);
    //             apiService.getIncidentStatusByNumber(session.conversationData.ISIncidentId, function (data) {
    //                 log.consoleDefault(JSON.stringify(data));
    //                 if (!data) {
    //                     let msg = 'An error has occurred while fetching the details... Please try again later...';
    //                     session.endDialog(msg);
    //                     return false;
    //                 }

    //                 if (data.hasOwnProperty('error')) {
    //                     let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
    //                     session.endDialog(msg);
    //                 } else {
    //                     let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.ISIncidentId + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + data.result[0].assigned_to + ' <br/>What do you want to do next?';
    //                     session.endDialog(msg);
    //                 }
    //             });
    //         }
    //         catch (err) {
    //             log.consoleDefault('Incident status Error:' + err);
    //             let msg = 'An error has occurred... Please try again later...';
    //             session.endDialog(msg);
    //             return false;
    //         }
    //     }
    // ];
}());