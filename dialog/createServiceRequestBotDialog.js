(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var createSR = require('../utils/commonTemplate').createSR;
    var mailer = require('../utils/commonMailer').sendMail;
    var pleaseWait = require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'CREATESERVICEREQUEST';

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
                builder.Prompts.choice(session, 'Pick a software you want to install', ['Nanoheal','Notepad++','VS Code','Spyder','Office 365']);
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
            var objSRData = new createSR();
            objSRData.short_description = session.conversationData.SoftwareName;
            session.send(pleaseWait["DEFAULT"][lang]);
            apiService.createIncidentService(JSON.parse(JSON.stringify(objSRData)), reqType, function (data) {
                objSRData.sr_ID = data.result.number;
                mailer('Create Service Request', 'ArunP3@hexaware.com', objSRData);

                let msg = 'We have created a Service Request for you. The Service Request Item Number is ' + data.result.number;
                session.conversationData.SRType = '';
                session.conversationData.SoftwareName = '';
                session.endDialog(msg);
            });
        }
    ];
}());