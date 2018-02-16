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
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    var botDialogs = require('../utils/botDialogs').sendError;

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
            textsess = textsess.trim();
            console.log(textsess.match(incidentRegex));
            console.log(textsess.match(serviceRequestRegex));

            if (textsess.match(incidentRegex)) {
                log.consoleDefault('Inside Incident');
                reqType = 'INCIDENTSTATUS';
            }
            else if (textsess.match(serviceRequestRegex)) {
                log.consoleDefault('Inside Service Request');
                reqType = 'SERVICEREQUEST';
            }
            log.consoleDefault(reqType);

            if (textsess.match(incidentRegex) != null || textsess.match(serviceRequestRegex) != null) {
                session.conversationData.capturedStr = session.message.text;
                session.send(pleaseWait["DEFAULT"][lang]);
                apiService.getStatusByNumber(session.conversationData.capturedStr, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = botDialogs.DEFAULT[lang];
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = botDialogs.INCIDENTNOTFOUND[lang];
                        session.endDialog(msg);
                    } else {
                        if (reqType === 'SERVICEREQUEST') {
                            let msg = 'These are the details of the requested Service Request:- <br/>Requested Item Number : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Installation Status: ' + jsonData.incidentStatus[data.result[0].state][lang] + ' <br/>Approval: ' + data.result[0].approval.toUpperCase() + ' <br/>Stage: ' + data.result[0].stage.toUpperCase().split('_').join(' ') + ' <br/>Due Date: ' + data.result[0].due_date;
                            session.endDialog(msg);
                        }

                        if (reqType === 'INCIDENTSTATUS') {
                            session.conversationData.sys_id = data.result[0].sys_id;
                            console.log('-- sys_id --', session.conversationData.sys_id);
                            session.conversationData.incident_state = data.result[0].incident_state;
                            session.conversationData.urgency = data.result[0].urgency;
                            session.conversationData.category = data.result[0].category;
                            session.conversationData.short_description = data.result[0].short_description;
                            console.log('--status of incident-- ', session.conversationData.incident_state);
                            //let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] +' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + jsonData.incidentStatus[session.conversationData.incident_state][lang];
                            //session.send(msg);
                            let assignedTo = data.result[0].assigned_to == '' ? '-' : data.result[0].assigned_to.link;
                            log.consoleDefault(assignedTo);
                            log.consoleDefault(jsonData.incidentStatus[data.result[0].state][lang]);
                            var message;
                            if (assignedTo == '-') {
                                switch (session.message.source) {
                                    case 'slack':
                                        // session.send('_Below are the details for the requested incident_');
                                        message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                            .title(`*${session.conversationData.capturedStr}*`)
                                            .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : Unassigned`)
                                            .subtitle(`${data.result[0].short_description}`)
                                        );
                                        //session.endDialog();
                                        break;
                                    case 'msteams':
                                        // session.send('<i>Below are the details for the requested incident</i>');
                                        message = new builder.Message(session).textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel).addAttachment(new builder.ThumbnailCard(session)
                                            .title(`${session.conversationData.capturedStr}`)
                                            .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : Unassigned`)
                                            .subtitle(`${data.result[0].short_description}`)
                                        );
                                        //session.endDialog();
                                        break;
                                    default:
                                        message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + jsonData.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + jsonData.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: Unassigned';
                                        //session.send(msg);
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
                                                // session.send('_Below are the details for the requested incident_');
                                                message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                    .title(`*${session.conversationData.capturedStr}*`)
                                                    .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} \nStatus : ${jsonData.incidentStatus[data.result[0].state][lang]} \nAssigned To : ${resp.result.name}`)
                                                    .subtitle(`${data.result[0].short_description}`)
                                                );
                                                //session.send();
                                                //session.endDialog();
                                                break;
                                            case 'msteams':
                                                // session.send('<i>Below are the details for the requested incident</i>');
                                                message = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                                    .title(`${session.conversationData.capturedStr}`)
                                                    .text(`Urgency : ${jsonData.urgencyStatic[data.result[0].urgency][lang]} <br/>Status : ${jsonData.incidentStatus[data.result[0].state][lang]} <br/>Assigned To : ${resp.result.name}`)
                                                    .subtitle(`${data.result[0].short_description}`)
                                                );
                                                //session.endDialog();
                                                break;
                                            default:
                                                message = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + data.result[0].short_description + ' <br/>Urgency : ' + jsonData.urgencyStatic[data.result[0].urgency][lang] + ' <br/>Status: ' + jsonData.incidentStatus[data.result[0].state][lang] + ' <br/>Assigned To: ' + resp.result.name;
                                                //session.send(msg);
                                                break;
                                        }
                                        //session.send(msg);
                                    }
                                });
                            }
                            console.log('Message ~~~~~~~',JSON.stringify(message));
                            // 1 - New | 2 - In Progress | 3 - On Hold | 6 - Resolved | 7 - Closed | 8 - Canceled
                            if (session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                                builder.Prompts.choice(session, message, ['Reopen']);
                            } else {
                                builder.Prompts.choice(session, message, ['Add a Comment', 'Close']);
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
            // if (results.response.entity == 'Add a Comment') {
            //     builder.Prompts.text(session, 'Okay, Please enter your comment');
            // } else if (results.response.entity == 'Reopen') {
            //     builder.Prompts.text(session, 'Okay, Please enter your comment');
            // } else if (results.response.entity == 'Close') {
            //     builder.Prompts.text(session, 'Okay, Please enter your comment');
            // }
            builder.Prompts.text(session, 'Okay, Please enter your comment');
        },
        function (session, results) {
            var objData = new jsonData.statusUpdate();
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
                                .title(`*${session.conversationData.capturedStr}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `\nStatus: ` + jsonData.incidentStatus[session.conversationData.incident_state][lang] + ` \nComments : ` + session.conversationData.comment).subtitle(`${session.conversationData.short_description}`)
                            ));
                            //session.send(`You can check the status of your incident by simply typing your incident number eg: *incident status ${session.conversationData.capturedStr}*`);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();

                            break;
                        case 'msteams':
                            session.send('<i>Your comment has been added!</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.capturedStr}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + jsonData.incidentStatus[session.conversationData.incident_state][lang] + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            //session.send(`You can check the status of your incident by simply typing your incident number eg: <b>incident status ${session.conversationData.capturedStr}</b>`);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();

                            break;
                        default:
                            let msg = 'Successfully added comment for your incident:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + session.conversationData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.send(msg);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();
                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.sys_id = '';
                    //session.endDialog(msg);
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
                                .title(`*${session.conversationData.capturedStr}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            //session.send(`You can check the status of your incident by simply typing your incident number eg: *incident status ${session.conversationData.capturedStr}*`);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();

                            break;
                        case 'msteams':
                            session.send('<i>Your incident has been reopened</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.capturedStr}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            //session.send(`You can check the status of your incident by simply typing your incident number eg: <b>incident status ${session.conversationData.capturedStr}</b>`);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();

                            break;
                        default:
                            let msg = 'Your incident has been reopened:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.send(msg);
                            //session.send('Your incident will be assigned to a live agent shortly and your incident will be followed from there');
                            session.endDialog();

                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    //session.endDialog(msg);
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
                                .title(`*${session.conversationData.capturedStr}*`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + ` \nCategory : ` + session.conversationData.category + `
                                \nStatus: ` + objData.incident_state + ` \nComments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        case 'msteams':
                            session.send('<i>I have closed your incident...</i>');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${session.conversationData.capturedStr}`)
                                .text(`Urgency : ` + jsonData.urgencyStatic[session.conversationData.urgency][lang] + `<br/>Category : ` + session.conversationData.category + `<br/>Status: ` + objData.incident_state + ` <br/>Comments : ` + session.conversationData.comment)
                                .subtitle(`${session.conversationData.short_description}`)
                            ));
                            session.endDialog();

                            break;
                        default:
                            let msg = 'I have closed your incident:- <br/>Incident Id : ' + session.conversationData.capturedStr + '<br/>Urgency : ' + jsonData.urgencyStatic[session.conversationData.urgency][lang] + '<br/>Category : ' + session.conversationData.category + '<br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + objData.incident_state + ' <br/> Comments : ' + session.conversationData.comment;
                            session.send(msg);
                            session.endDialog();
                    }
                    session.conversationData.capturedOption = '';
                    session.conversationData.capturedStr = '';
                    session.conversationData.comment = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    //session.endDialog(msg);
                });
            }
        }
    ];

}());