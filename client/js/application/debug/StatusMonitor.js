"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var StatusMonitor = function() {

            var _this=this;

            var monitorStatus = function(e) {
                _this.registerStatus(evt.args(e))
            };

            evt.on(evt.list().MONITOR_STATUS, monitorStatus);
            this.monitorSystem();

            this.monitorPipeline();
        };

        StatusMonitor.prototype.registerStatus = function(data) {

        //    if (data.value != PipelineAPI.readCachedConfigKey('STATUS', data.key)) {
                PipelineAPI.setCategoryData('STATUS', data);
        //    }


        };

        StatusMonitor.prototype.monitorSystem = function() {
            function applyDebugConfig(src, DEBUG) {
                evt.fire(evt.list().MONITOR_STATUS, {MON_SERVER:DEBUG.monitorServer});
                evt.fire(evt.list().MONITOR_STATUS, {MON_TRAFFIC:DEBUG.trackTraffic});
                evt.fire(evt.list().MONITOR_STATUS, {MON_TPF:DEBUG.trackTpf});
                evt.fire(evt.list().MONITOR_STATUS, {MON_SPATIAL:DEBUG.monitorSpatial});
            //    evt.fire(evt.list().MONITOR_STATUS, {FILE_CACHE:DEBUG.monitorFiles});
                evt.fire(evt.list().MONITOR_STATUS, {MON_MODULES:DEBUG.monitorModules});
                
                evt.fire(evt.list().MONITOR_STATUS, {PIPELINE:PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled});
            }

            PipelineAPI.subscribeToCategoryKey("setup", "DEBUG", applyDebugConfig);
        };

        StatusMonitor.prototype.monitorPipeline = function() {

        };

        return StatusMonitor;

    });