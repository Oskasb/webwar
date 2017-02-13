"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var ModuleEmitter = function() {

            this.effectData = {
                params:{},
                state:{}
            };
        };

        ModuleEmitter.prototype.setupEmitEffectData = function(applies, piece, tempSpatial, transform) {

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
        };


        ModuleEmitter.prototype.populateEffectData = function(amplitude) {
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
                
            }
        };

        ModuleEmitter.prototype.updateModuleEmitter = function(module, pos, vel) {

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



        return ModuleEmitter;

    });