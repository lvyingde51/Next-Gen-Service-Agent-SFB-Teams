(function () {
    'use strict';
    var builder = require('botbuilder');

    function jsonRequest() {
        this.short_description = null;
        this.caller_id = `${process.env.caller_id}`;
        this.category = null;
        this.urgency = null;
        this.incident_state = null;
        this.json = true;
    }

    function statusUpdate() {
        this.caller_id = `${process.env.caller_id}`;
        this.comments = '';
        this.incident_state = null;
        this.json = true;
    }

    function incidentCreatedData() {
        this.incidentid = null;
        this.urgency = null;
        this.category = null;
        this.short_description = null;
        this.status = null;
    }

    function createSR() {
        this.short_description = null;
        this.sr_ID = null;
    }
    function progress(session, options, asyncFn) {
        session.beginDialog("progress:progressDialog", {
            asyncFn: asyncFn,
            options: options
        });
    }
    const incidentStatus = {
        '1': {
            'ENGLISH': 'New'
        },
        '2': {
            'ENGLISH': 'In Progress'
        },
        '3': {
            'ENGLISH': 'On-hold'
        },
        '6': {
            'ENGLISH': 'Resolved'
        },
        '7': {
            'ENGLISH': 'Closed'
        },
        '8': {
            'ENGLISH': 'Cancelled'
        }
    };

    const categoryStatic = {
        '1': {
            'ENGLISH': 'Inquiry/Help'
        },
        '2': {
            'ENGLISH': 'Software'
        },
        '3': {
            'ENGLISH': 'Hardware'
        },
        '4': {
            'ENGLISH': 'Network'
        },
        '5': {
            'ENGLISH': 'Database'
        }
    };

    const urgencyStatic = {
        '1': {
            'ENGLISH': 'High'
        },
        '2': {
            'ENGLISH': 'Medium'
        },
        '3': {
            'ENGLISH': 'Low'
        }
    };

    const apiList = {
        'INCIDENTSTATUS': `${process.env.ServiceNowURL}/incident`,
        'SERVICEREQUEST': `${process.env.ServiceNowURL}/sc_req_item`,
        'CREATEINCIDENT': `${process.env.ServiceNowURL}/incident`,
        'CREATESERVICEREQUEST': `${process.env.ServiceNowURL}/sc_req_item`,
        'INCIDENTLIST': `${process.env.ServiceNowURL}/incident?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on`,
        'SERVICELIST': `${process.env.ServiceNowURL}/sc_req_item?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on`,
        'FINALINCIDENT': `${process.env.ServiceNowURL}/incident?sysparm_limit=1&sysparm_query=ORDERBYDESCsys_created_on&caller_id=rubin.crotts`
    };

    var capitaliseString = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const regexPattern = {
        'INCIDENTREGEX': /^(inc)\w+\d{6}$/gim,
        'SERVICEREGEX': /^(ritm)\w+\d{6}$/gim
    };

    var getButtons = function (session) {

    }

    var getButtonsList = function (session, type) {
        // 1 - New | 2 - In Progress | 3 - On Hold | 6 - Resolved | 7 - Closed | 8 - Cancelled
        var response = [];
        if (type == 'CardArray') {
            if (session.conversationData.incident_state == '7' || session.conversationData.incident_state == '8') {
                response.push(builder.CardAction.imBack(session, "Reopen", "Reopen"));
            } else {
                response.push(builder.CardAction.imBack(session, "Add a Comment", "Add a Comment"));
                response.push(builder.CardAction.imBack(session, "Close", "Close"));
            }
            response.push(builder.CardAction.imBack(session, "Thank You", "Thank You"));
        } else {
            if (session.conversationData.incident_state == '7' || session.conversationData.incident_state == '8') {
                response.push("Reopen", "Thank You");
            } else {
                response.push("Add a Comment", "Close", "Thank You");
            }
        }
        return response;
    };

    var getCardResponse = function (platform, session, title, text, subtitle, buttons) {
        var card = null;
        let cardText = null;
        if (platform == 'slack') {
            cardText = text.split('<%>').join('\n');
            card = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                .title(`*${title}*`)
                .text(`${cardText}`)
                .subtitle(`${subtitle}`)
                .buttons(buttons)
            );
        }
        else if (platform == 'msteams') {
            cardText = text.split('<%>').join('<br/>');
            card = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
                .title(`${title}`)
                .text(`${cardText}`)
                .subtitle(`${subtitle}`)
                .buttons(buttons)
            );
        }
        return card;
    };

    module.exports.jsonRequest = jsonRequest;
    module.exports.incidentStatus = incidentStatus;
    module.exports.categoryStatic = categoryStatic;
    module.exports.urgencyStatic = urgencyStatic;
    module.exports.apiList = apiList;
    module.exports.incidentCreatedData = incidentCreatedData;
    module.exports.createSR = createSR;
    module.exports.statusUpdate = statusUpdate;
    module.exports.camelCase = capitaliseString;
    module.exports.regexPattern = regexPattern;
    module.exports.progress = progress;
    module.exports.getButtonsList = getButtonsList;
    module.exports.getCardResponse = getCardResponse;
}());