(function () {
    'use strict';

    function jsonRequest() {
        this.short_description = null;
        this.caller_id = null;
        this.category = null;
        this.urgency = null;
        this.json = true;
    }
    module.exports.jsonRequest = jsonRequest;
// var dataService = "{short_description: '" + session.userData.shortDescription + "',caller_id: 'Pourab Karchaudhuri',category:'" + session.userData.category + "',urgency: '" + session.userData.severity + "',comments: 'Testing Create incident',json: true }";
}());