"use strict";

define([
        'ThreeAPI',
        '3d/effects/particles/ParticleEffectData',
        '3d/effects/particles/ParticleEffect',
        '3d/effects/particles/ParticleRenderer',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        ParticleEffectData,
        ParticleEffect,
        ParticleRenderer,
        PipelineObject
    ) {

        var renderers = {};
        var activeEffects = [];
        var idleEffects = [];

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
        
        
        ParticleSpawner.prototype.spawnParticleEffect = function(id) {
            var effect;
            if (idleEffects.length != 0) {
                effect = idleEffects.pop();
            } else {
                effect = new ParticleEffect()
            }

            effect.setEffectPosition(100*Math.random(), 100*Math.random(), 100*Math.random());
            this.particleEffectData.buildEffect(effect.effectData, 'THREE', id);
            effect.applyRenderer(this.getRendererById(effect.effectData.effect.renderer_id));
            
            
            activeEffects.push(effect);

        };

        ParticleSpawner.prototype.updateSpawnedParticles = function(tpf) {

            if (Math.random() < 0.05) {
                this.spawnParticleEffect('test_effect');
            }

            for (var i = 0; i < activeEffects.length; i++) {

                if (activeEffects[i].aliveParticles.length != 0) {
                //
                //
                    activeEffects[i].updateEffect(tpf);
                } else {
                    // remove it here...
                    idleEffects.join(activeEffects.splice(i, 1));
                    i--;
                }
            }

            for (var key in renderers) {
                renderers[key].updateParticleRenderer(tpf);
            }
            // this.setupParticleRenderers();
        };
        
        return ParticleSpawner;

    });