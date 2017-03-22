"use strict";

define([
    'ThreeAPI',
        '3d/effects/particles/ParticleMaterial',
        '3d/effects/particles/ParticleMesh',
        '3d/effects/particles/ParticleBuffer',

        '3d/effects/particles/Particle',
        'PipelineObject'

    ],
    function(
        ThreeAPI,
        ParticleMaterial,
        ParticleMesh,
        ParticleBuffer,
        Particle,
        PipelineObject
    ) {

        var ParticleRenderer = function(rendererConfig) {
            this.id = rendererConfig.id;
            this.setupRendererMaterial(rendererConfig);
        };

        ParticleRenderer.prototype.setupRendererMaterial = function(rendererConfig) {

            this.isRendering = false;

            this.config = rendererConfig;
            this.poolSize = rendererConfig.particle_pool;
            this.particleGeometry = rendererConfig.particle_geometry;
            this.material = {uniforms:{}};
            this.particles = [];
            this.attributes = {};
            this.attributeConfigs = {};
            this.particleMaterial = {};

            var particleMaterialData = function(src, data) {
                this.applyRendererMaterialData(data)
            }.bind(this);

            this.materialPipe = new PipelineObject("PARTICLE_MATERIALS", "THREE", particleMaterialData)
        };

        ParticleRenderer.prototype.setMaterial = function(material) {
            this.material = material;
            this.setupRendererBuffers();
        };

        ParticleRenderer.prototype.applyRendererMaterialData = function(data) {

            var materialReady = function(material) {
                this.setMaterial(material);
            }.bind(this);

                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == this.config.material_id) {
                        this.setupBufferAttributes(data[i].attributes);
                        this.buildParticleMaterial(data[i], materialReady);
                        return;
                    }
                }
        };

        ParticleRenderer.prototype.setupRendererBuffers = function(renderersReady) {
            this.buildMeshBuffer();
            this.attachMaterial();
            this.createParticles();
        };

        ParticleRenderer.prototype.createParticles = function() {
            if (this.particles.length) {
                console.error("Particles already added!")
                this.particles = [];

            }

            for (var i = 0; i < this.poolSize; i++) {
                var particle = new Particle(i);
                for (var key in this.attributeConfigs) {
                    particle.bindAttribute(key, this.attributeConfigs[key].dimensions, this.attributes[key]);
                }
                this.particles.push(particle);
            }
        };

        ParticleRenderer.prototype.buildParticleMaterial = function(material_config, materialReady) {
            this.particleMaterial =  new ParticleMaterial(this.config.material_options, material_config, materialReady);
        };

        ParticleRenderer.prototype.buildMeshBuffer = function() {
            if (this.particleBuffer) {
                this.particleBuffer.dispose();
            }
            var geom = ParticleMesh[this.particleGeometry]();
            this.particleBuffer = new ParticleBuffer(geom.verts, geom.uvs, geom.indices);

            for (var key in this.attributes) {
                this.particleBuffer.geometry.addAttribute( key, this.attributes[key] );
            }

            for (var key in this.particleBuffer.geometry.attributes) {
                this.attributes[key] = this.particleBuffer.geometry.attributes[key];
            }

           this.particleBuffer.addToScene();
        };

        ParticleRenderer.prototype.attachMaterial = function() {
            this.particleBuffer.mesh.material = this.material;
        };

        ParticleRenderer.prototype.setupBufferAttributes = function(attributes_config) {
            for (var i = 0; i < attributes_config.length; i++) {
                var config = attributes_config[i];
                this.attributeConfigs[config.name] = config;
                var dimensions = config.dimensions;
                this.attributes[config.name] = new THREE.InstancedBufferAttribute(new Float32Array(this.poolSize * dimensions), dimensions, 1).setDynamic( config.dynamic );;
            }
        };

        
        ParticleRenderer.prototype.calculateAllowance = function(requestSize) {
            if (this.particles.length > requestSize * 3) {
                return requestSize;
            } else {
                return Math.floor(0.5*this.particles.length);
            }
        };

        ParticleRenderer.prototype.requestParticle = function() {
            var particle = this.particles.shift();
            particle.dead = false;
            return particle;
        };

        ParticleRenderer.prototype.returnParticle = function(particle) {
            this.particles.push(particle);
        };


        ParticleRenderer.prototype.enableParticleRenderer = function() {
            this.isRendering = true;
            this.particleBuffer.addToScene();
        };


        ParticleRenderer.prototype.disableParticleRenderer = function() {
            this.isRendering = false;
            this.particleBuffer.removeFromScene();
        };

        ParticleRenderer.prototype.applyUniformEnvironmentColor = function(uniform, worldProperty) {
            var color = ThreeAPI.readEnvironmentUniform(worldProperty, 'color');
            uniform.value.r = color.r;
            uniform.value.g = color.g;
            uniform.value.b = color.b;
        };


        ParticleRenderer.prototype.updateParticleRenderer = function(systemTime) {

            if (this.material.uniforms.systemTime) {
                this.material.uniforms.systemTime.value = systemTime;
            } else {
                console.log("no uniform yet...")
            }

            if (this.material.uniforms.fogColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.fogColor, 'fog')
            }

            if (this.material.uniforms.fogDensity) {
                this.material.uniforms.fogDensity.value = ThreeAPI.readEnvironmentUniform('fog', 'density');
            }

            if (this.material.uniforms.ambientLightColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.ambientLightColor, 'ambient');
            }

            if (this.material.uniforms.sunLightColor) {
                this.applyUniformEnvironmentColor(this.material.uniforms.sunLightColor, 'sun');
            }

        };

        ParticleRenderer.prototype.dispose = function() {
            this.particles = [];
            this.particleBuffer.dispose();
            this.materialPipe.removePipelineObject();
            delete this;
        };
        
        return ParticleRenderer;

    });