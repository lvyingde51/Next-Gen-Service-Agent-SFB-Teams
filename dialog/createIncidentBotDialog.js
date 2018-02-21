(function () {
    'use strict';
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    var  pleaseWait  =  require('../utils/botDialogs').pleaseWait;
    var mailer = require('../utils/commonMailer').sendMail;
    const lang = 'ENGLISH';
    const reqType = 'CREATEINCIDENT';
  
    module.exports.beginDialog = [
        function (session) {
            if (session.conversationData.severity == '' || session.conversationData.severity == undefined) {
                session.conversationData.severity = 'Medium';
            }
            session.endDialog();
            session.beginDialog('shortDescription', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                }
            });
        }
    ];

    module.exports.shortDescription = [
        function (session) {
            if (session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
                builder.Prompts.text(session, 'Please give me a short description of the incident you’d like to report');
            } else {
                builder.Prompts.choice(session, 'We have a short description that you entered earlier ie., `' + session.conversationData.shortDescription + '` Can we take this as the description of the incident?', ['yes', 'no']);
            }
        },
        function (session, results) {
            if (results.response.entity == 'yes') {
                session.endDialog();
                session.beginDialog('category', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            } else if (results.response.entity == 'no') {
                session.endDialog();
                session.conversationData.shortDescription = '';
                session.beginDialog('shortDescription', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            } else if (session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
                session.conversationData.shortDescription = results.response;
                session.endDialog();
                session.beginDialog('category', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            }
        }
    ];

    module.exports.category = [
        function (session) {
            if (session.conversationData.category == '' || session.conversationData.category == undefined) {
                session.conversationData.category = 'Inquiry/Help';
            }
            session.endDialog();
            session.beginDialog('viewResult', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                }
            });
        }
    ];
    module.exports.viewResult = [
        function (session) {
            var objData = new jsonData.jsonRequest();
            objData.category = session.conversationData.category;
            objData.short_description = session.conversationData.shortDescription;
            objData.urgency = session.conversationData.severity;
            objData.incident_state = 'In Progress';
            var options = {
                initialText: pleaseWait["CREATEINCIDENT"][lang],
                text: 'Please wait... This is taking a little longer than expected.',
                speak: '<speak>Please wait.<break time="2s"/></speak>'
            };

            jsonData.progress(session, options, function (callback) {
                /* ### Api to Create a New Incident ### */
                apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), reqType, function (data) {                    
                    var inprogressData = new jsonData.statusUpdate();
                    var objFinalData = new jsonData.incidentCreatedData();
                    var inprogressSysId = data.result.sys_id;
                    inprogressData.incident_state = 'In Progress';
                    objFinalData.status = 'In Progress';
                    objFinalData.incidentid = data.result.number;
                    objFinalData.urgency = objData.urgency;
                    objFinalData.category = objData.category;
                    objFinalData.short_description = objData.short_description;
                    session.conversationData.IncidentNumber = data.result.number;
                    session.conversationData.category = '';
                    session.conversationData.shortDescription = '';
                    session.conversationData.severity = '';
                    /* ### Api to Change New Incident to Inprogress State ### */
                    apiService.updateStatusCommentService(JSON.parse(JSON.stringify(inprogressData)), 'INCIDENTSTATUS', inprogressSysId, function (succ) {
                        console.log('changed the incident to - In Progress-',inprogressSysId);
                    });                                 
                    /* ### Sending mail to Login User about the new creation of incident and its details ### */
                    mailer('Create Incident', 'ArunP3@hexaware.com', objFinalData);
                    /* ### Finding the Channel - Creating Incident ### */
                    switch (session.message.source) {
                        case 'slack':
                            session.send('_I have created your incident!_');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`*${data.result.number}*`)
                                .text(`Category : ${objData.category}`)
                                .subtitle(`${objData.short_description}`)
                            ));
                            session.send(`You can check the status of your incident by simply typing your incident number eg: *incident status ${data.result.number}*`);
                            session.send('Your incident will be assigned to a live agent shortly.');
                            session.endDialog();
                            break;
                        case 'msteams':
                            session.send('I have created your incident!');
                            session.send(new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                                .title(`${data.result.number}`)
                                .text(`Category : ${objData.category}`)
                                .subtitle(`${objData.short_description}`)
                            ));
                            session.send(`You can check the status of your incident by simply typing your incident number eg: <b>incident status ${data.result.number}</b>`);
                            session.send('Your incident will be assigned to a live agent shortly.');
                            session.endDialog();
                            break;
                        default:
                            session.endDialog(`I have created your incident:- <br/>- Incident Id : ${data.result.number}<br/>- Category : ${objData.category}<br/>- Short Description : ${objData.short_description} <br/>- Your incident will be assigned to a live agent shortly (or) You can check the status of your incident by simply typing your incident number eg: 'incident status ${data.result.number}'`);
                            break;
                    }
                    callback('Start Over');
                });
            });
        }
    ];
}());