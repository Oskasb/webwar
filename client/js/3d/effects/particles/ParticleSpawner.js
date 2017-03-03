"use strict";

define([
        'ThreeAPI',
        '3d/effects/particles/ParticleEffectData',
        '3d/effects/particles/ParticleEffect',
        '3d/effects/particles/EffectDataTranslator',
        '3d/effects/particles/ParticleRenderer',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        ParticleEffectData,
        ParticleEffect,
        EffectDataTranslator,
        ParticleRenderer,
        PipelineObject
    ) {

        var renderers = {};
        var activeEffects = [];
        var idleEffects = [];
        var endedEffects = [];
        var fxAdds = 0;


        var ParticleSpawner = function() {
            this.particleEffectData = new ParticleEffectData();
            this.particleEffectData.loadEffectData();
        };

        ParticleSpawner.prototype.initParticleSpawner = function() {

            this.setupParticleRenderers();

        };

        ParticleSpawner.prototype.setupParticleRenderers = function() {
            
            var renderersData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    console.log("SETUP PARTICLE RENDERER", src, data[i]);
                    if (renderers[data[i].id]) {
                        renderers[data[i].id].dispose();
                        delete renderers[data[i].id];
                    }
                    renderers[data[i].id] = new ParticleRenderer(data[i]);
                }
            };
            
            new PipelineObject("PARTICLE_SYSTEMS", "RENDERERS", renderersData);
        };

        ParticleSpawner.prototype.getRendererById = function(id) {

            return renderers[id];

        };
        
        
        ParticleSpawner.prototype.spawnParticleEffect = function(id, pos, vel) {
            fxAdds++
            var effect;
            if (idleEffects.length != 0) {
                effect = idleEffects.pop();
            } else {
                effect = new ParticleEffect();
            }

            effect.setEffectPosition(pos);
            effect.setEffectVelocity(vel);
            effect.setEffectData(this.particleEffectData.buildEffect(effect.effectData, 'THREE', id));
            
            EffectDataTranslator.interpretCustomEffectData(effect.effectData, effect.effectData.particle.config);
            
            effect.attachSimulators();
            effect.applyRenderer(this.getRendererById(effect.effectData.effect.renderer_id));
            
            
            activeEffects.push(effect);

        };

        ParticleSpawner.prototype.updateSpawnedParticles = function(tpf) {
            

            for (var i = 0; i < activeEffects.length; i++) {

                if (activeEffects[i].aliveParticles.length != 0) {
                    activeEffects[i].updateEffect(tpf);
                } else {
                    // list for removal here...
                    endedEffects.push(activeEffects[i]);
                }
            }

            while (endedEffects.length) {
                idleEffects.push(activeEffects.splice(activeEffects.indexOf(endedEffects.pop()), 1).pop());
            }
        };

        
        
        ParticleSpawner.prototype.getTotalParticlePool = function() {
            var poolTotal = 0;
            
            for (var key in renderers) {
                poolTotal += renderers[key].particles.length;
            }

            for (var i = 0; i < activeEffects.length; i++) {
                poolTotal += activeEffects[i].aliveParticles.length + activeEffects[i].deadParticles.length;
            }

            for  (var i = 0; i < idleEffects.length; i++) {
                poolTotal += idleEffects[i].aliveParticles.length + idleEffects[i].deadParticles.length;
            }
            return poolTotal;
        };

        ParticleSpawner.prototype.getTotalEffectPool = function() {
            return activeEffects.length + idleEffects.length;
        };

        var activeRenderes = 0;
        
        ParticleSpawner.prototype.getActiveRendererCount = function() {
            return activeRenderes;
        };
        
        ParticleSpawner.prototype.getActiveEffectsCount = function() {
            return activeEffects.length;
        };

        ParticleSpawner.prototype.getActiveParticlesCount = function() {

            var count = 0;
            activeRenderes = 0;
     
            for (var i = 0; i < activeEffects.length; i++) {
                count += activeEffects[i].aliveParticles.length;
            };
            
            
            for (var key in renderers) {
                var activeParticles = renderers[key].poolSize - renderers[key].particles.length;
                if (activeParticles) {
                    activeRenderes++;
                }
            }
            return count;
        };

        ParticleSpawner.prototype.getEffectActivationCount = function() {
            var adds = fxAdds;
            fxAdds = 0;
            return adds;
        };
        
        return ParticleSpawner;

    });