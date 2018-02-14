(function () {
    'use strict';
    
    var builder = require('botbuilder');
    var apiService = require('../server/apiServices');
    var log = require('../utils/logs');
    var jsonData = require('../utils/commonTemplate');
    var mailer = require('../utils/commonMailer').sendMail;
    const lang = 'ENGLISH';
    const reqType = 'INCIDENTSTATUS';
    var pleaseWait = require('../utils/botDialogs').pleaseWait;

    module.exports.reopenIncident= [
        function (session) {
            session.conversationData.incident_state = '';
            session.conversationData.urgency = '';
            session.conversationData.category = '';
            session.conversationData.short_description = '';
            session.conversationData.sys_id = '';
            session.conversationData.commentReopenIncident = '';
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                builder.Prompts.text(session, 'Please provide your Incident Id');
            } else {
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                        return;
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        if(session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                            builder.Prompts.text(session, 'Please give me a comment of the incident you’d like to reopen');
                        } else {
                            let msg = 'Incident Number you entered cannot be reopened, As it is already in a open status. Please try again';
                            session.endDialog(msg);
                            return;
                        }
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                });               
            }
        },
        function(session, results) {
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                session.conversationData.IncidentNumber = results.response;
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        if(session.conversationData.incident_state == 7 || session.conversationData.incident_state == 8) {
                            builder.Prompts.text(session, 'Please give me a comment of the incident you’d like to reopen');
                        } else {
                            let msg = 'Incident Number you entered cannot be reopened, As it is already in a open status. Please try again';
                            session.endDialog(msg);
                            return;
                        }
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                });  
            } else {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                objData.incident_state = 'In Progress';
                session.send(pleaseWait["INCIDENTREOPEN"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully reopened your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+objData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                    return;
                });
            }
        },
        function(session, results) {
             if(session.conversationData.IncidentNumber != '' || session.conversationData.IncidentNumber != undefined) {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                objData.incident_state = 'In Progress';
                session.send(pleaseWait["INCIDENTREOPEN"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully reopened your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+objData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                });
             }
        }
    ];
    module.exports.closeIncident= [
        function (session) {
            session.conversationData.incident_state = '';
            session.conversationData.urgency = '';
            session.conversationData.category = '';
            session.conversationData.short_description = '';
            session.conversationData.sys_id = '';
            session.conversationData.commentReopenIncident = '';
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                builder.Prompts.text(session, 'Please provide your Incident Id');
            } else {
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        builder.Prompts.text(session, 'Please give me a comment of the incident you’d like to close');
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                });               
            }
        },
        function(session, results) {
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                session.conversationData.IncidentNumber = results.response;
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        builder.Prompts.text(session, 'Please give me a comment of the incident you’d like to close');
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                });   
            } else {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                objData.incident_state = 'Closed';
                session.send(pleaseWait["INCIDENTCLOSE"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully closed your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+objData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                    return;
                });
            }
        },
        function(session, results) {
             if(session.conversationData.IncidentNumber != '' || session.conversationData.IncidentNumber != undefined) {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                objData.incident_state = 'Closed';
                session.send(pleaseWait["INCIDENTCLOSE"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully closed your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+objData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                });
             }
        }
    ];

    module.exports.commentIncident= [
        function (session) {
            session.conversationData.incident_state = '';
            session.conversationData.urgency = '';
            session.conversationData.category = '';
            session.conversationData.short_description = '';
            session.conversationData.sys_id = '';
            session.conversationData.commentReopenIncident = '';
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                builder.Prompts.text(session, 'Please provide your Incident Id');
            } else {
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        builder.Prompts.text(session, 'Please give me an additional comment of the incident');
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                });               
            }
        },
        function(session, results) {
            if(session.conversationData.IncidentNumber == '' || session.conversationData.IncidentNumber == undefined) {
                session.conversationData.IncidentNumber = results.response;
                session.send(pleaseWait["INCIDENTSTATUS"][lang]);
                apiService.getStatusByNumber(session.conversationData.IncidentNumber, reqType, function (data) {
                    log.consoleDefault(JSON.stringify(data));
                    if (!data) {
                        let msg = 'An error has occurred while fetching the details... Please try again later...';
                        session.endDialog(msg);
                        return false;
                    }

                    if (data.hasOwnProperty('error')) {
                        let msg = 'Incident Number does not exist in our database. ' + data.error.message + ' Please try again';
                        session.endDialog(msg);
                    } else {
                        session.conversationData.sys_id = data.result[0].sys_id;
                        console.log('-- sys_id --',session.conversationData.sys_id);
                        session.conversationData.incident_state = data.result[0].incident_state;
                        session.conversationData.urgency = data.result[0].urgency;
                        session.conversationData.category = data.result[0].category;
                        session.conversationData.short_description = data.result[0].short_description;
                        console.log('--status of incident-- ',session.conversationData.incident_state);
                        builder.Prompts.text(session, 'Please give me an additional comment of the incident');
                        // let msg = 'Below are the details for the requested incident :- <br/>Incident Id : ' + session.conversationData.capturedStr + ' <br/>Short Description : ' + session.conversationData.short_description + ' <br/>Status: ' + commonTemplate.incidentStatus[session.conversationData.incident_state][lang];
                        // session.send(msg);
                    }
                }); 
            } else {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                session.send(pleaseWait["INCIDENTADDCOMMENT"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully added additional comment for your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+session.conversationData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                    return;
                });
            }
        },
        function(session, results) {
             if(session.conversationData.IncidentNumber != '' || session.conversationData.IncidentNumber != undefined) {
                session.conversationData.commentReopenIncident = results.response;
                var objData = new jsonData.statusUpdate();
                objData.caller_id = 'rubin.crotts@example.com';
                objData.comments = session.conversationData.commentReopenIncident;
                session.send(pleaseWait["INCIDENTADDCOMMENT"][lang]);
                apiService.updateStatusCommentService(JSON.parse(JSON.stringify(objData)), reqType,session.conversationData.sys_id, function (data) {
                    let msg = 'Successfully added additional comment for your incident:- <br/>Incident Id : '+session.conversationData.IncidentNumber+'<br/>Category : '+session.conversationData.category+'<br/>Short Description : '+session.conversationData.short_description+' <br/>Status: '+session.conversationData.incident_state+' <br/> Comments : '+session.conversationData.commentReopenIncident;
                    session.conversationData.commentReopenIncident = '';
                    session.conversationData.incident_state = '';
                    session.conversationData.urgency = '';
                    session.conversationData.category = '';
                    session.conversationData.short_description = '';
                    session.conversationData.IncidentNumber = '';
                    session.endDialog(msg);
                });
             }
        }
    ];
    
}());