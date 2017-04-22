"use strict";


define([
        'Events',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasRadar',
        'ui/canvas/CanvasInputVector',
        'ui/canvas/CanvasGraph',
        'ui/canvas/CanvasFunctions'
    ],
    function(
        evt,
        PipelineAPI,
        CanvasGuiAPI,
        GameScreen,
        CanvasRadar,
        CanvasInputVector,
        CanvasGraph,
        CanvasFunctions
    ) {


        var CanvasElement = function(canvasParams) {

    //        console.log("CANVAS ELEM", canvasParams);

            this.time = 0;
            this.configs = {};
            this.canvasApi = new CanvasGuiAPI(64);
            this.canvasParams = canvasParams;
            this.renderModel = canvasParams.renderModel;
            this.canvasGuiConfig = {
                element:{
                    pos:[70, 70],
                    size:[20, 20],
                    blendMode:'color_add'
                }
            };

            for (var key in canvasParams.config) {
                this.canvasGuiConfig[key] = canvasParams.config[key];
            }

        };


        CanvasElement.prototype.applyElementConfig = function(parent, configs) {
            this.canvasFunctions = new CanvasFunctions(this.canvasApi);
            this.canvasFunctions.setupCallbacks(this.canvasParams.id, configs, this.canvasGuiConfig.callbacks);

            this.configs = configs;

            this.callbackMap = {
                processCallbacks:function() {}
            };

            if (!this.ready) {

                if (this.renderModel == 'canvas3d') {


                    var _this = this;

                    var playerReady = function(src, player) {

                        if (_this.ready) {
                            console.log("Canvas Ui already initiated");
                            return
                        }

                        _this.canvasApi.init3dCanvasGui(_this.callbackMap, _this.canvasGuiConfig);
                        _this.ctx = _this.canvasApi.getCanvasContext();
                        _this.ready = true;

                        _this.canvasApi.setGuiTextureResolution(_this.configs.resolution);
                        _this.canvasApi.setGuiAttenuationRgba(_this.configs.attenuation);
                    };

                    PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', playerReady);

                } else {
        //            console.log(parent);
                    this.canvasApi.initDomCanvasGui(parent.element, this.callbackMap);
                    this.ctx = this.canvasApi.getCanvasContext();
                    this.ready = true;
                }


            }



        };

        CanvasElement.prototype.toggleEnabled = function(bool) {
            this.ready = bool;
            this.canvasApi.toggleGuiEnabled(bool);
        };

        CanvasElement.prototype.updateCanvasElement = function(tpf) {
            if (!this.ready) return;
            this.time += tpf;
            if (this.time > this.configs.tpf) {
                this.canvasFunctions.callCallbacks(tpf, this.ctx);
                this.canvasApi.updateCanvasGui(tpf);
                this.time = 0;
            }
            
        };

        return CanvasElement;

    });


