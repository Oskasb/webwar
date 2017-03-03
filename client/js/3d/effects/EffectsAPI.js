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

        EffectsAPI.requestParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnParticleEffect(id, pos, vel);
        };

        EffectsAPI.tickEffectSimulation = function(tpf) {
            particleSpawner.updateSpawnedParticles(tpf);
        };

        
        return EffectsAPI;

    });