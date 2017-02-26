"use strict";

define([
        '3d/effects/EffectsComposer',
        '3d/effects/EffectPlayer'

    ],
    function(
        EffectsComposer,
        EffectPlayer
    ) {


        var EffectsAPI = function() {

        };

        EffectsAPI.initEffects = function() {
            EffectsComposer.initEffects();
        };

        EffectsAPI.requestParticleEffect = function(effectData, pos, vel) {
            return EffectPlayer.triggerEmitter(EffectsComposer.fetchEmitter(effectData), pos, vel);
        };

        EffectsAPI.tickEffectSimulation = function(tpf) {
            EffectsComposer.tickGroups(tpf);
        };
        
        return EffectsAPI;

    });