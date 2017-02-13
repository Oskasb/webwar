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

        var DevConfigurator = function() {
            this.panel = null;
            this.currentValue = 0;

            PipelineAPI.setCategoryData('STATUS', {DEV_MODE:false});

            var _this=this;

            var applyDevConfig = function(src, value) {
                setTimeout(function() {
                    _this.applyDevConfig(value)
                }, 100);

            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'DEV_MODE', applyDevConfig);
         //   evt.on(evt.list().MONITOR_STATUS, applyDevConfig);
        };

        DevConfigurator.prototype.applyDevConfig = function(value) {

            if (this.currentValue == value) {
                return
            }

            this.currentValue = value;

            if (value == 1 && this.panel == null) {
                this.panel = new DomPanel(GameScreen.getElement(), 'dev_panel');
            } else if (this.panel) {
                this.panel.removeGuiPanel();
                this.panel = null;
            }
        };


        return DevConfigurator;

    });