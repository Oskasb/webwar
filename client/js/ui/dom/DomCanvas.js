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
            };

            var clientTick = function(e) {
                _this.canvasElement.updateCanvasElement(evt.args(e).tpf);
            };

            var playerReady = function() {

                if (_this.ready) return;

                if (!_this.active) {
                    _this.pipelineObject = new PipelineObject('canvas', 'systems');
                    _this.pipelineObject.subscribe(configLoaded);

                }

                this.active = true;

                if (_this.conf.enableOnEvent) {
                    console.log("Enable event", this.conf);
                    var data = {};
                    data[_this.conf.enableOnEvent.key] = false;
                    PipelineAPI.setCategoryData(_this.conf.enableOnEvent.category, data);
                    PipelineAPI.subscribeToCategoryKey(_this.conf.enableOnEvent.category, _this.conf.enableOnEvent.key, toggleTriggered);

                }

                _this.ready = true;
                evt.on(evt.list().CLIENT_TICK, clientTick);
            };

            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', playerReady);


            
            var toggleTriggered = function(src, data) {
                _this.canvasElement.toggleEnabled(data);
            };



        };


        DomCanvas.prototype.removeUiSystem = function() {
            this.canvasApi.removeCanvasGui();
        };

        return DomCanvas;

    });


