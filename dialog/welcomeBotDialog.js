(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');
    var commonTemplate = require('../utils/commonTemplate');
    var botDialog = require('../utils/botDialogs');
    const lang = 'ENGLISH';

    // Incident Request Status List
    module.exports.beginGreeting = [
        function (session, args, next) {
            if (session.message.text.toUpperCase() == 'INCIDENT MANAGEMENT' || session.message.text.toUpperCase() == 'SERVICE MANAGEMENT') {
                session.conversationData.GreetingType = session.message.text.toUpperCase();
                next({ response: session.conversationData.GreetingType });
            } else {
                session.endDialog(botDialog.getMessage(session, "GREETING", lang));
            }
        },
        function (session, results) {
            if (results.response.entity) {
                let resp = results.response.entity;
                session.conversationData.GreetingType = resp.toUpperCase();
            }

            session.endDialog();
            session.beginDialog('chooseManagement', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with chooseManagement: ' + err.message));
                }
            });
        }
    ];

    module.exports.chooseManagement = [
        function (session, args) {
            log.consoleDefault(session.message.text);
            log.consoleDefault(session.conversationData.GreetingType);
            if (session.conversationData.GreetingType === 'INCIDENT MANAGEMENT' && session.message.source != 'skypeforbusiness') {
                session.endDialog(botDialog.getMessage(session, "INCIDENTMGMT", lang));
            }
            else if (session.conversationData.GreetingType === 'SERVICE MANAGEMENT' && session.message.source != 'skypeforbusiness') {
                session.endDialog(botDialog.getMessage(session, "SERVICEMGMT", lang));
            }
            else if (session.conversationData.GreetingType === 'INCIDENT MANAGEMENT' && session.message.source === 'skypeforbusiness') {
                botDialog.getMessage(session, "INCIDENTMGMT", lang);
            }
            else if (session.conversationData.GreetingType === 'SERVICE MANAGEMENT' && session.message.source === 'skypeforbusiness') {
                botDialog.getMessage(session, "SERVICEMGMT", lang);
            }
        },
        function (session, results) {
            switch (results.response.entity) {
                case 'Create Incident':
                    session.endDialog();
                    session.beginDialog('createIncident', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with createIncident: ' + err.message));
                        }
                    });
                    break;
                case 'Incident Status':
                    session.endDialog();
                    session.beginDialog('incidentStatus', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with incidentStatus: ' + err.message));
                        }
                    });
                    break;
                case 'Create Service Request':
                    session.endDialog();
                    session.beginDialog('createServiceRequest', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with createServiceRequest: ' + err.message));
                        }
                    });
                    break;
                case 'Service Status':
                    session.endDialog();
                    session.beginDialog('srStatus', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with srStatus: ' + err.message));
                        }
                    });
                    break;
            }
        }
    ];
}());