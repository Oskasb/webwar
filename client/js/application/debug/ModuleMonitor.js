"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var ModuleMonitor = function() {

            var _this=this;

            var monitorStatus = function(src, bool) {
                _this.registerStatus(bool)
            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_MODULES', monitorStatus);
        };

        ModuleMonitor.prototype.registerStatus = function(bool) {

            if (bool) {
                var piece = PipelineAPI.readCachedConfigKey("GAME_DATA", "OWN_PLAYER").ownPiece;
                console.log("Monitor Modules:", piece.clientModules);
                this.monitorModules(piece.clientModules)
            } else {
                console.log("Close Module Monitor")
            }

        };

        ModuleMonitor.prototype.monitorModules = function(modules) {

            for (var i = 0; i < modules.length; i++) {
                console.log(modules[i].id, modules[i].state.value)
            }

        };

        ModuleMonitor.prototype.monitorPipeline = function() {

        };

        return ModuleMonitor;

    });