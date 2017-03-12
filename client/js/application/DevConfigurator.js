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
            DEV_STATUS:'dev_status'
        };
        
        var DevConfigurator = function() {
            this.panel = null;
            this.currentValue = 0;

            PipelineAPI.setCategoryData('STATUS', {DEV_STATUS:false});
            PipelineAPI.setCategoryData('STATUS', {DEV_MODE:false});

            var _this=this;

            var applyDevConfig = function(src, value) {
                console.log(src, value);
                setTimeout(function() {
                    _this.applyDevConfig(src,value)
                }, 100);

            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'DEV_MODE', applyDevConfig);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'DEV_STATUS', applyDevConfig);
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
                if (src == 'DEV_STATUS') {
                    evt.on(evt.list().CLIENT_TICK, tickStatusMonitor);
                }

            } else if (panels[src]) {

                if (src == 'DEV_STATUS') {
                    evt.removeListener(evt.list().CLIENT_TICK, tickStatusMonitor);
                }

                panels[src].removeGuiPanel();
                panels[src] = null;
            }
        };

        
        
        

        return DevConfigurator;

    });