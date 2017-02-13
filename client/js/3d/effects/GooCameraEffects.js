"use strict";


define([
        '3d/GooEntityFactory',
        'Events'
    ],
    function(
        GooEntityFactory,
        evt
    ) {

        var Vector3  = goo.Vector3;
        
        var playerSpatial;

        var effectIndex  = {
            hyper_drive:{vector:new Vector3(0, 0, 230), rotfactor:1},
            shield:{vector:new Vector3(0, 0, 70), rotfactor:0}
        };

        var GooCameraEffects = function() {

            this.fxRotFactor = 0.95;
            this.defaultRotfactor = 0;
            this.defaultCamAngles = new Vector3(0,0, 0);
            this.cameraDefault = new Vector3(0, 0, 120);
            this.effectVector = new Vector3(0, 0, 100);
            this.calcVec = new Vector3(0, 0, 0);

            var camReady = function(e) {
                this.camera = evt.args(e).camera;
                this.cameraDefault.set(this.camera.transformComponent.transform.translation);
                this.camera.transformComponent.transform.rotation.toAngles(this.defaultCamAngle);
                this.defaultCamAngleZ = this.defaultCamAngles.z;
        //        console.log("Cam to angles", this.defaultRotZ);
                this.setupCameraEffects();
            }.bind(this);

            var tickCamEffects = function(e) {
                this.tickCameraEffects(evt.args(e).tpf);
            }.bind(this);

            evt.on(evt.list().CAMERA_READY, camReady);
            evt.on(evt.list().CLIENT_TICK, tickCamEffects);
        };

        GooCameraEffects.prototype.setupCameraEffects = function() {

            var moduleTodggled = function(e) {
    //            console.log("Mod Toggle", e)
                this.handleToggledModule(evt.args(e))
            }.bind(this);


            evt.on(evt.list().NOTIFY_MODULE_ONOFF, moduleTodggled);
        };

        GooCameraEffects.prototype.handleToggledModule = function(args) {
            if (effectIndex[args.id]) {
                this.applyEffectState(effectIndex[args.id], args.on)
            }
        };

        GooCameraEffects.prototype.applyEffectState = function(effect, onOff) {
    //        console.log("FX", effect, onOff)
            if (onOff) {
                this.setEffectVector(effect.vector, effect.rotfactor)
            } else {
                this.setEffectVector(this.cameraDefault, this.defaultRotfactor)
            }

        };

        GooCameraEffects.prototype.addEffectVector = function(vector) {
            this.effectVector.set(this.cameraDefault);
            this.effectVector.add(vector);
        };

        GooCameraEffects.prototype.setEffectVector = function(vector, rotFactor) {
            this.fxRotFactor = rotFactor;
            this.effectVector.set(vector);
        };

        GooCameraEffects.prototype.tickCameraEffects = function(tpf) {

            if (!on) return;

        //    var rotZ = playerSpatial.rot[0]+Math.PI;

       //     var camZ = this.camera.transformComponent.transform.rotation.toAngles(this.calcVec).data[2];

       //     camZ = MATH.radialLerp(camZ, rotZ, this.fxRotFactor*tpf);

       //     this.camera.transformComponent.transform.rotation.fromAngles(0, 0, camZ);

            this.calcVec.set(this.effectVector);
            this.calcVec.sub(this.camera.transformComponent.transform.translation);

            this.calcVec.mulDirect(1, 1, 1*tpf);

            this.camera.transformComponent.transform.translation.add(this.calcVec);

            this.camera.transformComponent.setUpdated()

        };

        var on = false;

        var controlledPieceUpdated = function(e) {
            on=true;
            playerSpatial = evt.args(e).spatial;
        };

        evt.once(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);

        return GooCameraEffects;

    });