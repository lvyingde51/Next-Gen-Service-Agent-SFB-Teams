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
    const reqListType = 'SERVICELIST';
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
            if (!results.response.match(commonTemplate.regexPattern['SERVICEREGEX'])) {
                session.endDialog(botDialogs.INVALIDSERVICEFORMAT[lang]);
                session.beginDialog('srSearchById', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with srSearchById ' + err.message));
                    }
                });
                return false;
            }
            session.conversationData.SRNumber = results.response;
            // Make API call to Service Now with Service Id and get Response...
            session.send(pleaseWait["SRSTATUS"][lang]);
            apiService.getStatusByNumber(session.conversationData.SRNumber, reqType, function (data) {
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
                    session.conversationData.short_description = data.result[0].short_description;
                    session.conversationData.state = data.result[0].state;
                    session.conversationData.approval = data.result[0].approval.toUpperCase();
                    session.conversationData.Stage = data.result[0].stage.toUpperCase().split('_').join(' ');
                    session.conversationData.DueDate = data.result[0].due_date;
                    var message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.SRNumber, `Installation Status : ${commonTemplate.incidentStatus[session.conversationData.state][lang]} <%>nApproval : ${session.conversationData.approval} <%>nStage : ${session.conversationData.Stage} <%>Due Date : ${session.conversationData.DueDate}`, session.conversationData.short_description, [], '', 'SRStatus');
                    session.endDialog(message).endConversation();
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
            apiService.getStatusByList(reqListType, function (data) {
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                } else {
                    servicestatusArr = data.result;
                    log.consoleDefault(servicestatusArr);
                    var requestDate = '';
                    for (let count = 0; count < servicestatusArr.length; count++) {
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
            let arrIndex = servicestatusArr.findIndex(x => x.number == session.conversationData.SRNumber);
            session.conversationData.short_description = servicestatusArr[arrIndex].short_description;
            session.conversationData.state = servicestatusArr[arrIndex].state;
            session.conversationData.approval = servicestatusArr[arrIndex].approval;
            session.conversationData.Stage = servicestatusArr[arrIndex].stage.split('_').join(' ');
            session.conversationData.DueDate = servicestatusArr[arrIndex].due_date;

            var message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.SRNumber, `Installation Status : ${commonTemplate.incidentStatus[session.conversationData.state][lang]} <%>nApproval : ${session.conversationData.approval} <%>nStage : ${session.conversationData.Stage} <%>Due Date : ${session.conversationData.DueDate}`, session.conversationData.short_description, [], '', 'SRStatus');
            session.endDialog(message).endConversation();            
        }
    ];
}());