(function () {
    'use strict';

    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    var  pleaseWait  =  require('../utils/botDialogs').pleaseWait;
    const lang = 'ENGLISH';
    const reqType = 'LASTINCIDENT';
    function progress(session, options, asyncFn) {
        session.beginDialog("progressDialog", {
            asyncFn: asyncFn,
            options: options
        });
    }

    module.exports.beginDialog = [
        
        function (session) {
            if (session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                
            } else {
                
            }
        }
    ];
    
}());