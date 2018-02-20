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
    function progress(session, options, asyncFn) {
        session.beginDialog("progressDialog", {
            asyncFn: asyncFn,
            options: options
        });
    }

    module.exports.beginDialog = [
        // function (session) {
        //     if(session.conversationData.severity == '' || session.conversationData.severity == undefined) {
        //         builder.Prompts.choice(session, 'What is the severity?', ['High', 'Medium', 'Low']);
        //     } else {
        //         session.endDialog();
        //         session.beginDialog('shortDescription', function(err) {
        //             if(err) {
        //                 session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
        //             }
        //         });
        //     }
        // },
        // function(session, results) {
        function (session) {
            if (session.conversationData.severity == '' || session.conversationData.severity == undefined) {
                //session.conversationData.severity = results.response.entity;
                session.conversationData.severity = 'Medium';
            }
            session.endDialog();
            session.beginDialog('shortDescription', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                }
            });
            //}
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
        // function (session) {
        //     if(session.conversationData.category == '' || session.conversationData.category == undefined) {
        //         builder.Prompts.choice(session, 'Choose any one category of the incident from the below list', ['Inquiry/Help','Software','Hardware','Network','Database']);
        //     } else {
        //         session.endDialog();
        //         console.log('Inside the Entity viewResult');
        //         session.beginDialog('viewResult', function(err) {
        //             if(err) {
        //                 session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
        //             }
        //         });
        //     }
        // },
        // function(session, results) {
        function (session) {
            if (session.conversationData.category == '' || session.conversationData.category == undefined) {
                //session.conversationData.category = results.response.entity;
                session.conversationData.category = 'Inquiry/Help';
            }
            console.log('Inside the Non Entity viewResult');
            session.endDialog();
            session.beginDialog('viewResult', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                }
            });
            //}
        }
    ];
    module.exports.viewResult = [
        function (session) {
            console.log('Inside the viewResult');
            var objData = new jsonData.jsonRequest();
            objData.caller_id = 'rubin.crotts@example.com';
            objData.category = session.conversationData.category;
            objData.short_description = session.conversationData.shortDescription;
            objData.urgency = session.conversationData.severity;
            objData.incident_state = 'In Progress';

            // session.send(pleaseWait["CREATEINCIDENT"][lang]);

            var options = {

                initialText: pleaseWait["CREATEINCIDENT"][lang],

                text: 'Please wait... This is taking a little longer than expected.',

                speak: '<speak>Please wait.<break time="2s"/></speak>'

            };

            progress(session, options, function (callback) {

                // Make our async call here. If the call completes quickly then no progress

                // message will be sent.


                apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), reqType, function (data) {
                    //console.log('Incident No : ',data.result.number);
                    var inprogressSysId = data.result.sys_id;
                    var inprogressData = new jsonData.statusUpdate();
                    inprogressData.caller_id = 'rubin.crotts@example.com';
                    inprogressData.incident_state = 'In Progress';

                    apiService.updateStatusCommentService(JSON.parse(JSON.stringify(inprogressData)), 'INCIDENTSTATUS', inprogressSysId, function (succ) {
                        console.log('inprogress data input +++++ ', JSON.stringify(inprogressData));
                        console.log('success ---- ', JSON.stringify(succ));
                        console.log(inprogressSysId);
                        console.log('changed the incident to -In Progress-');
                    });
                    console.log('Total Response : ', JSON.stringify(data));
                    var objFinalData = new jsonData.incidentCreatedData();                    
                    objFinalData.incidentid = data.result.number;
                    objFinalData.urgency = objData.urgency;
                    objFinalData.category = objData.category;
                    objFinalData.short_description = objData.short_description;
                    objFinalData.status = 'In Progress';
                    session.conversationData.IncidentNumber = data.result.number;

                    mailer('Create Incident', 'ArunP3@hexaware.com', objFinalData);


                    console.log('$$$$$$$ ', session.message.source);
                    switch (session.message.source) {
                        case 'slack':
                            // let card = {"contentType": "application/vnd.microsoft.card.adaptive",
                            // "content": {
                            //     "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            //     "type": "AdaptiveCard",
                            //     "version": "1.0",
                            //     "body": [
                            //         {
                            //             "type": "Container",
                            //             "items": [
                            //                 {
                            //                     "type": "TextBlock",
                            //                     "text": "I have created your incident",
                            //                     "weight": "bolder",
                            //                     "size": "medium"
                            //                 }
                            //             ]
                            //         },
                            //         {
                            //             "type": "Container",
                            //             "items": [
                            //                 {
                            //                     "type": "TextBlock",
                            //                     "text": "The details updated with the incident are listed below,  ",
                            //                     "wrap": true
                            //                 },
                            //                 {
                            //                     "type": "FactSet",
                            //                     "facts": [
                            //                         {
                            //                             "title": "Incident ID:",
                            //                             "value": "**"+objFinalData.incidentid+"**",
                            //                             "color": "attention"
                            //                         },
                            //                         {
                            //                             "title": "Category:",
                            //                             "value": ""+objFinalData.category+""
                            //                         },
                            //                         {
                            //                             "title": "Short Description:",
                            //                             "value": ""+objFinalData.shortDescription+""
                            //                         }
                            //                     ]
                            //                 },
                            //                 {
                            //                     "type": "TextBlock",
                            //                     "text": "Your incident will be assigned to a live agent shortly. (or) You can check the status of your incident by simply typing your incident number eg: **incident status "+objFinalData.incidentid+"**",
                            //                     "wrap": true
                            //                 }
                            //             ]
                            //         }
                            //     ]
                            // }
                            // };
                            // console.log(JSON.stringify(card));
                            // var cardMsg = new builder.Message(session)
                            //     .addAttachment(card);
                            // session.conversationData.category = '';
                            // session.conversationData.shortDescription = '';
                            // session.conversationData.severity = '';
                            // session.send(cardMsg);
                            // session.endDialog();
                            // break;
                            session.conversationData.category = '';
                            session.conversationData.shortDescription = '';
                            session.conversationData.severity = '';
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
                            session.conversationData.category = '';
                            session.conversationData.shortDescription = '';
                            session.conversationData.severity = '';
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
                            let msg = `I have created your incident:- <br/>- Incident Id : ${data.result.number}<br/>- Category : ${objData.category}<br/>- Short Description : ${objData.short_description} <br/>- Your incident will be assigned to a live agent shortly (or) You can check the status of your incident by simply typing your incident number eg: 'incident status ${data.result.number}'`;
                            session.conversationData.category = '';
                            session.conversationData.shortDescription = '';
                            session.conversationData.severity = '';
                            session.send(msg);
                            session.endDialog();

                            break;

                    }
                   // callback('Start Over');
                });


            });

        }/*,
        function (session,results) 
        {
            if(results.response.entity==='Start Over')
            {
             session.endDialog();
             session.beginDialog('displayGreeting', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with createIncident' + err.message));
                }
            });
            }
            else
            {
            session.endConversation("Ok... See you later.");
            }

        }*/
    ];
}());