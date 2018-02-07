(function () {
    'use strict';

    function jsonRequest() {
        this.short_description = null;
        this.caller_id = null;
        this.category = null;
        this.urgency = null;
        this.json = true;
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
        '4': {
            'ENGLISH': 'Resolved'
        },
        '5': {
            'ENGLISH': 'Closed'
        },
        '6': {
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
        'INCIDENTSTATUS' : 'https://dev18442.service-now.com/api/now/v1/table/incident',
        'SERVICEREQUEST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_request'
    };

    module.exports.jsonRequest = jsonRequest;
    module.exports.incidentStatus = incidentStatus;
    module.exports.categoryStatic = categoryStatic;
    module.exports.urgencyStatic = urgencyStatic;
    module.exports.apiList = apiList;
}());