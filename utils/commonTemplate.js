(function () {
    'use strict';

    function jsonRequest() {
        this.short_description = null;
        this.caller_id = null;
        this.category = null;
        this.urgency = null;
        this.json = true;
    }

    function statusUpdate() {
        this.caller_id = null;
        this.comments = null;
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
        'INCIDENTSTATUS' : 'https://dev18442.service-now.com/api/now/v1/table/incident',
        'SERVICEREQUEST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_req_item',
        'CREATEINCIDENT' : 'https://dev18442.service-now.com/api/now/v1/table/incident',
        'CREATESERVICEREQUEST' : 'https://dev18442.service-now.com/api/now/v1/table/sc_req_item'
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