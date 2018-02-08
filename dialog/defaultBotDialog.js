(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    const lang = 'ENGLISH';
    var regex = /^(inc)\w+\d{6}$/gim;

    module.exports.beginDialog= [
        function (session) {
            var textsess = session.message.text;
            if(textsess.match(regex) != null) {
                session.conversationData.capturedStr = textsess.match(regex);
                builder.Prompts.choice(session, 'What do you want to do with the entered incident number?', ['add comment to the incident', 'Reopen the incident', 'Close the incident']);
            } else {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
                session.endDialog();
            }
        },
        function(session, results) {
            session.conversationData.capturedOption = results.response.entity;
            if(results.response.entity == 'add comment to the incident') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments to your incident');
            } else if(results.response.entity == 'Reopen the incident') {

            } else if(results.response.entity == 'Close the incident') {
                
            }
        },
        function(session, results) {
            if(session.conversationData.capturedOption == 'add comment to the incident')
            {
                session.conversationData.comment = results.response;
                let msg = 'Successfully added comment for your incident:- <br/>Incident Id : '+data.result.number+'<br/>Urgency : '+objData.urgency+'<br/>Category : '+objData.category+'<br/>Short Description : '+objData.short_description+' <br/>Status: New <br/> Comments : '+session.conversationData.comment;                
                session.conversationData.capturedOption = '';
                session.conversationData.capturedStr = '';
                session.conversationData.comment = '';
                session.endDialog(msg);
            }
        }
    ];

}());