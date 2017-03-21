"use strict";

define([
        '3d/effects/water/WaterFX',    
    '3d/effects/vegetation/Vegetation',
        '3d/effects/particles/ParticleSpawner',
        '3d/effects/filters/ScreenSpaceFX'
    ],
    function(
        WaterFX,
        Vegetation,
        ParticleSpawner,
        ScreenSpaceFX
    ) {

        var vegetation;
        var particleSpawner;
        var screenSpaceFX;
        var waterFx;

        var debugVegetation = false;

        var EffectsAPI = function() {

        };

        EffectsAPI.initEffects = function() {
            vegetation = new Vegetation(this);
            particleSpawner = new ParticleSpawner();
            waterFx = new WaterFX();
            particleSpawner.initParticleSpawner();
            waterFx.initWaterEffect();
            //    screenSpaceFX = new ScreenSpaceFX();
            //    screenSpaceFX.initFilterEffects();

        };

        EffectsAPI.requestParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnActiveParticleEffect(id, pos, vel);
        };

        EffectsAPI.requestPassiveEffect = function(id, pos, vel) {
            return particleSpawner.spawnPassiveEffect(id, pos, vel);
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