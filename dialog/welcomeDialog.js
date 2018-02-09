(function () {
    'use strict';

    var builder = require('botbuilder');
    var log = require('../utils/logs');

    exports.load = function (intentDialog) {
        intentDialog.matches('Greeting', greeting)
    }

    var greeting = [(session, args) => {

        log.consoleDefault('*** Greeting Intent ***'); // Console Start

        return session.beginDialog('displayGreeting', args, function (err) {
            if (err) {
                session.send(new builder.Message().text('Error Occurred with displayGreeting: ' + err.message));
            }
        });
    }];

}());