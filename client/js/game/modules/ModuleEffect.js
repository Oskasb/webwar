"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {
        
        var ModuleEffect = function() {
            
            this.effectData = {
                params:{},
                state:{}
            };
        };

        ModuleEffect.prototype.setupEffectModelData = function(applies, piece, tempSpatial) {

            this.applies = applies;
            
            if (!applies.state_factor) applies.state_factor = 1;

            var effectData = applies.effect_data;

            for (var key in effectData) {
                if (effectData[key].length) {
                    this.effectData.params[key] = [];
                    this.effectData.state[key] = [];
                    for (var i = 0; i < effectData[key].length; i++) {
                        this.effectData.params[key][i] = effectData[key][i];
                        this.effectData.state[key][i] = effectData[key][i];
                    }
                } else {
                    this.effectData.params[key] = effectData[key] / applies.state_factor;
                    this.effectData.state[key] = 0;
                }
            }

            var getRotation = function() {
                return piece.spatial.yaw()+tempSpatial.yaw();
            };

            var getPosition = function() {
                return tempSpatial.pos.data;
            };
            
            var particleUpdate = function(particle, tpf) {
                particle.lifeSpan = piece.temporal.lifeTime;
                particle.position.setArray(getPosition(particle, tpf));
                particle.rotation = getRotation(particle, tpf);
            };

            this.attachModuleEffect(piece.spatial, applies.game_effect, particleUpdate);
        };

        ModuleEffect.prototype.setupEmitEffectData = function(applies, piece, tempSpatial, transform) {

            this.applies = applies;

            if (!applies.state_factor) applies.state_factor = 1;
            
            var getRotation = function() {
                return -piece.spatial.rot.data[0]+transform.rot[2];
            };

            var getPosition = function() {

                if  (transform) {
                    // _this.readWorldTransform(_this.applies.transform.pos, _this.applies.transform.rot);
                    return tempSpatial.pos.data;
                } else {
                    return piece.spatial.pos.data;
                }

            };
            
            var particleUpdate = function(particle, tpf) {
                particle.lifeSpan = piece.temporal.lifeTime;
                particle.position.setArray(getPosition(particle, tpf));
                particle.rotation = getRotation(particle, tpf);
                particle.progress = 0.5 + Math.clamp(piece.spatial.yawVel()*0.5, -0.49, 0.49);
            };

        };

        ModuleEffect.prototype.attachModuleEffect = function(spatial, game_effect, particleUpdate) {
            this.gameEffect.attachGameEffect(spatial, game_effect, particleUpdate);
        };

        ModuleEffect.prototype.checkEffect = function(value, key) {
            if (typeof(value) != 'number') {
                console.log("Bad Value", key, effectData[key])
            }
        };

        ModuleEffect.prototype.populateEffectData = function(amplitude) {
            for (var key in this.effectData.params) {
                if (this.effectData.params[key].length) {
                    for (var i = 0; i < this.effectData.params[key].length; i++) {
                        if (key == 'color') {
                            this.effectData.state[key][i] = this.effectData.params[key][i] * MATH.clamp(amplitude, 0, 1);
                        } else {
                            this.effectData.state[key][i] = this.effectData.params[key][i] * amplitude;
                        }
                    }
                } else {
                    this.effectData.state[key] = this.effectData.params[key] * amplitude;
                }

            return;

                var effectData = this.effectData.state;

                for (var key in effectData) {
                    if (effectData[key].length) {
                        for (var i = 0; i < effectData[key].length; i++) {
                            this.checkEffect(effectData[key][i], key)
                        }
                    } else {
                        this.checkEffect(effectData[key], key)
                    }
                }
            }
        };

        ModuleEffect.prototype.updateModuleEffect = function(module, pos, vel) {

            if (this.gameEffect.started) {
                if (this.gameEffect.paused) {
                    this.gameEffect.startGooEffect();
                }
            }

            if (module.state.value > 0 && this.applies.emit_effect) {
                if (typeof(module.state.value) == 'number') {
                    this.populateEffectData(module.state.value);
                } else {
                    var intensity = this.applies.effect_data.intensity || 0.5;
                    this.populateEffectData(Math.random()*intensity);
                }
                
                evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.emit_effect, pos:pos, vel:vel, params:this.effectData.state});
            }
        };



        return ModuleEffect;

    });