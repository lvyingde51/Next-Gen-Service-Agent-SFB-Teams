(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

    module.exports.beginDialog= [
        function (session) {
            if(session.conversationData.severity == '' || session.conversationData.severity == undefined) {
                builder.Prompts.choice(session, 'What is the severity?', ['High', 'Medium', 'Low']);
            } else {
                session.endDialog();
                builder.Prompts.choice(session, 'I find that your initial statement contained `'+session.conversationData.severity+'` can i take that as a severity for the incident ', ['Yes', 'No']);
                
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
            else
            {
                if(results.response.entity == 'Yes') {
                    session.beginDialog('shortDescription', function(err) {
                        if(err) {
                            session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                        }
                    });
                } else {
                    session.conversationData.severity = '';
                    session.beginDialog('beginDialog', function(err) {
                        if(err) {
                            session.send(new builder.Message().text('Error Occurred with beginDialog' + err.message));
                        }
                    });
                }
            }
        }
    ];
    module.exports.shortDescription= [
        function (session) {
            if(session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
                builder.Prompts.text(session, 'I need your (short) description of the incident');
            } else {
                session.endDialog();
                session.beginDialog('category', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with category' + err.message));
                    }
                });
            }
        },
        function(session, results) {
            if(session.conversationData.shortDescription == '' || session.conversationData.shortDescription == undefined) {
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
            apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), function (data) {
                console.log('Incident No : ',data.result.number);
                console.log('Total Response : ',JSON.stringify(data));
                let msg = 'Successfully created incident:- <br/>Incident Id : '+data.result.number+'<br/>Urgency : '+objData.urgency+'<br/>Category : '+objData.category+'<br/>Short Description : '+objData.short_description+' <br/>Status: New <br/> Your incident will be assigned to a live agent shortly and your incident will be followed from there (or) you can check status of your incident by typing your incident number eg: `incident status INC1234567`';                
                session.conversationData.category = '';
                session.conversationData.shortDescription = '';
                session.conversationData.severity = '';
                session.endDialog(msg);
            });
        }
    ];
}());