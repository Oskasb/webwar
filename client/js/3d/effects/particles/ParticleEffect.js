

"use strict";

define(['3d/effects/particles/EffectSimulators',
        '3d/effects/particles/ParticleParamParser'],
    function(EffectSimulators,
             ParticleParamParser
    ) {


        var ParticleEffect = function() {
            this.lastTpf = 0.016;
            this.effectData = {};
            this.renderer = null;
            this.aliveParticles = [];
            this.pos = new THREE.Vector3();
            this.vel = new THREE.Vector3();
            this.deadParticles = [];
        };

        ParticleEffect.prototype.setEffectData = function(effectData) {
            this.effectData = effectData;
        };

        ParticleEffect.prototype.setEffectPosition = function(pos) {
            this.pos.x = pos.x;
            this.pos.y = pos.y;
            this.pos.z = pos.z;
        };

        ParticleEffect.prototype.setEffectVelocity = function(vel) {
            this.vel.x = vel.x;
            this.vel.y = vel.y;
            this.vel.z = vel.z;
        };

        ParticleEffect.prototype.attachSimulators = function() {
            var simulation = this.effectData.simulation;

            this.simulators = [];
            for (var i = 0; i < simulation.simulators.length; i++) {
                this.simulators.push(simulation.simulators[i])
            }
        };

        ParticleEffect.prototype.applyRenderer = function(renderer) {
            this.renderer = renderer;
            this.age = 0;
            
            var idealCount = this.effectData.effect.count;
            var allowedCount = renderer.calculateAllowance(idealCount); 
            
            for (var i = 0; i < allowedCount; i++) {
                var particle = renderer.requestParticle();
                this.includeParticle(particle, i, allowedCount);
                this.aliveParticles.push(particle);
            }
        };

        ParticleEffect.prototype.includeParticle = function(particle, index, allowedCount) {

            if (this.effectData.gpuEffect) {
                ParticleParamParser.applyEffectParams(particle, this.effectData.gpuEffect.init_params);
            } else {
                ParticleParamParser.applyEffectParams(particle, this.effectData.simulation.init_params);
            }


            ParticleParamParser.applyEffectSprite(particle, this.effectData.sprite);
            
            particle.initToSimulation(this.pos, this.vel);
            
            this.updateParticle(particle, this.lastTpf*(index/allowedCount));
        };


        ParticleEffect.prototype.updateParticle = function(particle, tpf) {
            for (var i = 0; i < this.simulators.length; i++) {
                EffectSimulators[this.simulators[i].process](
                    particle,
                    tpf,
                    this.simulators[i].source,
                    this.simulators[i].target
                );
            }
        };

        ParticleEffect.prototype.updateGpuParticle = function(particle, tpf) {
            for (var i = 0; i < 4; i++) {
            //    if (this.simulators[i].process == "age" || this.simulators[i].process == "lifeTime" ) {
                    EffectSimulators[this.simulators[i].process](
                        particle,
                        tpf,
                        this.simulators[i].source,
                        this.simulators[i].target
                    );
            //    }
            }
        };

        ParticleEffect.prototype.updateEffect = function(tpf) {
            this.age += tpf;

            for (var i = 0; i < this.aliveParticles.length; i++) {
                if (this.aliveParticles[i].dead) {
                    EffectSimulators.dead(this.aliveParticles[i], tpf);
                    this.deadParticles.push(this.aliveParticles[i]);
                } else {
                    if (this.aliveParticles[i].params.gpu_sim) {
                        this.updateGpuParticle(this.aliveParticles[i], tpf)
                    } else {
                        this.updateParticle(this.aliveParticles[i], tpf);
                    }
                }
            }

            while (this.deadParticles.length) {
                var dead = this.deadParticles.pop();
                var spliced = this.aliveParticles.splice(this.aliveParticles.indexOf(dead), 1)[0];
                this.renderer.particles.push(spliced);
            }

            this.lastTpf = tpf;
        };

        return ParticleEffect;
    });