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
            let resp = results.response;
            console.log(resp.test(commonTemplate.regexPattern['INCIDENTREGEX']));
            console.log(commonTemplate.regexPattern['INCIDENTREGEX']);
            console.log(resp);
            if (!resp.test(commonTemplate.regexPattern['INCIDENTREGEX'])) {
                session.endDialog(botDialogs.INVALIDINCIDENTFORMAT[lang]);
                session.beginDialog('isSearchById', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
                    }
                }); 
                return false;               
            }
            session.conversationData.IncidentNumber = results.response;

            // Make API call to Service Now with Incident Id and get Response...
            session.send(pleaseWait["INCIDENTSTATUS"][lang]);
            apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                log.consoleDefault(JSON.stringify(data));
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                }

                if (data.hasOwnProperty('error')) {
                    let msg = botDialogs.INCIDENTNOTFOUND[lang];
                    session.endDialog(msg);

                    session.conversationData.IncidentNumber = '';
                    session.beginDialog('isSearchById', null, function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
                        }
                    });
                } else {
                    let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
                    log.consoleDefault(assignedTo);
                    log.consoleDefault(commonTemplate.incidentStatus[data.result[0].state][lang]);
                    session.conversationData.incident_state = data.result[0].incident_state;
                    session.conversationData.urgency = data.result[0].urgency;
                    session.conversationData.category = data.result[0].category;
                    session.conversationData.short_description = data.result[0].short_description;
                    session.conversationData.sys_id = data.result[0].sys_id;
                    var message = '';

                    if (assignedTo == '-') {
                        switch (session.message.source) {
                            case 'slack':
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[data.result[0].state][lang]} \nAssigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[data.result[0].state][lang]} \nAssigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                }
                                // session.send('_Below are the details for the requested incident_');
                                break;
                            case 'msteams':
                                // session.send('Below are the details for the requested incident');
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                }
                                // session.endDialog();
                                break;
                            default:
                                message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + commonTemplate.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: Unassigned';
                                // session.send(msg);
                                break;
                        }
                    } else {
                        // session.send(pleaseWait["DEFAULT"][lang]);
                        apiService.getAssignedToDetails(assignedTo, function (resp) {
                            if (!resp) {
                                let msg = botDialogs.DEFAULT[lang];
                                session.endDialog(msg);
                                return false;
                            } else {
                                log.consoleDefault(JSON.stringify(resp));
                                switch (session.message.source) {
                                    case 'slack':
                                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`*${session.conversationData.IncidentNumber}*`)
                                                .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[data.result[0].state][lang]} \nAssigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        } else {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`*${session.conversationData.IncidentNumber}*`)
                                                .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[data.result[0].state][lang]} \nAssigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                                    builder.CardAction.imBack(session, "Close", "Close"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        }
                                        // session.send('_Below are the details for the requested incident_');

                                        // session.endDialog();
                                        break;
                                    case 'msteams':
                                        // session.send('Below are the details for the requested incident');
                                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`${session.conversationData.IncidentNumber}`)
                                                .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        } else {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`${session.conversationData.IncidentNumber}`)
                                                .text(`Urgency : ${commonTemplate.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                                    builder.CardAction.imBack(session, "Close", "Close"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        }

                                        // session.endDialog();
                                        break;
                                    default:
                                        message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + commonTemplate.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                                        // session.send(msg);
                                        break;
                                }
                            }
                        });
                    }

                    session.endDialog();
                    session.beginDialog('updateIncident', message, function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
                        }
                    });
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
            apiService.getStatusByList(reqListType, function (data) {
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                } else {
                    incidentstatusArr = data.result;
                    // incidentstatusArr.slice((incidentstatusArr.length - 10), incidentstatusArr.length);
                    // incidentstatusArr.slice(Math.max(incidentstatusArr.length - 10, 1));
                    log.consoleDefault(incidentstatusArr);
                    var incidentDate = '';
                    var incidentCategory = '';
                    for (let count = 0; count < incidentstatusArr.length && count < 10; count++) {
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

            if (assignedTo == '-') {
                switch (session.message.source) {
                    case 'slack':
                        // session.send('_Below are the details for the requested incident_');
                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} \nAssigned To : Unassigned`)
                                .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                .buttons([
                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                ])
                            );
                        } else {
                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} \nAssigned To : Unassigned`)
                                .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                .buttons([
                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                    builder.CardAction.imBack(session, "Close", "Close"),
                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                ])
                            );
                        }

                        // session.endDialog();
                        break;
                    case 'msteams':
                        // session.send('Below are the details for the requested incident');
                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} <br/>Assigned To : Unassigned`)
                                .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                .buttons([
                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                ])
                            );
                        } else {
                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} <br/>Assigned To : Unassigned`)
                                .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                .buttons([
                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                    builder.CardAction.imBack(session, "Close", "Close"),
                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                ])
                            );
                        }
                        // session.endDialog();
                        break;
                    default:
                        message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + incidentstatusArr[arrIndex].short_description + ' <br/>Urgency : ' + commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang] + ' <br/>Status: ' + commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang] + ' <br/>Assigned To: Unassigned';
                        // session.send(msg);
                        break;
                }
            } else {
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getAssignedToDetails(assignedTo, function (resp) {
                    if (!resp) {
                        let msg = botDialogs.DEFAULT[lang];
                        session.endDialog(msg);
                        return false;
                    } else {
                        switch (session.message.source) {
                            case 'slack':
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} \nAssigned To : ${resp.result.name}`)
                                        .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} \nStatus : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} \nAssigned To : ${resp.result.name}`)
                                        .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                }
                                // session.send('_Below are the details for the requested incident_');

                                // session.endDialog();
                                break;
                            case 'msteams':
                                // session.send('Below are the details for the requested incident');
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                        .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang]} <br/>Status : ${commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                        .subtitle(`${incidentstatusArr[arrIndex].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ]
                                        ));
                                }
                                // session.endDialog();
                                break;
                            default:
                                message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + incidentstatusArr[arrIndex].short_description + ' <br/>Urgency : ' + commonTemplate.urgencyStatic[incidentstatusArr[arrIndex].urgency][lang] + ' <br/>Status: ' + commonTemplate.incidentStatus[incidentstatusArr[arrIndex].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                                // session.send(msg);
                                break;
                        }
                        // log.consoleDefault(JSON.stringify(resp));

                    }
                });
            }

            session.endDialog();
            session.beginDialog('updateIncident', message, function (err) {
                if (err) {
                    log.consoleDefault('log checking');
                    session.send(new builder.Message().text('Error Occurred with isSearchById: ' + err.message));
                }
            });
        }
    ];

    module.exports.updateIncident = [
        function (session, message) {
            try {
                log.consoleDefault('log check');
                log.consoleDefault(message);
                // 1 - New | 2 - In Progress | 3 - On Hold | 6 - Resolved | 7 - Closed | 8 - Cancelled
                // if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                //     builder.Prompts.choice(session, message, ['Reopen']);
                // } else {
                //     builder.Prompts.choice(session, message, ['Add a Comment', 'Close']);
                // }

                builder.Prompts.choice(session, message, ['Add a Comment', 'Close', 'Thank You']);
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
            var objData = new commonTemplate.statusUpdate();
            objData.caller_id = 'rubin.crotts@example.com';
            if (session.conversationData.capturedOption == 'Add a Comment') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = session.conversationData.incident_state;
                session.send(pleaseWait["INCIDENTADDCOMMENT"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    console.log('$$$$$$$ ', session.message.source);
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_Your comment has been added!_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `\nStatus: ` + commonTemplate.incidentStatus[session.conversationData.incident_state][lang] + ` \nComments : ` + session.conversationData.comment).subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        case 'msteams':
                            session.send('<i>Your comment has been added!</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + commonTemplate.incidentStatus[session.conversationData.incident_state][lang] + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        default:
                            let msg = 'Your comment has been added:- <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + session.conversationData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.endDialog(msg);
                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.IncidentNumber = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.sys_id = '';
                });
            } else if (session.conversationData.capturedOption == 'Reopen') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = 'In Progress';
                session.send(pleaseWait["INCIDENTREOPEN"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    console.log('$$$$$$$ ', session.message.source);
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_Your incident has been reopened_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('<i>Your incident has been reopened</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        default:
                            let msg = 'Your incident has been reopened:- <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.endDialog(msg);
                    }

                    session.conversationData.capturedOption = '';
                    session.conversationData.IncidentNumber = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.sys_id = '';
                });
            } else if (session.conversationData.capturedOption == 'Close') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = 'Closed';
                session.send(pleaseWait["INCIDENTCLOSE"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    console.log('$$$$$$$ ', session.message.source);
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_I have closed your incident..._');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        case 'msteams':
                            session.send('<i>I have closed your incident...</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        default:
                            let msg = 'I have closed your incident... <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + commonTemplate.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.send(msg);
                            session.endDialog();
                    }

                    session.conversationData.capturedOption = '';
                    session.conversationData.IncidentNumber = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.sys_id = '';
                });
            }
        }
    ];

    var getButtons = function (session) {
        // 1 - New | 2 - In Progress | 3 - On Hold | 6 - Resolved | 7 - Closed | 8 - Cancelled
        var response = null;
        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
            response = buttons([
                builder.CardAction.imBack(session, "Reopen", "Reopen")
            ]);
        } else {
            response = buttons([
                builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                builder.CardAction.imBack(session, "Close", "Close")
            ]);
        }
        return "." + response;
    };

    //************** Commented due to mismatch of conversational flow****************//
    // Fetch Incident Status Directly
    // module.exports.getincidentStatus = [
    //     function (session, args) {
    //         try {
    //             log.consoleDefault(args); // Console Args
    //             session.conversationData.IncidentNumber = args[0].resolution.value;

    //             // Make API call to Service Now with Incident Id and get Response...
    //             session.send(pleaseWait["INCIDENTSTATUS"][lang]);
    //             apiService.getIncidentStatusByNumber(session.conversationData.IncidentNumber, function (data) {
    //                 log.consoleDefault(JSON.stringify(data));
    //                 if (!data) {
    //                     let msg = botDialogs.DEFAULT[lang];
    //                     session.endDialog(msg);
    //                     return false;
    //                 }

    //                 if (data.hasOwnProperty('error')) {
    //                     let msg = botDialogs.INCIDENTNOTFOUND[lang];
    //                     session.endDialog(msg);
    //                 } else {
    //                     let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + data.result[0].assigned_to + ' <br/>What do you want to do next?';
    //                     session.endDialog(msg);
    //                 }
    //             });
    //         }
    //         catch (err) {
    //             log.consoleDefault('Incident status Error:' + err);
    //             let msg = botDialogs.DEFAULT[lang];
    //             session.endDialog(msg);
    //             return false;
    //         }
    //     }
    // ];
}());