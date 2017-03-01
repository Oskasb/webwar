"use strict";

define([
        '3d/effects/particles/ParticleMaterial',
        '3d/effects/particles/ParticleBuffer',
        '3d/effects/particles/Particle',
        'PipelineObject'
    ],
    function(
        ParticleMaterial,
        ParticleBuffer,
        Particle,
        PipelineObject
    ) {

        var ParticleRenderer = function(rendererConfig) {
            this.time = 0;
            this.id = rendererConfig.id;
            this.on = false;
            this.setupRendererMaterial(rendererConfig);
            this.frameActiveParticles = 0;
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {

            var config = rendererConfig;
            this.poolSize = config.particlePool;
            this.particles = [];
            this.attributes = {};
            this.attributeConfigs = {};
            this.particleMaterial = {};

            var setupBuffers = function() {
                this.buildMeshBuffer(config);
                this.attachMaterial();
                this.createParticles();
            }.bind(this);


            var particleMaterialData = function(src, data) {

                var materialReady = function() {
                    setupBuffers()
                };

                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == config.material_id) {
                        this.setupBufferAttributes(data[i].attributes);
                        this.buildParticleMaterial(config, data[i], materialReady);
                        return;
                    }
                }
                console.warn("No material with material_id:", config.material_id, data);
            }.bind(this);
            this.materialPipe = new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };
        
        ParticleRenderer.prototype.createParticles = function() {
            for (var i = 0; i < this.poolSize; i++) {
                var particle = new Particle(i);
                for (var key in this.attributeConfigs) {
                    particle.bindAttribute(key, this.attributeConfigs[key].dimensions, this.attributes[key].array);
                }
                this.particles.push(particle);
            }
        };

        ParticleRenderer.prototype.buildParticleMaterial = function(rendererConfig, material_config, readyCB) {
             new ParticleMaterial(rendererConfig.material_options, material_config, this.particleMaterial, readyCB);
        };

        ParticleRenderer.prototype.buildMeshBuffer = function(rendererConfig) {
            if (this.particleBuffer) {
                this.particleBuffer.dispose();
            }
           this.particleBuffer = new ParticleBuffer(rendererConfig, this.particleMaterial);

            for (var key in this.attributes) {
                this.particleBuffer.geometry.addAttribute( key, this.attributes[key] );
            }

            for (var key in this.particleBuffer.geometry.attributes) {
                this.attributes[key] = this.particleBuffer.geometry.attributes[key];
            }

           this.particleBuffer.addToScene();
           this.on = true;
        };

        ParticleRenderer.prototype.attachMaterial = function() {
            this.particleBuffer.mesh.material = this.particleMaterial.material;
        };

        ParticleRenderer.prototype.setupBufferAttributes = function(attributes_config) {
            for (var i = 0; i < attributes_config.length; i++) {
                var config = attributes_config[i];
                this.attributeConfigs[config.name] = config;
                var dimensions = config.dimensions;
                this.attributes[config.name] = new THREE.InstancedBufferAttribute(new Float32Array(this.poolSize * dimensions), dimensions, 1).setDynamic( config.dynamic );;
            }
        };


        ParticleRenderer.prototype.setUpdateBuffers = function() {
           for (var key in this.attributes) {
               this.attributes[key].needsUpdate = true;
           }
        };

        ParticleRenderer.prototype.calculateAllowance = function(requestSize) {
            if (this.particles.length > requestSize * 1.5) {
                return requestSize;
            } else {
                return Math.floor(0.5*this.particles.length);
            }
        };

        ParticleRenderer.prototype.requestParticle = function() {
            var particle = this.particles.pop();
            particle.dead = false;
            return particle;
        };

        ParticleRenderer.prototype.updateParticleRenderer = function(tpf) {
            this.setUpdateBuffers();
        };

        ParticleRenderer.prototype.dispose = function() {
            this.particleBuffer.dispose();
            this.materialPipe.removePipelineObject();
            delete this;
        };
        
        return ParticleRenderer;

    });