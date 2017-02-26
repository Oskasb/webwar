"use strict";

define([
        '3d/effects/particles/SPEGroup',
        '3d/effects/particles/ParticleMaterial',
        'PipelineObject'
    ],
    function(
        SPEGroup,
        ParticleMaterial,
        PipelineObject
    ) {
        

        var ParticleRenderer = function(rendererConfig) {
            this.id = rendererConfig.id;
            this.materialId = rendererConfig.material_id;
            this.material = {};
            this.setupRendererMaterial(rendererConfig);
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {

            var material = this.material;
            var matOpts = rendererConfig.material_options;

            var particleMaterialData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == rendererConfig.material_id) {
                        material[data[i].id] = new ParticleMaterial(matOpts, data[i])
                    };
                }
                console.warn("No material with material_id:", rendererConfig.material_id);
            };

            new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };
        
        
        ParticleRenderer.prototype.getRendererMaterial = function() {
            return this.material[this.materialId];
        };

        ParticleRenderer.prototype.spawnParticleEffect = function(effectData, pos, vel) {


        };

        return ParticleRenderer;

    });