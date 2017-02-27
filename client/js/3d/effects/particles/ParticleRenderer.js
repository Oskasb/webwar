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
            this.on = false;
            this.setupRendererMaterial(rendererConfig);
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {
            
            var _this = this;

            this.attributes = {}; 
            
            var materialReady = function(mat) {
                console.log("PARTICLE MATERIAL READY", mat);
                _this.buildMeshBuffer(rendererConfig, mat);               
            };

            var particleMaterialData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == rendererConfig.material_id) {
                        _this.setupBufferAttributes(data[i].attributes, data[i].particles);
                        _this.buildParticleMaterial(rendererConfig, data[i], materialReady);
                        
                        return;
                    }
                }
                console.warn("No material with material_id:", rendererConfig.material_id, data);
            };
            new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };

        ParticleRenderer.prototype.buildParticleMaterial = function(rendererConfig, material_config, readyCB) {
            this.particleMaterial = new ParticleMaterial(rendererConfig.material_options, material_config, readyCB);
        };

        ParticleRenderer.prototype.buildMeshBuffer = function(rendererConfig) {
           this.particleBuffer = new ParticleBuffer(rendererConfig, this.particleMaterial);
           this.particleBuffer.addToScene();
           this.on = true;
        };
        
        ParticleRenderer.prototype.setupBufferAttributes = function(attribute_config, count) {
            for (var i = 0; i < attribute_config.length; i++) {
                var dimensions = attribute_config.dimensions;
                this.attributes[attribute_config.name] = new THREE.InstancedBufferAttribute(new Float32Array(count * dimensions), dimensions, 1);
            }
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