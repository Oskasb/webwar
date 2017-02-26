"use strict";

define([
        '3d/effects/particles/SPEGroup',
        '3d/effects/particles/ParticleMaterial',
        '3d/effects/particles/ParticleBuffer',
        'PipelineObject'
    ],
    function(
        SPEGroup,
        ParticleMaterial,
        ParticleBuffer,
        PipelineObject
    ) {

        var ParticleRenderer = function(rendererConfig) {
            this.id = rendererConfig.id;
            this.particleMaterial;
            this.particleBuffer;
            this.on = false;
            this.setupRendererMaterial(rendererConfig);
            
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {

            console.log("PARTICLE setupRendererMaterial", rendererConfig);
            var matOpts = rendererConfig.material_options;

            var _this = this;

            var materialReady = function(mat) {
                _this.particleMaterial = mat;
                console.log("PARTICLE MATERIAL READY", mat);
                _this.buildMeshBuffer(rendererConfig, mat);               
            };

            var particleMaterialData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == rendererConfig.material_id) {
                        new ParticleMaterial(matOpts, data[i], materialReady);
                        return;
                    }
                }
                console.warn("No material with material_id:", rendererConfig.material_id, data);
            };

            new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };

        ParticleRenderer.prototype.buildMeshBuffer = function(rendererConfig, mat) {
            this.particleBuffer = new ParticleBuffer(rendererConfig, mat);
            this.particleBuffer.addToScene();
            this.on = true;
        };
        
        ParticleRenderer.prototype.getRendererMaterial = function() {
            
            
            
        };

        ParticleRenderer.prototype.spawnParticleEffect = function(effectData, pos, vel) {

        };

        ParticleRenderer.prototype.updateParticleRenderer = function(tpf) {
            if (this.on) {
                this.particleBuffer.renderParticleBuffer(tpf);
            }
            
        };
        
        return ParticleRenderer;

    });