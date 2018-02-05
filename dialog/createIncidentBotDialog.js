(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    const lang = 'ENGLISH';

    module.exports.beginDialog= [
        function (session) {
            builder.Prompts.choice(session, 'What is the Severity?', ['High', 'Medium', 'Low']);
        },
        function(session, results) {
            session.userData.severity = results.response.entity;

            session.beginDialog('shortDescription', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with shortDescription' + err.message));
                }
            });
        }
    ];
    module.exports.shortDescription= [
        function (session) {
            builder.Prompts.text(session, 'I need your (Short) Description of the incident');
        },
        function(session, results) {
            session.userData.shortDescription = results.response;

            session.beginDialog('category', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with category' + err.message));
                }
            });
        }
    ];
    module.exports.category= [
        function (session) {
            builder.Prompts.choice(session, 'Choose any one Category of the incident from the below list', ['Inquiry/Help','Software','Hardware','Network','Database']);
        },
        function(session, results) {
            session.userData.category = results.response.entity;

            session.beginDialog('viewResult', function(err) {
                if(err) {
                    session.send(new builder.Message().text('Error Occurred with viewResult' + err.message));
                }
            });
        }
    ];
    module.exports.viewResult= [
        function (session) {
            var objData = new jsonData.jsonRequest();
            objData.caller_id = 'rubin.crotts@example.com';
            objData.category = session.userData.category;
            objData.short_description = session.userData.shortDescription;
            objData.urgency = session.userData.severity;
            apiService.createIncidentService(JSON.parse(JSON.stringify(objData)), function (data) {
                console.log('Incident No : ',data.result.number);
                console.log('Total Response : ',JSON.stringify(data));
                let msg = 'Successfully created incident:- \nIncident Id : '+data.result.number+'\nUrgency : '+jsonData.urgencyStatic[session.userData.severity][lang]+'\Category : '+jsonData.categoryStatic[session.userData.category][lang]+'\nShort Description : '+objData.short_description+' \nStatus: New \n Your Incident will be assigned to a live agent shortly and your incident will be followed from there. \n Or You can check status of your incident by typing your incident ID eg: INC1234567';
                session.endDialog(msg);
            });            
        }
    ];
}());