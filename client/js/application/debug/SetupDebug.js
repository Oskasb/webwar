"use strict";


define([
    'application/debug/StatusMonitor',
    'application/debug/ModuleMonitor',
    'application/debug/ThreeMonitor'
], function(
    StatusMonitor,
    ModuleMonitor,
    ThreeMonitor
) {

    
    
    var SetupDebug = function() {
        new StatusMonitor();
        new ModuleMonitor();
        new ThreeMonitor();
    };

    return SetupDebug;

});