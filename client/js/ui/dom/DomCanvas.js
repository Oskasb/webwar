"use strict";

define([
        'Events',
        'PipelineObject',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasElement'
    ],
    function(
        evt,
        PipelineObject,
        PipelineAPI,
        CanvasGuiAPI,
        GameScreen,
        CanvasElement
    ) {


        var DomCanvas = function(parent, conf) {
            this.configId = conf.configId;
            this.conf = conf;
            this.active = false;
            this.parent = parent;
        };

        DomCanvas.prototype.initCanvasSystem = function(canvasParams) {
            
            var _this = this;
            this.canvasElement = new CanvasElement(canvasParams);

            this.ready = false;

            var configLoaded = function(src, conf) {
                _this.canvasElement.applyElementConfig(_this.parent, _this.pipelineObject.buildConfig()[_this.configId]);
                _this.ready = true;
            };

            var clientTick = function(e) {
                _this.canvasElement.updateCanvasElement(evt.args(e).tpf);
            };


            if (!this.active) {
                this.pipelineObject = new PipelineObject('canvas', 'systems');
                this.pipelineObject.subscribe(configLoaded);
                evt.on(evt.list().CLIENT_TICK, clientTick);
            }
            this.active = true;
            
            var toggleTriggered = function(src, data) {
                _this.canvasElement.toggleEnabled(data);
            };

            if (this.conf.enableOnEvent) {
    //            console.log("Enable event", this.conf);
                var data = {};
                data[this.conf.enableOnEvent.key] = false;
                PipelineAPI.setCategoryData(this.conf.enableOnEvent.category, data);
                PipelineAPI.subscribeToCategoryKey(this.conf.enableOnEvent.category, this.conf.enableOnEvent.key, toggleTriggered);
            }
                        
        };

        DomCanvas.prototype.removeUiSystem = function() {
            this.canvasApi.removeCanvasGui();
        };

        return DomCanvas;

    });


