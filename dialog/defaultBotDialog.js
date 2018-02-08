(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    const lang = 'ENGLISH';
    var regex = /^(inc)\w+\d{6}$/gim;
    var textsess = session.message.text;
    module.exports.beginDialog= [
        function (session) {
            if(textsess.match(regex) != null)
            {
                session.send('I do understand \'%s\'.', textsess.match(regex));
            }
            else
            {
                session.send('Sorry, I did not understand \'%s\'.', session.message.text);
            }
            session.message.text
        }
    ];

}());