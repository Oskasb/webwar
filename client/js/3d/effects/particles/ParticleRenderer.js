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
                this.attributes[config.name] = new THREE.InstancedBufferAttribute(new Float32Array(this.poolSize * dimensions), dimensions, 1);
            }
        };

        ParticleRenderer.prototype.setParticleBufferData = function(index, arrayBuffer, particleAttribute) {
            for (var i = 0; i < particleAttribute.length; i++) {
                arrayBuffer[index + i] = particleAttribute[i];
            }
        };

        ParticleRenderer.prototype.setUpdateBuffers = function() {
           for (var key in this.attributes) {
               this.attributes[key].needsUpdate = true;
           }
        };

        ParticleRenderer.prototype.updateParticleRenderer = function(tpf) {

            if (this.on) {

                var particles = this.particles;

                this.time += tpf;

                for ( var i = 0; i < particles.length; i++ ) {

                    particles[i].setAttribute3D('translate',
                        100 * ( 1 + Math.sin( 0.1 * i + this.time )),
                        100 * ( 1 + Math.cos( 0.1 * i + this.time )),
                        20 * ( 1 + Math.cos( 0.1 * i + this.time*0.7 )));

                    particles[i].setAttribute1D('size',  1 + Math.sin( 0.01 * i + this.time )*100 );

                    particles[i].setAttribute3D('customColor',
                        Math.cos(this.time*0.01 + i*0.2) * ( 0.5 + Math.sin(i + 0.01 * i + this.time*0.01 )),
                        Math.sin(this.time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + this.time*0.01 )),
                        Math.sin(this.time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + this.time*0.022 ))
                    );
                    
                    this.frameActiveParticles++;
                }
            } 

            if (this.frameActiveParticles) {
                this.setUpdateBuffers();
            }
            this.frameActiveParticles = 0;

        };

        ParticleRenderer.prototype.dispose = function() {
            this.particleBuffer.dispose();
            this.materialPipe.removePipelineObject();
            delete this;
        };
        
        return ParticleRenderer;

    });