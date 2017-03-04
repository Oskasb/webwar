"use strict";

define([
        '3d/effects/particles/ParticleSpawner'
    ],
    function(
        ParticleSpawner
    ) {

        var particleSpawner;

        var EffectsAPI = function() {

        };

        EffectsAPI.initEffects = function() {
            particleSpawner = new ParticleSpawner();
            particleSpawner.initParticleSpawner();
        };

        EffectsAPI.requestParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnParticleEffect(id, pos, vel);
        };

        EffectsAPI.tickEffectSimulation = function(tpf) {
            particleSpawner.updateSpawnedParticles(tpf);
        };
                
        EffectsAPI.sampleTotalParticlePool = function() {
            return particleSpawner.getTotalParticlePool();
        };

        EffectsAPI.countTotalEffectPool = function() {
            return particleSpawner.getTotalEffectPool();
        };
        
        EffectsAPI.sampleActiveRenderersCount = function() {
            return particleSpawner.getActiveRendererCount();
        };
        
        EffectsAPI.sampleActiveEffectsCount = function() {
            return particleSpawner.getActiveEffectsCount();
        };
        
        EffectsAPI.sampleActiveParticleCount = function() {
            return particleSpawner.getActiveParticlesCount();
        };

        EffectsAPI.sampleEffectActivations = function() {
            return particleSpawner.getEffectActivationCount();
        };


        return EffectsAPI;

    });