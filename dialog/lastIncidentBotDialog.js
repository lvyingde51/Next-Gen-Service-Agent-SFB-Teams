(function () {
    'use strict';
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'INCIDENTLIST';
    var botDialogs = require('../utils/botDialogs').sendError;
    
    /* ### Progress Dialog init ### */
    function progress(session, options, asyncFn) {
        session.beginDialog("progressDialog", {
            asyncFn: asyncFn,
            options: options
        });
    }

    module.exports.beginDialog = [
        function (session) {
            // builder.Prompts.time(session, 'Please enter your date of birth (MM/dd/yyyy):', {
            // retryPrompt: 'The value you entered is not a valid date. Please try again:',
            // maxRetries: 2
            // });
            session.send(pleaseWait["LASTINCIDENT"][lang]);
            apiService.getStatusByList('FINALINCIDENT', function (data) {
                if (!data) {
                    let msg = botDialogs.DEFAULT[lang];
                    session.endDialog(msg);
                    return false;
                }
                if (data.hasOwnProperty('error')) {
                    let msg = botDialogs.INCIDENTNOTFOUND[lang];
                    session.endDialog(msg);
                } else {
                    let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
                    var message;

                    session.conversationData.IncidentNumber = data.result[0].number;
                    session.conversationData.sys_id = data.result[0].sys_id;
                    session.conversationData.incident_state = data.result[0].incident_state;
                    session.conversationData.urgency = data.result[0].urgency;
                    session.conversationData.category = data.result[0].category;
                    session.conversationData.short_description = data.result[0].short_description;                    
                    if (assignedTo == '-') {
                        /* ### Finding the Channel - Previous/Last/Final Incident ### */
                        switch (session.message.source) {
                            case 'slack':
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`*${session.conversationData.IncidentNumber}*`)
                                        .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                }
                                break;
                            case 'msteams':
                                if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                } else {
                                    message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                        .title(`${session.conversationData.IncidentNumber}`)
                                        .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : Unassigned`)
                                        .subtitle(`${data.result[0].short_description}`)
                                        .buttons([
                                            builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                            builder.CardAction.imBack(session, "Close", "Close"),
                                            builder.CardAction.imBack(session, "Thank You", "Thank You")
                                        ])
                                    );
                                }
                                break;
                            default:
                                message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + jsonData.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + jsonData.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: Unassigned';
                                break;
                        }
                    } else {
                        /* ### Api to get `Assigned to` value for the incident ### */
                        apiService.getAssignedToDetails(assignedTo, function (resp) {
                            if (!resp) {
                                let msg = botDialogs.DEFAULT[lang];
                                session.endDialog(msg);
                                return false;
                            } else {
                                /* ### Finding the Channel - Previous/Last/Final Incident ### */
                                switch (session.message.source) {
                                    case 'slack':
                                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`*${session.conversationData.IncidentNumber}*`)
                                                .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        } else {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`*${session.conversationData.IncidentNumber}*`)
                                                .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                                    builder.CardAction.imBack(session, "Close", "Close"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        }
                                        break;
                                    case 'msteams':
                                        if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`${session.conversationData.IncidentNumber}`)
                                                .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Reopen", "Reopen"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        } else {
                                            message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                .title(`${session.conversationData.IncidentNumber}`)
                                                .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                                .subtitle(`${data.result[0].short_description}`)
                                                .buttons([
                                                    builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"),
                                                    builder.CardAction.imBack(session, "Close", "Close"),
                                                    builder.CardAction.imBack(session, "Thank You", "Thank You")
                                                ])
                                            );
                                        }
                                        break;
                                    default:
                                        message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.IncidentNumber + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + jsonData.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + jsonData.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                                        break;
                                }
                            }
                        });
                    }
                    if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                        builder.Prompts.choice(session, message, ['Reopen', 'Thank You']);
                    } else {
                        builder.Prompts.choice(session, message, ['Add a Comment', 'Close', 'Thank You']);
                    }
                }
            });
        },
        function (session, results) {
            session.conversationData.test = results.response;
            console.log(session.conversationData.test);
            session.endDialog('Happy to help!');
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
            var objData = new jsonData.statusUpdate();
            if (session.conversationData.capturedOption == 'Add a Comment') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = session.conversationData.incident_state;
                session.send(pleaseWait["INCIDENTADDCOMMENT"][lang]);
                /* ### Api to Update/Add Additional Comment for the incident ### */
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_Your comment has been added!_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `\nStatus: ` + jsonData.incidentStatus[session.conversationData.incident_state][lang] + ` \nComments : ` + session.conversationData.comment).subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('<i>Your comment has been added!</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + jsonData.incidentStatus[session.conversationData.incident_state][lang] + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        default:
                            session.endDialog('Successfully added comment for your incident:- <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + session.conversationData.incident_state + ' <br/> Comments : ' + session.conversationData.comment);
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
                /* ### Api to Reopen the incident ### */
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_Your incident has been reopened_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('<i>Your incident has been reopened</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        default:
                             session.endDialog('Your incident has been reopened:- <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment);
                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.IncidentNumber = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                });
            } else if (session.conversationData.capturedOption == 'Close') {
                session.conversationData.comment = results.response;
                objData.comments = session.conversationData.comment;
                objData.incident_state = 'Closed';
                session.send(pleaseWait["INCIDENTCLOSE"][lang]);
                /* ### Api to Close the incident ### */
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType, session.conversationData.sys_id, function (data) {
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_I have closed your incident..._');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${session.conversationData.IncidentNumber}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('<i>I have closed your incident...</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.IncidentNumber}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();
                            break;
                        default:
                            session.endDialog('I have closed your incident:- <br/>Incident Id : ' + session.conversationData.IncidentNumber + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment);
                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.IncidentNumber = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                });
            }
        }
    ];
}());