(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var moment = require('moment');
    var apiService = require('../server/apiServices');
    var servicestatusArr = [];
    var commonTemplate = require('../utils/commonTemplate');
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'SERVICEREQUEST';
    var botDialogs = require('../utils/botDialogs').sendError;

    // Service Request Status List
    module.exports.beginDialog = [
        function (session, args) {
            builder.Prompts.choice(session, 'How do you want me to search it?', ['By Service ID', 'Last 10 Requests']);
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
            if (session.conversationData.SRSearchType === 'Last 10 Requests') {
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
            session.send(pleaseWait["SRSTATUS"][lang]);
            apiService.getStatusByNumber(session.conversationData.SRNumber, reqType, function (data) {
                log.consoleDefault(JSON.stringify(data));
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                }

                if (data.hasOwnProperty('error')) {
                    let msg = botDialogs.SRIDNOTFOUND[lang];
                    session.endDialog(msg);

                    session.conversationData.SRNumber = '';
                    session.beginDialog('srSearchById', null, function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with serviceRequest: ' + err.message));
                        }
                    });
                } else {
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_These are the details of the requested Service Request_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.SRNumber}*`)
                                .text(`Installation Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} \nApproval : ${data.result[0].approval.toUpperCase()} \nStage : ${data.result[0].stage.toUpperCase().split('_').join(' ')} \nDue Date : ${data.result[0].due_date}`)
                                .subtitle(`${data.result[0].short_description}`)
                            ));
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('These are the details of the requested Service Request');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.SRNumber}`)
                                .text(`Installation Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} <br/>Approval : ${data.result[0].approval.toUpperCase()} <br/>Stage : ${data.result[0].stage.toUpperCase().split('_').join(' ')} <br/>Due Date : ${data.result[0].due_date}`)
                                .subtitle(`${data.result[0].short_description}`)
                            ));
                            session.endDialog();
                            break;
                        default:
                            let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Approval: ' + data.result[0].approval.toUpperCase() + ' <br/>Stage: ' + data.result[0].stage.toUpperCase().split('_').join(' ') + ' <br/>Due Date: ' + data.result[0].due_date;
                            session.endDialog(msg);
                            break;
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
            session.send(pleaseWait["SRLIST"][lang]);
            apiService.getStatusByList(reqType, function (data) {
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                } else {
                    servicestatusArr = data.result.reverse();
                    log.consoleDefault(servicestatusArr);
                    var requestDate = '';
                    for (let count = 0; count < servicestatusArr.length && count < 10; count++) {
                        requestDate = moment(servicestatusArr[count].opened_at).format('LLL');
                        serviceArr.push(servicestatusArr[count].number + ' - ' + requestDate);
                    }
                    builder.Prompts.choice(session, 'List of Service Requests', serviceArr);
                }
            });
        },
        function (session, results) {
            let serviceNumber = results.response.entity.split('-')[0];
            session.conversationData.SRNumber = serviceNumber.trim();

            //Filter out JSON from previous API call and display the status of Incident from **servicestatusArr**
            log.consoleDefault(servicestatusArr);
            let arrIndex = servicestatusArr.findIndex(x => x.number == session.conversationData.SRNumber);
            switch (session.message.source) {
                case 'slack':
                    session.send('_These are the details of the requested Service Request_');
                    session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                        .title(`*${session.conversationData.SRNumber}*`)
                        .text(`Installation Status : ${commonTemplate.incidentStatus[servicestatusArr[arrIndex].state][lang]} \nApproval : ${servicestatusArr[arrIndex].approval} \nStage : ${servicestatusArr[arrIndex].stage.split('_').join(' ')} \nDue Date : ${servicestatusArr[arrIndex].due_date}`)
                        .subtitle(`${servicestatusArr[arrIndex].short_description}`)
                    ));
                    session.endDialog();
                    break;
                case 'msteams':
                    session.send('These are the details of the requested Service Request');
                    session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                        .title(`${session.conversationData.SRNumber}`)
                        .text(`Installation Status : ${commonTemplate.incidentStatus[servicestatusArr[arrIndex].state][lang]} <br/>Approval : ${servicestatusArr[arrIndex].approval} <br/>Stage : ${servicestatusArr[arrIndex].stage.split('_').join(' ')} <br/>Due Date : ${servicestatusArr[arrIndex].due_date}`)
                        .subtitle(`${servicestatusArr[arrIndex].short_description}`)
                    ));
                    session.endDialog();
                    break;
                default:
                    let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + servicestatusArr[arrIndex].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[servicestatusArr[arrIndex].state][lang] + ' <br/>Approval: ' + servicestatusArr[arrIndex].approval + ' <br/>Stage: ' + servicestatusArr[arrIndex].stage.split('_').join(' ') + ' <br/>Due Date: ' + servicestatusArr[arrIndex].due_date;
                    session.endDialog(msg);
                    break;
            }
        }
    ];
}());