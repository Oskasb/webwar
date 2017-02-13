"use strict";

define([
    'Events',
    'PipelineAPI',
    'PipelineObject'

], function(
    evt,
    PipelineAPI,
    PipelineObject
) {
    
    var Vector3 = goo.Vector3;
    var camera;
    var g00;
    var backgrounds = {};
    var configs = {};
    var modulationSpatial;

    var effectIndex  = {
        hyper_drive:'hyper_space',
        shield:'shield'
    };
    
    var SpaceFX = function() {
        var pipeObj;
        var bkPipe;

        this.time = 0;

        this.targetColor = [0, 0, 0, 0];
        this.sourceColor = [0, 0, 0, 0];
        this.baseColor = [0.05, 0.0, 0.09, 0.2];
        this.flashColor = [0.04, 0.02, 0.12, 0.2];
        this.currentColor = [0.05, 0.0, 0.09, 0.2];
        this.flashTime = 0.8;
        this.flashCurve = [[0, 0], [1,1]];
        this.adsr = [0.2, 0.3, 1];

        this.calcVec = new Vector3();
        this.camPos = new Vector3();
        this.posVec = new Vector3();
        this.velVec = new Vector3();
        this.colorVec = new Vector3();

        this.effectData = {
            color:this.colorVec.data
        };

        var engineReady = function(e) {
            g00 = evt.args(e).goo;
            modulationSpatial = new MODEL.Spatial();
        //    this.enableSpaceFx();
        //    evt.removeListener(evt.list().ENGINE_READY, engineReady);
        }.bind(this);

        function cameraReady(e) {
            camera = evt.args(e).camera;
        //    evt.removeListener(evt.list().CAMERA_READY, cameraReady);


        }

        evt.once(evt.list().CAMERA_READY, cameraReady);
        evt.once(evt.list().ENGINE_READY, engineReady);

        var fxConfig = function() {
            configs = pipeObj.buildConfig('effect_data');
        };

        var backgroundCfg = function() {
            backgrounds = bkPipe.buildConfig('data');
        };

        pipeObj = new PipelineObject('effects','environment', fxConfig);
        bkPipe = new PipelineObject('effects','background', backgroundCfg);

        var controlledPieceUpdated = function(e) {
            modulationSpatial = evt.args(e).spatial;
        //    evt.fire(evt.list().ATTACH_BUNDLE_ENTITY, {entityName:"Blue Skysphere", parent:camera});
        };

        evt.once(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);

    };


    SpaceFX.prototype.applyVolumeVector = function(confData, vec3) {

        vec3.addDirect(confData[0]*(Math.random()-0.5), confData[1]*(Math.random()-0.5), confData[2]*(Math.random()-0.5));
    };
    
    SpaceFX.prototype.applyFXVector = function(confData, vec3) {
        vec3.addDirect(confData[0]*(Math.random()-0.5), confData[1]*(Math.random()-0.5), confData[2]*(Math.random()-0.5));
    };

    SpaceFX.prototype.updateColorFX = function(confMin, confMax, vec3) {
        vec3.setDirect(
            confMin[0] + (confMax[0] - confMin[0])*Math.random(),
            confMin[1] + (confMax[1] - confMin[1])*Math.random(),
            confMin[2] + (confMax[2] - confMin[2])*Math.random()
        );
    };

    SpaceFX.prototype.spawnConfigureSpaceFX = function(conf, time) {


        if (!this.camPos.x) {
    //        console.log("no cam pos")
            return;
        }


        this.posVec.set(this.camPos);
    //
        this.posVec.z -= conf.distance;

        this.applyVolumeVector(conf.volume, this.posVec);


        this.calcVec.setDirect(modulationSpatial.vel.getX(), modulationSpatial.vel.getY(), modulationSpatial.vel.getZ());


        var distFactor = (this.camPos.z-this.posVec.z) * 0.006;

        this.calcVec.mulDirect(distFactor, distFactor, 0);

        this.posVec.add(this.calcVec);


        this.applyFXVector(conf.speed, this.velVec);
        this.updateColorFX(conf.colorMin, conf.colorMax, this.colorVec);

        evt.fire(evt.list().GAME_EFFECT, {effect:conf.game_effect, pos:this.posVec, vel:this.velVec, params:this.effectData});
    };

    SpaceFX.prototype.processConfFX = function(conf, time, tpf) {
        for (var i = 0; i < conf.length; i++) {

            if (Math.random() < conf[i].frequency) {
                this.spawnConfigureSpaceFX(conf[i], time);
            }
        }

        if (this.time < this.flashTime) {
            this.processBackground(tpf);
        }

    };

    SpaceFX.prototype.processBackground = function(tpf) {
        this.time += tpf;

    //    var blend = MATH.calcFraction(0, this.flashTime, this.time)

    //    console.log(blend);

        if (this.time < this.adsr[0]) {
            
            var frac = MATH.calcFraction(0, this.adsr[0], this.time)
            
            MATH.blendArray(this.sourceColor, this.flashColor, frac, this.currentColor);
        } else {

            var frac = MATH.calcFraction(this.adsr[0], this.flashTime, this.time)
            
            MATH.blendArray(this.flashColor, this.baseColor, frac, this.currentColor);
        }

        g00.renderer.setClearColor(
            this.currentColor[0],
            this.currentColor[1],
            this.currentColor[2],
            this.currentColor[3]
        );
    };

    SpaceFX.prototype.applyBackgroundFx = function(conf) {

        this.time = 0;

        this.sourceColor[0] = this.currentColor[0];
        this.sourceColor[1] = this.currentColor[1];
        this.sourceColor[2] = this.currentColor[2];
        this.sourceColor[3] = this.currentColor[3];

        this.baseColor = conf.baseColor;
        this.flashColor = conf.flashColor;
        this.flashTime = conf.flashTime;

        this.adsr = conf.adsr;
    };

    SpaceFX.prototype.updateSpaceFX = function(time, tpf) {

        this.camPos.set(camera.transformComponent.transform.translation);

        for (var key in configs) {
            this.processConfFX(configs[key], time, tpf);
        }

    };

    var sysTime = 0;
    SpaceFX.prototype.enableSpaceFx = function() {

        var _this = this;
        
        function clientTick(e) {
            sysTime += evt.args(e).tpf;
            _this.updateSpaceFX(sysTime, evt.args(e).tpf);
        }

        evt.on(evt.list().CLIENT_TICK, clientTick);

        var moduleTodggled = function(e) {
            this.handleToggledModule(evt.args(e))
        }.bind(this);

        evt.on(evt.list().NOTIFY_MODULE_ONOFF, moduleTodggled);
        
    };


    SpaceFX.prototype.handleToggledModule = function(args) {
        if (effectIndex[args.id]) {

            if (args.on) {
                if (configs[effectIndex[args.id]]) {

                    for (var i = 0; i < configs[effectIndex[args.id]].length; i++) {
                        configs[effectIndex[args.id]][i].frequency = 0.3;
                    }


                } else {
                    console.log("No SpaceFX for ", args.id, configs);
                }

                if (backgrounds[effectIndex[args.id]]) {
                    this.applyBackgroundFx(backgrounds[effectIndex[args.id]])
                } else {
                    if (backgrounds.default) {
                        this.applyBackgroundFx(backgrounds.default)
                    }
                }
            } else {

                if (backgrounds.default) {
                    this.applyBackgroundFx(backgrounds.default)
                }

                if (configs[effectIndex[args.id]]) {
                    for (var i = 0; i < configs[effectIndex[args.id]].length; i++) {
                        configs[effectIndex[args.id]][i].frequency = 0;
                    }

                } else {
                    console.log("No SpaceFX for ", args.id);
                }
            }

        }
    };
    

    SpaceFX.prototype.setupSpaceFxScene = function() {
        this.enableSpaceFx();
    };


    return SpaceFX;

});