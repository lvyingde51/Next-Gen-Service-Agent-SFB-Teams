(function () {
    'use strict';

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
<<<<<<< HEAD
        'INCIDENTSTATUS' : `${process.env.ServiceNowURL}/incident`,        
        'SERVICEREQUEST' : `${process.env.ServiceNowURL}/sc_req_item`,
        'CREATEINCIDENT' : `${process.env.ServiceNowURL}/incident`,
        'CREATESERVICEREQUEST' : `${process.env.ServiceNowURL}/sc_req_item`,
        'INCIDENTLIST' : `${process.env.ServiceNowURL}/incident?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on`,
        'SERVICELIST' : `${process.env.ServiceNowURL}/sc_req_item?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on `
=======
        'INCIDENTSTATUS' : 'https://dev18442.service-now.com/api/now/v1/table/incident',        
        'SERVICEREQUEST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_req_item',
        'CREATEINCIDENT' : 'https://dev18442.service-now.com/api/now/v1/table/incident',
        'CREATESERVICEREQUEST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_req_item',
        'INCIDENTLIST' : 'https://dev18442.service-now.com/api/now/v1/table/incident?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on',
        'SERVICELIST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_req_item?sysparm_limit=10&sysparm_query=ORDERBYDESCsys_created_on',
        'LASTINCIDENT' : 'https://dev18442.service-now.com/api/now/v1/table/incident?sysparm_limit=1&sysparm_query=ORDERBYDESCsys_created_on'
>>>>>>> bd6ec45a0c11206bfbf0db127a37311cbcc311c5
    };

    var capitaliseString = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
}());