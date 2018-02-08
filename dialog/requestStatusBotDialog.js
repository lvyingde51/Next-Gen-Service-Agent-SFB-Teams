(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var apiService = require('../server/apiServices');
    var servicestatusArr = [];
    var commonTemplate = require('../utils/commonTemplate');
    const lang = 'ENGLISH';
    const reqType = 'SERVICEREQUEST';

    // Service Request Status List
    module.exports.beginDialog = [
        function (session, args) {
            builder.Prompts.choice(session, 'How do you want me to search it?', ['By Service ID', 'Last 10 Service Requests']);
        },
        function (session, results) {
            session.conversationData.SRSearchType = results.response.entity;

            if (session.conversationData.SRSearchType === 'By Service ID') {
                session.beginDialog('srSearchById', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
                    }
                });
            }
            if (session.conversationData.SRSearchType === 'Last 10 Service Requests') {
                session.beginDialog('srSearchByList', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchByList' + err.message));
                    }
                });
            }
        }
    ];

    // Search Service Request Status by ID
    module.exports.serviceID = [
        function (session, args, next) {
            if (!session.conversationData.SRNumber) {
                builder.Prompts.text(session, 'Please provide your Service Id');
            } else {
                next({ response: session.conversationData.SRNumber });
            }
        },
        function (session, results) {
            session.conversationData.SRNumber = results.response;
            // Make API call to Service Now with Service Id and get Response...
            apiService.getStatusByNumber(session.conversationData.SRNumber, reqType, function (data) {
                log.consoleDefault(JSON.stringify(data));
                if (!data) {
                    let msg = 'An error has occurred while fetching the details... Please try again later...';
                    session.endDialog(msg);
                    return false;
                }

                if (data.hasOwnProperty('error')) {
                    let msg = 'Service Id does not exist in our database. ' + data.error.message + ' Please try again';
                    session.endDialog(msg);
                    session.conversationData.SRNumber = '';
                    session.beginDialog('srSearchById', args, function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with serviceRequest: ' + err.message));
                        }
                    });
                } else {
                    let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
                    log.consoleDefault(assignedTo);
                    log.consoleDefault(commonTemplate.incidentStatus[data.result[0].state][lang]);
                    if (assignedTo == '-') {
                        let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Approval: Approved <br/>Stage: Deployment Successful <br/>Due Date: 11/08/2017';
                        session.endDialog(msg);
                    } else {
                        apiService.getAssignedToDetails(assignedTo, function (resp) {
                            if (!resp) {
                                let msg = 'An error has occurred while fetching the details... Please try again later...';
                                session.endDialog(msg);
                                return false;
                            } else {
                                log.consoleDefault(JSON.stringify(resp));
                                let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Approval: Approved <br/>Stage: Deployment Successful <br/>Due Date: 11/08/2017';
                                session.endDialog(msg);
                            }
                        });
                    }
                }
            });
        }
    ];

    // Search Last 10 Service Request
    module.exports.prevIncidents = [
        function (session) {
            // Make API call to Service Now and get Response for Last 10 service requests...
            servicestatusArr = [];
            let serviceArr = [];
            apiService.getStatusByList(reqType, function (data) {
                if (!data) {
                    let msg = 'An error has occurred while retrieving the data... Please try again later...';
                    session.endDialog(msg);
                    return false;
                } else {
                    servicestatusArr = data.result.reverse();
                    // servicestatusArr.slice((servicestatusArr.length - 10), servicestatusArr.length);
                    // servicestatusArr.slice(Math.max(servicestatusArr.length - 10, 1));
                    log.consoleDefault(servicestatusArr);
                    for (let count = 0; count < servicestatusArr.length && count < 10; count++) {
                        serviceArr.push(servicestatusArr[count].number);
                    }
                    builder.Prompts.choice(session, 'List of Service Requests', serviceArr);
                }
            });
        },
        function (session, results) {
            session.conversationData.SRNumber = results.response.entity;

            //Filter out JSON from previous API call and display the status of Incident from **servicestatusArr**
            log.consoleDefault(servicestatusArr);
            let arrIndex = servicestatusArr.findIndex(x => x.number == session.conversationData.SRNumber);
            let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + servicestatusArr[arrIndex].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[servicestatusArr[arrIndex].state][lang] + ' <br/>Approval: Approved <br/>Stage: Deployment Successful <br/>Due Date: 11/08/2017';
            session.endDialog(msg);
        }
    ];
}());