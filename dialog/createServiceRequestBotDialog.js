(function () {
    'use strict';

    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var createSR = require('../utils/commonTemplate').createSR;
    var progress = require('../utils/commonTemplate').progress;
    var mailer = require('../utils/commonMailer').sendMail;
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'CREATESERVICEREQUEST';

    module.exports.beginDialog = [
        function (session) {
            if (session.conversationData.SoftwareName == '' || session.conversationData.SoftwareName == undefined) {
                builder.Prompts.choice(session, 'Select Request Categories', ['Install Software']);
            } else {
                builder.Prompts.choice(session, 'You requested for an installation sometime back. `' + session.conversationData.SoftwareName + '` Can we take this as your service request?', ['Yes', 'No']);
            }
        },
        function (session, results) {
            if (results.response.entity == 'Yes') {
                session.endDialog();
                session.beginDialog('showSoftwareList', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with showSoftwareList ' + err.message));
                    }
                });
            }
            else if (results.response.entity == 'No') {
                session.endDialog();
                session.conversationData.SoftwareName = '';
                session.beginDialog('createServiceRequest', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with createServiceRequest ' + err.message));
                    }
                });
            } else if (session.conversationData.SRType == '' || session.conversationData.SRType == undefined) {
                session.conversationData.SRType = results.response.entity;
                session.endDialog();
                session.beginDialog('showSoftwareList', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with showSoftwareList ' + err.message));
                    }
                });
            }
        }
    ];

    module.exports.softwareList = [
        function (session) {
            if (session.conversationData.SoftwareName == '' || session.conversationData.SoftwareName == undefined) {
                builder.Prompts.choice(session, 'Pick a software you want installed', ['Nanoheal', 'Notepad++', 'VS Code', 'Spyder', 'Office 365']);
            } else {
                session.endDialog();
                session.beginDialog('createSR', function (err) {
                    if (err) {
                        session.send(new builder.Message().text('Error Occurred with createSR ' + err.message));
                    }
                });
            }
        },
        function (session, results) {
            session.conversationData.SoftwareName = results.response.entity;
            session.endDialog();
            session.beginDialog('createSR', function (err) {
                if (err) {
                    session.send(new builder.Message().text('Error Occurred with createSR ' + err.message));
                }
            });
        }
    ];

    module.exports.createSR = [
        function (session) {
            var objSRData = new createSR();
            objSRData.short_description = session.conversationData.SoftwareName;
           // session.send(pleaseWait["CREATESR"][lang]);
            var options = {
                
                                initialText: pleaseWait["CREATESR"][lang],
                
                                text: 'Please wait... This is taking a little longer than expected.',
                
                                speak: '<speak>Please wait.<break time="2s"/></speak>'
                
                            };
                
            progress(session, options, function (callback) {
            apiService.createIncidentService(JSON.parse(JSON.stringify(objSRData)), reqType, function (data) {
                objSRData.sr_ID = data.result.number;
                mailer('Create Service Request', 'ArunP3@hexaware.com', objSRData);

                let msg = 'Service Request ' + data.result.number + ' has been created!';
                session.conversationData.SRType = '';
                session.conversationData.SoftwareName = '';
                session.endDialog(msg);
                callback('Start Over');
            });
        });
        }
    ];
}());