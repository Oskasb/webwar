

"use strict";

define(['PipelineObject'],
    function(PipelineObject) {

        var sprites = {};
        var effect = {};
        var particles = {};

        var cacheSprites = function(src, data) {
            sprites[src] = {};
            for (var i = 0; i < data.length; i++) {
                sprites[src][data[i].id] = data[i];
            }
        };

        var cacheEffects = function(src, data) {
            effect[src] = {};
            for (var i = 0; i < data.length; i++) {
                effect[src][data[i].id] = data[i];
            }
        };
        
        var cacheParticles = function(src, data) {
            particles[src] = {};
            for (var i = 0; i < data.length; i++) {
                particles[src][data[i].id] = data[i];
            }
        };
        
        var ParticleEffectData = function() {

        };

        ParticleEffectData.prototype.loadEffectData = function() {
            new PipelineObject("PARTICLE_SPRITES", "ATLAS", cacheSprites);
            new PipelineObject("PARTICLE_SPRITES", "FONT",  cacheSprites);
            new PipelineObject("PARTICLE_EFFECTS", "THREE", cacheEffects);
            new PipelineObject("PARTICLES",        "THREE", cacheParticles);
        };

        ParticleEffectData.prototype.fetchEffect = function(key, id) {
            return effect[key][id];
        };

        ParticleEffectData.prototype.fetchParticle = function(key, id) {
            return particles[key][id];
        };

        ParticleEffectData.prototype.fetchSprite = function(imageId, id) {
            return sprites[imageId][id];
        };
        
        ParticleEffectData.prototype.buildEffect = function(store, key, id) {
            store.effect = this.fetchEffect(key, id);
            store.particle = this.fetchParticle(store.effect.particle_key,store.effect.particle_id);
            store.sprite = this.fetchSprite(store.particle.sprite_key,store.particle.sprite_id);
            return store;
        };

        return ParticleEffectData;

    });