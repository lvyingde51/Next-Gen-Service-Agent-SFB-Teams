(function () {
    'use strict';
    const requestAPI = require('request');
    var log = require('../utils/logs');
    var apiList = require('../utils/commonTemplate').apiList
    const ServiceNowUserName = process.env.ServiceNowUserName;
    const ServiceNowPwd = process.env.ServiceNowPassword;    

    const header = {
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };

    function getStatusByNumber(ticketnumber, type, callback) {
        try {
            var options = {
                url: apiList[type],
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
                    try {
                        //log.consoleDefault('headers:' + response.headers);
                        //log.consoleDefault('status code:' + response.statusCode);
                        // log.consoleDefault('JSON parser:' + JSON.parse(body));
                        callback(body);
                    }
                    catch (e) {
                        log.consoleDefault('API Error:' + e);
                        callback(null);
                    }
                }
            });
        }
        catch (err) {
            log.consoleDefault(JSON.stringify(err));
        }
    };

    function getStatusByList(type, callback) {
        try {
            var options = {
                url: apiList[type],
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
                    try {
                        log.consoleDefault('headers:' + response.headers);
                        log.consoleDefault('status code:' + response.statusCode);
                        // log.consoleDefault('JSON parser:' + JSON.parse(body));
                        callback(body);
                    }
                    catch (e) {
                        log.consoleDefault('API Error:' + e);
                        callback(null);
                    }
                }
            });
        }
        catch (err) {
            log.consoleDefault(JSON.stringify(err));
        }
    };

    function getAssignedToDetails(link, callback) {
        try {
            var options = {
                url: link,
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
                    try {
                        log.consoleDefault('headers:' + response.headers);
                        log.consoleDefault('status code:' + response.statusCode);
                        // log.consoleDefault('JSON parser:' + JSON.parse(body));
                        callback(body);
                    }
                    catch (e) {
                        log.consoleDefault('API Error:' + e);
                        callback(null);
                    }
                }
            });
        }
        catch (err) {
            log.consoleDefault(JSON.stringify(err));
        }
    };

    function createIncidentService(dataService, type, callback) {
        try {
            var options = {
                url: apiList[type],
                method: 'POST',
                header: header,
                body: dataService,
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
        catch (err) {
            //let msg = 'Sorry !! It looks like we are experiencing some connection issues here. Please Try Again by creating a new incident!';
            //session.endDialog(msg);
            log.consoleDefault(JSON.stringify(err));
        }
    };
    function updateStatusCommentService(dataService, type, sys_id, callback) {
        try {
            console.log('-- URL --',apiList[type]+'/'+sys_id+'?sysparm_exclude_ref_link=true');
            var options = {
                url: apiList[type]+'/'+sys_id,
                method: 'PATCH',
                header: header,
                body: dataService,
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
                    //log.consoleDefault('headers:' + response.headers);
                    //log.consoleDefault('status code:' + response.statusCode);
                    callback(body);
                }
            });
        }
        catch (err) {
            //let msg = 'Sorry !! It looks like we are experiencing some connection issues here. Please Try Again by creating a new incident!';
            //session.endDialog(msg);
            log.consoleDefault(JSON.stringify(err));
        }
    };

    module.exports.getStatusByNumber = getStatusByNumber;
    module.exports.getStatusByList = getStatusByList;
    module.exports.createIncidentService = createIncidentService;
    module.exports.updateStatusCommentService = updateStatusCommentService;
    module.exports.getAssignedToDetails = getAssignedToDetails;
}());