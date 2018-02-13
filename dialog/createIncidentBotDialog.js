(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    var mailer = require('../utils/commonMailer').sendMail;
    const lang = 'ENGLISH';
    const reqType = 'CREATEINCIDENT';

    module.exports.beginDialog= [
        function (session) {
            if(session.conversationData.severity == '' || session.conversationData.severity == undefined) {
                builder.Prompts.choice(session, 'What is the severity?', ['High', 'Medium', 'Low']);
            } else {
                session.endDialog();
                session.beginDialog('shortDescription', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                    }
                });
            }
        },
        function(session, results) {
            if(session.conversationData.severity == '' || session.conversationData.severity == undefined) {
                session.conversationData.severity = results.response.entity;
                session.endDialog();
                session.beginDialog('shortDescription', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                    }
                });
            }
        }
    ];
    module.exports.shortDescription= [
        function (session) {
            if(session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
                builder.Prompts.text(session, 'Please give me a short description of the incident you’d like to report');
            } else {
                builder.Prompts.choice(session, 'We noticed you have given a short Description at the start of the conversation ie., `'+session.conversationData.shortDescription+'` Can we take it as the description of the incident?', ['yes', 'no']);
                
            }
        },
        function(session, results) {
            if(results.response.entity == 'yes') {
                session.endDialog();
                session.beginDialog('category', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            } else if(results.response.entity == 'no') {
                session.endDialog();
                session.conversationData.shortDescription = '';
                session.beginDialog('shortDescription', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            } else if(session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
                session.conversationData.shortDescription = results.response;
                session.endDialog();
                session.beginDialog('category', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            }
        }
    ];
    module.exports.category= [
        function (session) {
            if(session.conversationData.category == '' || session.conversationData.category == undefined) {
                builder.Prompts.choice(session, 'Choose any one category of the incident from the below list', ['Inquiry/Help','Software','Hardware','Network','Database']);
            } else {
                session.endDialog();
                console.log('Inside the Entity viewResult');
                session.beginDialog('viewResult', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                    }
                });
            }
        },
        function(session, results) {
            if(session.conversationData.category == '' || session.conversationData.category == undefined) {
                session.conversationData.category = results.response.entity;
                console.log('Inside the Non Entity viewResult');
                session.endDialog();
                session.beginDialog('viewResult', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                    }
                });
            }
        }
    ];
    module.exports.viewResult= [
        function (session) {
            console.log('Inside the viewResult');
            var objData = new jsonData.jsonRequest();
            objData.caller_id = 'rubin.crotts@example.com';
            objData.category = session.conversationData.category;
            objData.short_description = session.conversationData.shortDescription;
            objData.urgency = session.conversationData.severity;
            apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), reqType, function (data) {
                console.log('Incident No : ',data.result.number);
                console.log('Total Response : ',JSON.stringify(data));
                var objFinalData = new jsonData.incidentCreatedData();
                objFinalData.incidentid = data.result.number;
                objFinalData.urgency = objData.urgency;
                objFinalData.category = objData.category;
                objFinalData.short_description = objData.short_description;
                objFinalData.status = 'New';

                mailer('Create Incident', 'ArunP3@hexaware.com', objFinalData);
                switch (session.message.source) {
                    case 'skypeforbusiness':
                        let msg = `Successfully created incident:- <br/>- Incident Id : ${data.result.number}<br/>- Urgency : ${objData.urgency}<br/>- Category : ${objData.category}<br/>- Short Description : ${objData.short_description} <br/>- Status: New <br/>- Your incident will be assigned to a live agent shortly and your incident will be followed from there (or) you can check status of your incident by typing your incident number eg: 'incident status ${data.result.number}'`;                
                        session.conversationData.category = '';
                        session.conversationData.shortDescription = '';
                        session.conversationData.severity = '';
                        session.send(msg);
                        session.endDialog();
                        break;
                    default:
                        let card = {
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "type": "AdaptiveCard",
                            "version": "1.0",
                            "body": [
                                {
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": "Successfully Created Incident",
                                            "weight": "bolder",
                                            "size": "medium"
                                        }
                                    ]
                                },
                                {
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": "The details updated with the incident are listed below,  ",
                                            "wrap": true
                                        },
                                        {
                                            "type": "FactSet",
                                            "facts": [
                                                {
                                                    "title": "Incident ID:",
                                                    "value": "**"+objFinalData.incidentid+"**",
                                                    "color": "attention"
                                                },
                                                {
                                                    "title": "Category:",
                                                    "value": ""+objFinalData.category+""
                                                },
                                                {
                                                    "title": "Short Description:",
                                                    "value": ""+objFinalData.shortDescription+""
                                                }
                                            ]
                                        },
                                        {
                                            "type": "TextBlock",
                                            "text": "Your incident will be assigned to a live agent shortly and your incident will be followed from there (or) you can check status of your incident by typing your incident number eg: **incident status "+objFinalData.incidentid+"**",
                                            "wrap": true
                                        }
                                    ]
                                }
                            ]
                        };
                        var msg = new builder.Message(session)
                            .addAttachment(card);
                        session.conversationData.category = '';
                        session.conversationData.shortDescription = '';
                        session.conversationData.severity = '';
                        session.send(msg);
                        session.endDialog();
                        break;
                }
            });
        },
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

        }
    ];
}());