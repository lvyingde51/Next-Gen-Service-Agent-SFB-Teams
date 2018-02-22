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
    const reqListType = 'INCIDENTLIST';
    var botDialogs = require('../utils/botDialogs').sendError;
    var progress = require('../utils/commonTemplate').progress;

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
            if (!session.conversationData.IncidentNumber) {
                builder.Prompts.text(session, 'Please provide your Incident Id');
            } else {                
                next({ response: session.conversationData.IncidentNumber });
            }
        },
        function (session, results) {
            if(session.conversationData.IncidentNumber == 'INC1234567') {
                builder.Prompts.text(session, 'Please provide your Incident Id', {
                    retryPrompt: 'The value you entered is not a valid Incident ID. Please try again:',
                    maxRetries: 2
                });
            } else {
                return false;
            // if (!results.response.match(commonTemplate.regexPattern['INCIDENTREGEX'])) {
            //     session.endDialog(botDialogs.INVALIDINCIDENTFORMAT[lang]);
            //     session.beginDialog('isSearchById', function (err) {
            //         if (err) {
            //             session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
            //         }
            //     });
            //     return false;
            // }
            // session.conversationData.IncidentNumber = results.response;
            // // Make API call to Service Now with Incident Id and get Response...
            // //  session.send(pleaseWait["INCIDENTSTATUS"][lang]);
            // let options = {
            //     initialText: pleaseWait["INCIDENTSTATUS"][lang],
            //     text: 'Please wait... This is taking a little longer than expected.',
            //     speak: '<speak>Please wait.<break time="2s"/></speak>'
            // };

            // progress(session, options, function (callback) {
            //     apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
            //         if (!data) {
            //             let msg = botDialogs.DEFAULT[lang];
            //             session.endDialog(msg);
            //             return false;
            //         }

            //         if (data.hasOwnProperty('error')) {
            //             let msg = botDialogs.INCIDENTNOTFOUND[lang];
            //             session.endDialog(msg);

            //             session.conversationData.IncidentNumber = '';
            //             session.beginDialog('isSearchById', null, function (err) {
            //                 if (err) {
            //                     session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
            //                 }
            //             });
            //         } else {
            //             let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
            //             log.consoleDefault(assignedTo);
            //             log.consoleDefault(commonTemplate.incidentStatus[data.result[0].state][lang]);
            //             session.conversationData.incident_state = data.result[0].incident_state;
            //             session.conversationData.urgency = data.result[0].urgency;
            //             session.conversationData.category = data.result[0].category;
            //             session.conversationData.short_description = data.result[0].short_description;
            //             session.conversationData.sys_id = data.result[0].sys_id;
            //             var message = '';
            //             var buttonArr = commonTemplate.getButtonsList(session, 'CardArray');

            //             if (assignedTo == '-') {
            //                 message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.IncidentNumber, `Urgency : ${commonTemplate.urgencyStatic[session.conversationData.urgency][lang]} <%>Status : ${commonTemplate.incidentStatus[session.conversationData.incident_state][lang]} <%>Assigned To : Unassigned`, session.conversationData.short_description, buttonArr, assignedTo, 'IncidentStatus');
            //             } else {
            //                 // session.send(pleaseWait["DEFAULT"][lang]);
            //                 apiService.getAssignedToDetails(assignedTo, function (resp) {
            //                     if (!resp) {
            //                         let msg = botDialogs.DEFAULT[lang];
            //                         session.endDialog(msg);
            //                         return false;
            //                     } else {
            //                         assignedTo = resp.result.name;
            //                         message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.IncidentNumber, `Urgency : ${commonTemplate.urgencyStatic[session.conversationData.urgency][lang]} <%>Status : ${commonTemplate.incidentStatus[session.conversationData.incident_state][lang]} <%>Assigned To : ${resp.result.name}`, session.conversationData.short_description, buttonArr, assignedTo, 'IncidentStatus');
            //                     }
            //                 });
            //             }
            //             session.endDialog();
            //             callback(`Start Over`);
            //             session.beginDialog('updateIncident', message, function (err) {
            //                 if (err) {
            //                     session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
            //                 }
            //             });
            //         }
            //     });
            // });
            }
        }
    ];

    // Search Last 10 Incident Status
    module.exports.prevIncidents = [
        function (session) {
            // Make API call to Service Now and get Response for Last 10 requests...
            incidentstatusArr = [];
            let incidentArr = [];
            session.send(pleaseWait["INCIDENTLIST"][lang]);
            apiService.getStatusByList(reqListType, function (data) {
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                } else {
                    incidentstatusArr = data.result;
                    // incidentstatusArr.slice((incidentstatusArr.length - 10), incidentstatusArr.length);
                    // incidentstatusArr.slice(Math.max(incidentstatusArr.length - 10, 1));
                    var incidentDate = '';
                    var incidentCategory = '';
                    for (let count = 0; count < incidentstatusArr.length; count++) {
                        incidentDate = moment(incidentstatusArr[count].sys_updated_on).format('LLL');
                        incidentCategory = commonTemplate.camelCase(incidentstatusArr[count].category);
                        incidentArr.push(incidentstatusArr[count].number + ' - ' + incidentCategory + ' - ' + incidentDate);
                    }
                    builder.Prompts.choice(session, 'List of Incidents', incidentArr);
                }
            });
        },
        function (session, results) {
            let incidentId = results.response.entity.split('-')[0];
            session.conversationData.IncidentNumber = incidentId.trim();

            //Filter out JSON from previous API call and display the status of Incident from **incidentstatusArr**
            let arrIndex = incidentstatusArr.findIndex(x => x.number == session.conversationData.IncidentNumber);
            log.consoleDefault(session.conversationData.IncidentNumber);
            let assignedTo = incidentstatusArr[arrIndex].assigned_to == '' ? '-' : incidentstatusArr[arrIndex].assigned_to.link;
            log.consoleDefault(assignedTo);

            session.conversationData.incident_state = incidentstatusArr[arrIndex].incident_state;
            session.conversationData.urgency = incidentstatusArr[arrIndex].urgency;
            session.conversationData.category = incidentstatusArr[arrIndex].category;
            session.conversationData.short_description = incidentstatusArr[arrIndex].short_description;
            session.conversationData.sys_id = incidentstatusArr[arrIndex].sys_id;
            var message = '';
            var buttonArr = commonTemplate.getButtonsList(session, 'CardArray');

            if (assignedTo == '-') {
                message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.IncidentNumber, `Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <%>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].incident_state][lang]} <%>Assigned To : Unassigned`, session.conversationData.short_description, buttonArr, assignedTo, 'IncidentStatus');
            } else {
                // session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                let options = {
                    initialText: pleaseWait["INCIDENTSTATUS"][lang],
                    text: 'Please wait... This is taking a little longer than expected.',
                    speak: '<speak>Please wait.<break time="2s"/></speak>'
                };

                progress(session, options, function (callback) {
                    apiService.getAssignedToDetails(assignedTo, function (resp) {
                        if (!resp) {
                            let msg = botDialogs.DEFAULT[lang];
                            session.endDialog(msg);
                            return false;
                        } else {
                            message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.IncidentNumber, `Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <%>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].incident_state][lang]} <%>Assigned To : ${resp.result.name}`, session.conversationData.short_description, buttonArr, assignedTo, 'IncidentStatus');
                            callback(`Start Over`);
                        }
                    });
                });
            }
            session.endDialog();
            session.beginDialog('updateIncident', message, function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
                }
            });
        }
    ];

    module.exports.updateIncident = [
        function (session, message) {
            try {
                builder.Prompts.choice(session, message, commonTemplate.getButtonsList(session, 'Buttons'));
            }
            catch (err) {
                log.consoleDefault('Incident status Error:' + err);
                let msg = botDialogs.DEFAULT[lang];
                session.endDialog(msg);
                return false;
            }
        },
        function (session, results) {
            session.conversationData.capturedOption = results.response.entity;
            if (results.response.entity == 'Thank You') {
                session.endDialog('Happy to help!');
            } else {
                builder.Prompts.text(session, 'Okay, Please enter your comment');
            }
        },
        function (session, results) {
            var message = null;
            var waitType = null;
            var objData = new commonTemplate.statusUpdate();
            session.conversationData.comment = results.response;
            objData.comments = session.conversationData.comment;
            if (session.conversationData.capturedOption == 'Add a Comment') {
                waitType = "INCIDENTADDCOMMENT";
                objData.incident_state = session.conversationData.incident_state;
            } else if (session.conversationData.capturedOption == 'Reopen') {
                waitType = "INCIDENTREOPEN";
                objData.incident_state = 'In Progress';
            } else if (session.conversationData.capturedOption == 'Close') {
                waitType = "INCIDENTCLOSE";
                objData.incident_state = 'Closed';
            }

            let options = {
                initialText: pleaseWait[waitType][lang],
                text: 'Please wait... This is taking a little longer than expected.',
                speak: '<speak>Please wait.<break time="2s"/></speak>'
            };

            progress(session, options, function (callback) {
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    message = commonTemplate.getFinalResponse(session.message.source, session, session.conversationData.IncidentNumber, `Urgency : ${commonTemplate.urgencyStatic[session.conversationData.urgency][lang]} <%>Category : ${session.conversationData.category} <%>Status : ${commonTemplate.incidentStatus[session.conversationData.incident_state][lang]} <%>Comments : ${session.conversationData.comment}`, session.conversationData.short_description, [], null, 'IncidentUpdate');
                    session.endDialog(message);
                    session.endConversation();
                    // session.conversationData.capturedOption = '';
                    // session.conversationData.IncidentNumber = '';
                    // session.conversationData.comment = '';
                    // session.conversationData.incident_state = '';
                    // session.conversationData.urgency = '';
                    // session.conversationData.category = '';
                    // session.conversationData.short_description = '';
                    // session.conversationData.sys_id = '';
                    callback(`Start Over`);
                });
            });
        }
    ];
}());