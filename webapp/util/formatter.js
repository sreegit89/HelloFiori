sap.ui.define([
    
], function() {
    'use strict';
    return {
        getStatus : function (inp) {
            switch (inp) {
                case "Available":
                    return "Success";
                    break;
                case "Discontinued":
                    return "Error";
                    break;
                case "Out of Stock":
                    return "Warning";
                    break;
                default:
                    break;
            }
        }
    };
});