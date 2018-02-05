(function () {
    'use strict';
    const requestAPI = require('request');
    var log = require('../utils/logs');
    var builder = require('botbuilder');
    const ServiceNowUserName = '33238';
    const ServiceNowPwd = 'abc123';

    const header = {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };

    function getIncidentStatusByNumber(ticketnumber, callback) {
        try {
            var options = {
                url: 'https://dev18442.service-now.com/api/now/v1/table/incident',
                qs: { number: ticketnumber },
                method: 'GET',
                header: header,
                body: '',
                json: true,
                auth: {
                    user: ServiceNowUserName,
                    password: ServiceNowPwd
                }
            };

            requestAPI(options, function (error, response, body) {
                if (error) {
                    log.consoleDefault(JSON.stringify(error));
                    return
                  }
                  else {
                    log.consoleDefault('headers:' + response.headers);
                    log.consoleDefault('status code:' + response.statusCode);
                    callback(body);
                  }
            });
        }
        catch(err) {
            log.consoleDefault(JSON.stringify(err));
        }        
    };

    function getIncidentStatusByList(callback) {
        try {
            var options = {
                url: 'https://dev18442.service-now.com/api/now/v1/table/incident',
                method: 'GET',
                header: header,
                body: '',
                json: true,
                auth: {
                    user: ServiceNowUserName,
                    password: ServiceNowPwd
                }
            };

            requestAPI(options, function (error, response, body) {
                if (error) {
                    log.consoleDefault(JSON.stringify(error));
                    return
                  }
                  else {
                    log.consoleDefault('headers:' + response.headers);
                    log.consoleDefault('status code:' + response.statusCode);
                    callback(body);
                  }
            });
        }
        catch(err) {
            log.consoleDefault(JSON.stringify(err));
        }        
    };

    module.exports.getIncidentStatusByNumber = getIncidentStatusByNumber;
    module.exports.getIncidentStatusByList = getIncidentStatusByList;
}());