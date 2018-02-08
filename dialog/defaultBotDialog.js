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
                builder.Prompts.choice(session, 'What do you want to do with the entered incident number?', ['add comment', 'Reopen', 'Close']);
            } else {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
                session.endDialog();
            }
        },
        function(session, results) {
            session.conversationData.capturedOption = results.response.entity;
            if(results.response.entity == 'add comment') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments to your incident');
            } else if(results.response.entity == 'Reopen') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments to your reopening incident');
            } else if(results.response.entity == 'Close') {
                builder.Prompts.text(session, 'Okay, Please enter the (additional) comments to your closing incident');
            }
        },
        function(session, results) {
            if(session.conversationData.capturedOption == 'add comment') {
                session.conversationData.comment = results.response;
                let msg = 'Successfully added comment for your incident:- <br/>Incident Id : '+session.conversationData.capturedStr+'<br/>Urgency : '+'Urgency'+'<br/>Category : '+'Category'+'<br/>Short Description : '+'Description'+' <br/>Status: New <br/> Comments : '+session.conversationData.comment;                
                session.conversationData.capturedOption = '';
                session.conversationData.capturedStr = '';
                session.conversationData.comment = '';
                session.endDialog(msg);
            } else if(session.conversationData.capturedOption == 'Reopen') {
                session.conversationData.comment = results.response;
                let msg = 'Successfully reopened your incident:- <br/>Incident Id : '+session.conversationData.capturedStr+'<br/>Urgency : '+'Urgency'+'<br/>Category : '+'Category'+'<br/>Short Description : '+'Description'+' <br/>Status: New <br/> Comments : '+session.conversationData.comment;                
                session.conversationData.capturedOption = '';
                session.conversationData.capturedStr = '';
                session.conversationData.comment = '';
                session.endDialog(msg);
            } else if(session.conversationData.capturedOption == 'Close') {
                session.conversationData.comment = results.response;
                let msg = 'Successfully closed your incident:- <br/>Incident Id : '+session.conversationData.capturedStr+'<br/>Urgency : '+'Urgency'+'<br/>Category : '+'Category'+'<br/>Short Description : '+'Description'+' <br/>Status: New <br/> Comments : '+session.conversationData.comment;                
                session.conversationData.capturedOption = '';
                session.conversationData.capturedStr = '';
                session.conversationData.comment = '';
                session.endDialog(msg);
            }
        }
    ];

}());