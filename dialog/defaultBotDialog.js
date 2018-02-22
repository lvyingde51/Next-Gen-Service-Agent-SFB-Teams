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
    var progress = require('../utils/commonTemplate').progress;

    module.exports.beginDialog = [
        function (session) {
            session.conversationData.capturedStr = '';

            var textsess = session.message.text;
            textsess = textsess.trim();

            if (textsess.match(incidentRegex)) {
                reqType = 'INCIDENTSTATUS';
            }
            else if (textsess.match(serviceRequestRegex)) {
                reqType = 'SERVICEREQUEST';
            }

            log.consoleDefault(reqType);

            if (textsess.match(incidentRegex) != null || textsess.match(serviceRequestRegex) != null) {
                session.conversationData.capturedStr = session.message.text;

                if (reqType === 'INCIDENTSTATUS') {
                    session.conversationData.IncidentNumber = session.conversationData.capturedStr;
                    session.endDialog();
                    session.beginDialog('isSearchById', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
                        }
                    });
                } else if (reqType === 'SERVICEREQUEST') {
                    session.conversationData.SRNumber = session.conversationData.capturedStr;
                    session.endDialog();
                    session.beginDialog('srSearchById', function (err) {
                        if (err) {
                            session.send(new builder.Message().text('Error Occurred with isSearchById ' + err.message));
                        }
                    });
                }
            } else {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
                session.endDialog();
            }
        }
    ];

}());