"use strict";


define([
    'application/debug/StatusMonitor',
    'application/debug/ModuleMonitor',
    'application/debug/GooMonitor'
], function(
    StatusMonitor,
    ModuleMonitor,
    GooMonitor
) {

    
    
    var SetupDebug = function() {
        new StatusMonitor();
        new ModuleMonitor();
        new GooMonitor();
    };

    return SetupDebug;

});