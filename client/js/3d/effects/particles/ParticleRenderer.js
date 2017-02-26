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
            this.material;
            this.setupRendererMaterial(rendererConfig);
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {

            console.log("PARTICLE setupRendererMaterial", rendererConfig)
            var matOpts = rendererConfig.material_options;

            var _this = this;

            var materialReady = function(mat) {
                _this.material = mat;
                console.log("PARTICLE MATERIAL READY", mat)
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
        
        
        ParticleRenderer.prototype.getRendererMaterial = function() {
            return this.material;
        };

        ParticleRenderer.prototype.spawnParticleEffect = function(effectData, pos, vel) {

        };

        return ParticleRenderer;

    });