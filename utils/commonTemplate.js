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
}());