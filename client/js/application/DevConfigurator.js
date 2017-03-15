"use strict";


define([
        'Events',
        'PipelineAPI',
    'ui/GameScreen',
    'ui/dom/DomPanel'
    ],
    function(
        evt,
        PipelineAPI,
        GameScreen,
        DomPanel
    ) {

        var panels = {};
        var panelStates = {};

        
        var panelMap = {
            DEV_MODE:'dev_panel',
            DEV_STATUS:'dev_status',
            MON_SERVER_STATUS:'server_status',
            MON_CLIENT_STATUS:'client_status'
        };
        
        var DevConfigurator = function() {
            this.running = false;
            this.panel = null;
            this.currentValue = 0;

            PipelineAPI.setCategoryData('STATUS', {DEV_STATUS:false});
            PipelineAPI.setCategoryData('STATUS', {DEV_MODE:false});
            PipelineAPI.setCategoryData('STATUS', {MON_SERVER_STATUS:false});
            PipelineAPI.setCategoryData('STATUS', {MON_CLIENT_STATUS:false});

            var _this=this;

            var applyDevConfig = function(src, value) {
                console.log(src, value);
                setTimeout(function() {
                    _this.applyDevConfig(src,value)
                }, 100);

            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'DEV_MODE', applyDevConfig);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'DEV_STATUS', applyDevConfig);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_SERVER_STATUS', applyDevConfig);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_CLIENT_STATUS', applyDevConfig);
         //   evt.on(evt.list().MONITOR_STATUS, applyDevConfig);
        };

        var tickStatusMonitor = function() {
            evt.fire(evt.list().TICK_STATUS_MONITOR, {})
        };


        DevConfigurator.prototype.applyDevConfig = function(src, value) {


            if (panelStates[src] == value) {
                return
            }

            panelStates[src] = value;

            if (value == 1 && panels[src] == null) {
                
                panels[src] = new DomPanel(GameScreen.getElement(), panelMap[src]);

                var run = false;

                if (src == 'MON_SERVER_STATUS' || src == 'MON_CLIENT_STATUS' ) {
                    run = true;
                }

                if (run && this.running == false) {
                    this.running = true;
                    evt.on(evt.list().CLIENT_TICK, tickStatusMonitor);
                }

            } else if (panels[src]) {

                if (src != 'DEV_MODE') {

                    var count = 0;

                    var keep = false;

                    for (var key in panels) {
                        if (key == 'MON_SERVER_STATUS' || key == 'MON_CLIENT_STATUS' ) {
                            keep = true;
                        }
                    }

                    if (!keep) {
                        this.running = false;
                        evt.removeListener(evt.list().CLIENT_TICK, tickStatusMonitor);
                    }
                }

                panels[src].removeGuiPanel();
                delete panels[src];
            }
        };

        
        
        

        return DevConfigurator;

    });