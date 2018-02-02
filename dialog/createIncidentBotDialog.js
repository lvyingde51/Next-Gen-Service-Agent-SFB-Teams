(function () {
    'use strict';
    
    var builder = require('botbuilder');    
    var log = require('../utils/logs');

    module.exports.beginDialog= [
        (session)=> {   
            builder.Prompts.choice(session, 'You are inside Bot Dialogue Create Incident');
            session.endDialog();
        }
    ];
}());