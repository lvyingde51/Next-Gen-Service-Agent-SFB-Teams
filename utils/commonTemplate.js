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
        '1': () => {
            return 'New';
        },
        '2': () => {
            return 'In Progress';
        },
        '3': () => {
            return 'On-hold';
        },
        '4': () => {
            return 'Resolved';
        },
        '5': () => {
            return 'Closed';
        },
        '6': () => {
            return 'Cancelled';
        }
    };

    module.exports.jsonRequest = jsonRequest;
    module.exports.incidentStatus = incidentStatus;
}());