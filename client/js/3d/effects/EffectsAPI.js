"use strict";

define([
        '3d/effects/vegetation/VegetationSystem',
        '3d/effects/particles/ParticleSpawner',
        '3d/effects/filters/ScreenSpaceFX'
    ],
    function(
        VegetationSystem,
        ParticleSpawner,
        ScreenSpaceFX
    ) {

        var vegetationSystem;
        var particleSpawner;
        var screenSpaceFX;


        var EffectsAPI = function() {

        };

        EffectsAPI.initEffects = function() {
            vegetationSystem = new VegetationSystem(this);
            particleSpawner = new ParticleSpawner();
            particleSpawner.initParticleSpawner();
            //    screenSpaceFX = new ScreenSpaceFX();
            //    screenSpaceFX.initFilterEffects();

        };

        EffectsAPI.requestParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnParticleEffect(id, pos, vel);
        };

        EffectsAPI.tickEffectSimulation = function(tpf) {
            vegetationSystem.updateVegetationSystem(tpf);
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