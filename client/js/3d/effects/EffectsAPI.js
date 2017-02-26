"use strict";

define([
        '3d/effects/EffectsComposer',
        '3d/effects/EffectPlayer',
        '3d/effects/particles/ParticleSpawner'

    ],
    function(
        EffectsComposer,
        EffectPlayer,
        ParticleSpawner
    ) {

        var particleSpawner;

        var EffectsAPI = function() {

        };

        EffectsAPI.initEffects = function() {
            particleSpawner = new ParticleSpawner();
            EffectsComposer.initEffects();
            particleSpawner.initParticleSpawner();
        };

        EffectsAPI.requestParticleEffect = function(effectData, pos, vel) {
            particleSpawner.spawnParticleEffect(effectData, pos, vel);
        };

        EffectsAPI.tickEffectSimulation = function(tpf) {
            EffectsComposer.tickGroups(tpf);
        };
        
        return EffectsAPI;

    });