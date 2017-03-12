"use strict";


define([
        'Events',
        'PipelineAPI',
    'ThreeAPI',
        'gui/CanvasGuiAPI',
        './MonitorEffectAPI'
    ],
    function(
        evt,
        PipelineAPI,
        ThreeAPI,
        CanvasGuiAPI,
        MonitorEffectAPI
    ) {

        var StatusMonitor = function() {

            var _this=this;

            var monitorStatus = function(e) {
                _this.registerStatus(evt.args(e));
            //    _this.monitorEffectAPI()
            };

            evt.on(evt.list().MONITOR_STATUS, monitorStatus);
            this.monitorSystem();
            
            var tickMonitors = function() {
                _this.tickMonitors();   
            };
            
            evt.on(evt.list().TICK_STATUS_MONITOR, tickMonitors);
        };

        StatusMonitor.prototype.registerStatus = function(data) {
            PipelineAPI.setCategoryData('STATUS', data);
        };


        function applyDebugConfig(src, DEBUG) {
            evt.fire(evt.list().MONITOR_STATUS, {MON_SERVER:DEBUG.monitorServer});
            evt.fire(evt.list().MONITOR_STATUS, {MON_TRAFFIC:DEBUG.trackTraffic});
            evt.fire(evt.list().MONITOR_STATUS, {MON_TPF:DEBUG.trackTpf});
            evt.fire(evt.list().MONITOR_STATUS, {MON_SPATIAL:DEBUG.monitorSpatial});
            evt.fire(evt.list().MONITOR_STATUS, {MON_MODULES:DEBUG.monitorModules});
            evt.fire(evt.list().MONITOR_STATUS, {PIPELINE:PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled});
        }

                
        StatusMonitor.prototype.monitorSystem = function() {
            PipelineAPI.subscribeToCategoryKey("setup", "DEBUG", applyDebugConfig);
        };


        StatusMonitor.prototype.tickMonitors = function() {
            evt.fire(evt.list().MONITOR_STATUS, {CACHE_READS:PipelineAPI.sampleCacheReadCount()});
            MonitorEffectAPI.tickEffectMonitor();

            evt.fire(evt.list().MONITOR_STATUS, {CANVAS_TICKS:CanvasGuiAPI.getCalledTicks()});
            evt.fire(evt.list().MONITOR_STATUS, {SCENE_NODES:ThreeAPI.countAddedSceneModels()});
            evt.fire(evt.list().MONITOR_STATUS, {DRAW_CALLS:ThreeAPI.countDrawCalls()});

            var memory = performance.memory;
            var memoryUsed = ( (memory.usedJSHeapSize / 1048576) / (memory.jsHeapSizeLimit / 1048576 ));

        };
        
        
        return StatusMonitor;

    });