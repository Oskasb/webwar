"use strict";


define([
        'Events',
        'PipelineAPI',
        'EffectsAPI',
    'ThreeAPI',
        'gui/CanvasGuiAPI',
        './MonitorEffectAPI'
    ],
    function(
        evt,
        PipelineAPI,
        EffectsAPI,
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
            evt.fire(evt.list().MONITOR_STATUS, {MON_VEGETATION:DEBUG.monitorVegetation});
            evt.fire(evt.list().MONITOR_STATUS, {PIPELINE:PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled});
        }


        StatusMonitor.prototype.monitorSystem = function() {
            PipelineAPI.subscribeToCategoryKey("setup", "DEBUG", applyDebugConfig);

            var monitorVegetation = function(src, bool) {
                EffectsAPI.setVegetationDebug(bool)
            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_VEGETATION', monitorVegetation);
        };

        StatusMonitor.prototype.monitorRenderStates = function() {
            evt.fire(evt.list().MONITOR_STATUS, {CANVAS_TICKS:CanvasGuiAPI.getCalledTicks()});
            evt.fire(evt.list().MONITOR_STATUS, {SCENE_NODES:ThreeAPI.countAddedSceneModels()});
            evt.fire(evt.list().MONITOR_STATUS, {DRAW_CALLS:ThreeAPI.sampleRenderInfo('render', 'calls')});
            evt.fire(evt.list().MONITOR_STATUS, {VERTICES:ThreeAPI.sampleRenderInfo('render', 'vertices')});

            evt.fire(evt.list().MONITOR_STATUS, {GEOMETRIES:ThreeAPI.sampleRenderInfo('memory', 'geometries')});
            evt.fire(evt.list().MONITOR_STATUS, {TEXTURES:ThreeAPI.sampleRenderInfo('memory', 'textures')});


            var shaders = ThreeAPI.sampleRenderInfo('programs', null);

            var count = 0;

            for (var key in shaders) {
                count++
            }

            evt.fire(evt.list().MONITOR_STATUS, {SHADERS:count});
        };

        StatusMonitor.prototype.monitorMemory = function() {
            var memory = performance.memory;
            var memoryUsed = ( (memory.usedJSHeapSize / 1048576) / (memory.jsHeapSizeLimit / 1048576 ));

            var mb = Math.round(memory.usedJSHeapSize / 104857.6) / 10;



            evt.fire(evt.list().MONITOR_STATUS, {MEM:mb +' MB  ('+ Math.round(memoryUsed*100) + ' %)'});
        };

        var percentify = function(number, total) {
            return Math.round((number/total) * 100);
        };

        var round = function(number) {
            return Math.round(number);
        };

        StatusMonitor.prototype.monitorTimeDetails = function() {
            var tpf = PipelineAPI.readCachedConfigKey('STATUS', 'TPF')*1000;

            var timeGame = PipelineAPI.readCachedConfigKey('STATUS', 'TIME_GAME_TICK')/1000;
            var timeIdle = PipelineAPI.readCachedConfigKey('STATUS', 'TIME_ANIM_IDLE');
            var timeRender = PipelineAPI.readCachedConfigKey('STATUS', 'TIME_ANIM_RENDER');


            evt.fire(evt.list().MONITOR_STATUS, {TPF:Math.round(tpf*100)/100});

            evt.fire(evt.list().MONITOR_STATUS, {IDLE:percentify(timeIdle*1000, tpf) + '%'});

            evt.fire(evt.list().MONITOR_STATUS, {TIME_GAME:percentify(timeGame*1000, tpf) + '%'});

            evt.fire(evt.list().MONITOR_STATUS, {TIME_RENDER:percentify(timeRender*1000, tpf) +'%'});

        };

        StatusMonitor.prototype.monitorServerHealth = function() {



            var busyArray = PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_BUSY');
            var idleArray = PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_IDLE');

            if (!busyArray.length) return;

            var averageBusy = 0;
            var averageIdle = 0;

            var worstBusy = 0;
            var bestBusy = Infinity;

            for (var i = 0; i < busyArray.length; i++) {
                averageBusy += busyArray[i][0];
                averageIdle += idleArray[i][0];

                if (busyArray[i][0] < bestBusy) {
                    bestBusy = busyArray[i][0];
                }

                if (busyArray[i][0] > worstBusy) {
                    worstBusy = busyArray[i][0];
                }
            };
            averageBusy = averageBusy / busyArray.length;
            averageIdle = averageIdle / idleArray.length;


            evt.fire(evt.list().MONITOR_STATUS, {BUSY_SERVER:Math.round(averageBusy*100)/100});

            evt.fire(evt.list().MONITOR_STATUS, {IDLE_SERVER:Math.round(averageIdle*100)/100});

            evt.fire(evt.list().MONITOR_STATUS, {WORST:Math.round(worstBusy*100)/100});

            evt.fire(evt.list().MONITOR_STATUS, {BEST:Math.round(bestBusy*100)/100});

        };

        var framesSinceMessage = 0;
        var lasMessageTime = 0;

        var totalMessages = 0;
        var totalFrames = 0;
        var lastCount = 0;
        var startTime = new Date().getTime();
        var lastBytes = 0;

        var msgBytes;

        StatusMonitor.prototype.monitorServerTraffic = function() {

            var messageCount = PipelineAPI.readCachedConfigKey('STATUS', 'MESSAGE_STACK');
            var bytes = PipelineAPI.readCachedConfigKey('STATUS', 'RECIEVED_BYTES');
            totalFrames++;

            evt.fire(evt.list().MONITOR_STATUS, {FRAME_MSGS:'L: '+lastCount +' N: '+ messageCount});
            evt.fire(evt.list().MONITOR_STATUS, {FRAMES_SINCE_MSG:framesSinceMessage});

            msgBytes = bytes-lastBytes;

            if (!messageCount) {
                framesSinceMessage++;
                return;
            }

            totalMessages += messageCount;
            lastCount = messageCount;
            var now = new Date().getTime();

            evt.fire(evt.list().MONITOR_STATUS, {MSG_PER_FRAME:percentify((totalMessages / totalFrames)*0.01, 0.01)/100});
            evt.fire(evt.list().MONITOR_STATUS, {BYTES_PER_SECOND:percentify(((msgBytes /1024 ) / (now - startTime)), 0.1)/10 + 'K'});
            evt.fire(evt.list().MONITOR_STATUS, {SOCKET_MBS:Math.round(bytes  / 104857.6)/10});
            framesSinceMessage = 0;
            lastBytes = bytes;
            startTime = now;
        };



        StatusMonitor.prototype.tickMonitors = function() {
            evt.fire(evt.list().MONITOR_STATUS, {CACHE_READS:PipelineAPI.sampleCacheReadCount()});
            MonitorEffectAPI.tickEffectMonitor();
            this.monitorRenderStates();
            this.monitorMemory();
            this.monitorTimeDetails();
            this.monitorServerHealth();
            this.monitorServerTraffic();

        };
        
        
        return StatusMonitor;

    });