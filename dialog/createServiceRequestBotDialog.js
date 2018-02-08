(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var serviceRequest = require('../utils/commonTemplate');
    var mailer = require('../utils/commonMailer').sendMail;
    const lang = 'ENGLISH';

    module.exports.beginDialog = [
        function (session) {
            builder.Prompts.choice(session, 'Select Request Categories', ['Install Software']);
        },
        function(session, results) {
            if(session.conversationData.SRType == '' || session.conversationData.SRType == undefined) {
                session.conversationData.SRType = results.response.entity;
                session.endDialog();
                session.beginDialog('showSoftwareList', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with beginDialog ' + err.message));
                    }
                });
            }
        }
    ];

    module.exports.softwareList = [
        function (session) {
            if(session.conversationData.SoftwareName == '' || session.conversationData.SoftwareName == undefined) {
                builder.Prompts.choice(session, 'Pick a software you want to install', ['Nanoheal','Notepad++','VS Code','Spyder','GTA V']);
            } else {
                session.endDialog();
                session.beginDialog('createSR', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with createSR ' + err.message));
                    }
                });
            }
        },
        function(session, results) {
                session.conversationData.SoftwareName = results.response.entity;
                session.endDialog();
                session.beginDialog('createSR', function(err) {
                    if(err) {
                        session.send(new builder.Message().text('Error Occurred with createSR ' + err.message));
                    }
                });
        }
    ];

    module.exports.createSR = [
        function (session) {
            var objData = new serviceRequest.jsonRequest();
            objData.caller_id = 'rubin.crotts@example.com';
            objData.category = session.conversationData.category;
            objData.short_description = session.conversationData.shortDescription;
            objData.urgency = session.conversationData.severity;
            apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), function (data) {
                
                var objFinalData = new serviceRequest.incidentCreatedData();
                objFinalData.incidentid = data.result.number;
                objFinalData.urgency = objData.urgency;
                objFinalData.category = objData.category;
                objFinalData.short_description = objData.short_description;
                objFinalData.status = 'New';

                mailer('Create Service Request', 'ArunP3@hexaware.com', objFinalData);

                let msg = 'Successfully created incident:- <br/>Incident Id : '+data.result.number+'<br/>Urgency : '+objData.urgency+'<br/>Category : '+objData.category+'<br/>Short Description : '+objData.short_description+' <br/>Status: New <br/> Your incident will be assigned to a live agent shortly and your incident will be followed from there (or) you can check status of your incident by typing your incident number eg: `incident status INC1234567`';                
                session.conversationData.category = '';
                session.conversationData.shortDescription = '';
                session.conversationData.severity = '';
                session.endDialog(msg);
            });
        }
    ];
}());