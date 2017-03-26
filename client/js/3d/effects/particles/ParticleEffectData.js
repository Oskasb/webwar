

"use strict";

define(['PipelineObject'],
    function(PipelineObject) {

        var sprites = {};
        var effect = {};
        var particles = {};
        var simulations = {};

        var cacheSprites = function(src, data) {
            sprites[src] = {};
            for (var i = 0; i < data.length; i++) {
                sprites[src][data[i].id] = data[i];
            }
        };

        var cacheEffects = function(src, data) {

            if (!effect[src]) {
                effect[src] = {};
            }

            for (var i = 0; i < data.length; i++) {
                effect[src][data[i].id] = data[i].data;
            }
        };
        
        var cacheParticles = function(src, data) {
            particles[src] = {};
            for (var i = 0; i < data.length; i++) {
                particles[src][data[i].id] = data[i];
            }
        };

        var cacheSimulations = function(src, data) {
            simulations[src] = {};
            for (var i = 0; i < data.length; i++) {
                simulations[src][data[i].id] = data[i];
            }
        };

        var ParticleEffectData = function() {

        };

        ParticleEffectData.prototype.loadEffectData = function() {
            new PipelineObject("PARTICLE_SPRITES", "ATLAS", cacheSprites);
            new PipelineObject("PARTICLE_SPRITES", "FONT",  cacheSprites);
            new PipelineObject("PARTICLE_EFFECTS", "THREE", cacheEffects);
            new PipelineObject("VEGETATION_EFFECTS", "THREE", cacheEffects);
            new PipelineObject("PARTICLE_SIMULATIONS", "THREE", cacheSimulations);
            new PipelineObject("PARTICLES",        "THREE", cacheParticles);
            
        };

        ParticleEffectData.prototype.fetchEffect = function(key, id) {
            return effect[key][id];
        };

        ParticleEffectData.prototype.fetchParticle = function(system_key, id) {
            return particles[system_key][id];
        };

        ParticleEffectData.prototype.fetchSprite = function(system_key, id) {
            return sprites[system_key][id];
        };

        ParticleEffectData.prototype.fetchSimulation = function(system_key, id) {
            return simulations[system_key][id];
        };

        ParticleEffectData.prototype.buildEffect = function(store, key, id) {
            store.effect = this.fetchEffect(key, id);
            store.simulation = this.fetchSimulation(store.effect.system_key, store.effect.simulation_id);
            store.particle = this.fetchParticle(store.effect.system_key,store.effect.particle_id);
            store.sprite = this.fetchSprite(store.particle.sprite_key,store.particle.sprite_id);
            return store;
        };

        return ParticleEffectData;

    });