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
        var systemTime = 0;


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
                        console.log("DELETE EXISTING PARTICLE RENDERER", data[i].id);
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




            fxAdds++;
            var effect;
            if (idleEffects.length != 0) {
                effect = idleEffects.shift();
            } else {
                effect = new ParticleEffect();
            }

            effect.setEffectPosition(pos);
            effect.setEffectVelocity(vel);
            effect.setEffectData(this.particleEffectData.buildEffect(effect.effectData, 'THREE', id));

            var renderer = this.getRendererById(effect.effectData.effect.renderer_id);

            if (renderer.particles.length < effect.effectData.effect.count) {
                console.log("Not enough available particles...");
                return;
            }

            EffectDataTranslator.interpretCustomEffectData(effect.effectData, effect.effectData.particle.config);


            effect.attachSimulators();
            effect.applyRenderer(renderer, systemTime);
            
            
            activeEffects.push(effect);

        };

        ParticleSpawner.prototype.updateSpawnedParticles = function(tpf) {

            systemTime += tpf;

            for (var key in renderers) {
                renderers[key].updateParticleRenderer(systemTime);
            }

            while (endedEffects.length) {
                var dead = endedEffects.pop();
                var spliced = activeEffects.splice(activeEffects.indexOf(dead), 1)[0];
                spliced.resetParticleEffect();
                idleEffects.push(spliced);
            }


            
            
            for (var i = 0; i < activeEffects.length; i++) {

                if (activeEffects[i].aliveParticles.length != 0) {
                    activeEffects[i].updateEffect(tpf, systemTime);
                } else {
                    // list for removal here...
                    endedEffects.push(activeEffects[i]);
                }
            }


        };

        
        
        ParticleSpawner.prototype.getTotalParticlePool = function() {
            var poolTotal = 0;
            
            for (var key in renderers) {
                poolTotal += renderers[key].particles.length;
            }

            return poolTotal;
        };

        ParticleSpawner.prototype.getTotalEffectPool = function() {
            return idleEffects.length;
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