"use strict";

define([
        '3d/effects/water/WaterFX',    
        '3d/effects/vegetation/Vegetation',
        '3d/effects/particles/ParticleSpawner'
    ],
    function(
        WaterFX,
        Vegetation,
        ParticleSpawner
    ) {

        var vegetation;
        var particleSpawner;

        var waterFx;

        var debugVegetation = false;

        var EffectsAPI = function() {

        };

        
        EffectsAPI.initEffects = function(onReady) {
            

            vegetation = new Vegetation(this);
            particleSpawner = new ParticleSpawner();

            var waterReady = function() {
                waterFx.initWaterEffect();
            };

            waterFx = new WaterFX();

            setTimeout(function() {
                waterReady();
            }, 5);

            particleSpawner.initParticleSpawner(onReady);

        };

        EffectsAPI.requestParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnActiveParticleEffect(id, pos, vel);
        };

        EffectsAPI.updateEffectPosition = function(effect, pos, state, tpf) {
            particleSpawner.updateActiveParticleEffect(effect, pos, state, tpf);
        };
        
        EffectsAPI.requestPassiveEffect = function(id, pos, vel, size, quat) {
            return particleSpawner.spawnPassiveEffect(id, pos, vel, size, quat);
        };

        EffectsAPI.returnPassiveEffect = function(effect) {
            return particleSpawner.recoverPassiveEffect(effect);
        };
        
        EffectsAPI.tickEffectSimulation = function(tpf) {
            vegetation.updateVegetation(tpf);
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

        EffectsAPI.setVegetationDebug = function(bool) {
            debugVegetation = bool;
            if (vegetation) vegetation.setDebug(bool);
        };

        EffectsAPI.vegDebug = function() {
            return debugVegetation;
        };
        
        return EffectsAPI;

    });