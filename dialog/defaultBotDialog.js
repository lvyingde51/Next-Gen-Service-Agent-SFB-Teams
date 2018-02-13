(function () {
    'use strict';

    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    const lang = 'ENGLISH';
    var incidentRegex = /^(inc)\w+\d{6}$/gim;
    var serviceRequestRegex = /^(ritm)\w+\d{6}$/gim;
    var reqType = 'INCIDENTSTATUS';

    module.exports.beginDialog = [
        function (session) {
            session.conversationData.capturedOption = '';
            session.conversationData.capturedStr = '';
            session.conversationData.comment = '';
            session.conversationData.incident_state = '';
            session.conversationData.urgency = '';
            session.conversationData.category = '';
            session.conversationData.short_description = '';
            session.conversationData.sys_id = '';

            var textsess = session.message.text;
            console.log(textsess.match(incidentRegex));
            console.log(textsess.match(serviceRequestRegex));

            if(textsess.match(incidentRegex)) {
                log.consoleDefault('Inside Incident');
                reqType = 'INCIDENTSTATUS';
            }
            else if(textsess.match(serviceRequestRegex)) {
                log.consoleDefault('Inside Service Request');
                reqType = 'SERVICEREQUEST';
            }
            log.consoleDefault(reqType);

            if (textsess.match(incidentRegex) != null || textsess.match(serviceRequestRegex) != null) {
                session.conversationData.capturedStr = session.message.text;
                apiService.getStatusByNumber(session.conversationData.capturedStr, reqType, function (data) {
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
                        if(reqType === 'SERVICEREQUEST') {
                            let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.SRNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Installation Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Approval: ' + data.result[0].approval.toUpperCase() + ' <br/>Stage: ' + data.result[0].stage.toUpperCase().split('_').join(' ') + ' <br/>Due Date: ' + data.result[0].due_date;
                            session.endDialog(msg);
                        }

                        if(reqType === 'SERVICEREQUEST') {
                            session.conversationData.sys_id = data.result[0].sys_id;
                            console.log('-- sys_id --', session.conversationData.sys_id);
                            session.conversationData.incident_state = data.result[0].incident_state;
                            session.conversationData.urgency = data.result[0].urgency;
                            session.conversationData.category = data.result[0].category;
                            session.conversationData.short_description = data.result[0].short_description;
                            console.log('--status of incident-- ', session.conversationData.incident_state);
                            let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + jsonData.incidentStatus[session.conversationData.incident_state][lang];
                            session.send(msg);
                            // 1 - New | 2 - In Progress | 3 - On Hold | 6 - Resolved | 7 - Closed | 8 - Canceled
                            if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                builder.Prompts.choice(session, 'What do you want to do with the entered incident number?', ['Reopen']);
                            } else {
                                builder.Prompts.choice(session, 'What do you want to do with the entered incident number?', ['Add Comment', 'Close']);
                            }
                        }                        
                    }
                });

            } else {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
                session.endDialog();
            }
        },
        function (session, results) {

            session.conversationData.capturedOption = results.response.entity;
            if (results.response.entity == 'Add Comment') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments for your incident');
            } else if (results.response.entity == 'Reopen') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments for your reopening incident');
            } else if (results.response.entity == 'Close') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments for your closing incident');
            }
        },
        function (session, results) {
            var objData = new jsonData.statusUpdate();
            objData.caller_id = 'rubin.crotts@example.com';
            if (session.conversationData.capturedOption == 'Add Comment') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = session.conversationData.incident_state;
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully added comment for your incident:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + session.conversationData.urgency + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + session.conversationData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.sys_id = '';
                    session.endDialog(msg);
                });
            } else if (session.conversationData.capturedOption == 'Reopen') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = 'In Progress';
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully reopened your incident:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + session.conversationData.urgency + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.endDialog(msg);
                });
            } else if (session.conversationData.capturedOption == 'Close') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = 'Closed';
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully closed your incident:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + session.conversationData.urgency + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.endDialog(msg);
                });
            }
        }
    ];

}());