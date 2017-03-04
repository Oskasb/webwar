"use strict";

define([
        'Events',
        'PipelineObject',
        'PipelineAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasElement'
    ],
    function(
        evt,
        PipelineObject,
        PipelineAPI,
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

            var clientTick = function(e) {
                _this.canvasElement.updateCanvasElement(evt.args(e).tpf);
            };


            var toggleTriggered = function(src, data) {
                console.log("Enable event", src, data);
                PipelineAPI.setCategoryKeyValue(_this.conf.enableOnEvent.category, src, data);
                _this.canvasElement.toggleEnabled(data);
            };

            var playerReady = function() {

                if (_this.ready) return;

                if (!_this.active) {
                    _this.pipelineObject = new PipelineObject('canvas', 'systems');
                    _this.pipelineObject.subscribe(configLoaded);

                }

                _this.active = true;

                if (_this.conf.enableOnEvent) {
                    console.log("Enable event", _this.conf);
                    var data = {};
                    data[_this.conf.enableOnEvent.key] = false;
                    PipelineAPI.setCategoryData(_this.conf.enableOnEvent.category, data);
                    PipelineAPI.subscribeToCategoryKey(_this.conf.enableOnEvent.category, _this.conf.enableOnEvent.key, toggleTriggered);

                }

                _this.ready = true;
                evt.on(evt.list().CLIENT_TICK, clientTick);
            };



            var guiReady = function() {
                console.log("GUI READY CALLBACK FIRED");

            };
            new PipelineObject('GAME_DATA', 'OWN_PLAYER', playerReady);
            var configLoaded = function(src, conf) {
                _this.canvasElement.applyElementConfig(_this.parent, _this.pipelineObject.buildConfig()[_this.configId], guiReady);
            };


        };


        DomCanvas.prototype.removeUiSystem = function() {
            this.canvasApi.removeCanvasGui();
        };

        return DomCanvas;

    });


