"use strict";

define([

    ],
    function(
    ) {

        var EffectPlayer = function() {

        };


        EffectPlayer.triggerEmitter = function(group, pos, vel) {
 
        };
        
        EffectPlayer.requestParticleEffect = function() {

        };
        
        var lastFancyParticles = 0;
        var lastfancySims = 0;
        var lastCheapParticles = 0;
        var lastCheapSims = 0;
        var lastMatCount= 0;
        
        var monitorParticleStatus = function() {

            var count = EffectsAPI.getParticleCount();

            if (count != lastFancyParticles) {
                lastFancyParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_PARTICLES:lastFancyParticles});
            }

            count = EffectsAPI.getParticleSimCount();

            if (count != lastfancySims) {
                lastfancySims = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_SIMULATIONS:lastfancySims});
            }

            count = EffectsAPI.getCheapParticleCount();

            if (count != lastCheapParticles) {
                lastCheapParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_PARTICLES:lastCheapParticles});
            }

            count = EffectsAPI.getCheapParticleSimCount();

            if (count != lastCheapSims) {
                lastCheapSims = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_SIMULATORS:lastCheapSims});
            }

            var matCount = EffectsAPI.getParticleMaterialCount();
            matCount += EffectsAPI.getCheapMaterialCount();

            if (matCount != lastMatCount) {
                lastMatCount = matCount;
                evt.fire(evt.list().MONITOR_STATUS, {MATERIALS:lastMatCount});
            }

        };
        
        return EffectPlayer;

    });