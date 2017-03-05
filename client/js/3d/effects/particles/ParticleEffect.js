

"use strict";

define(['3d/effects/particles/EffectSimulators',
        '3d/effects/particles/ParticleParamParser'],
    function(EffectSimulators,
             ParticleParamParser
    ) {


        var ParticleEffect = function() {
            this.lastTpf = 0.016;
            this.effectDuration = 0;
            this.effectData = {};
            this.renderer = null;
            this.aliveParticles = [];
            this.pos = new THREE.Vector3();
            this.vel = new THREE.Vector3();
            this.deadParticles = [];
        };

        ParticleEffect.prototype.resetParticleEffect = function() {

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

        ParticleEffect.prototype.applyRenderer = function(renderer, systemTime) {
            this.renderer = renderer;
            this.age = 0;
            
            var idealCount = this.effectData.effect.count;
            var allowedCount = renderer.calculateAllowance(idealCount); 

            var maxDuration = 0;

            for (var i = 0; i < allowedCount; i++) {
                var particle = renderer.requestParticle();
                this.includeParticle(particle, systemTime, i, allowedCount);
                this.aliveParticles.push(particle);
                if (particle.params.lifeTime.value > maxDuration) {
                    maxDuration = particle.params.lifeTime.value;
                //    console.log(maxDuration)
                }
            }

            this.effectDuration = maxDuration + this.lastTpf;

        };

        ParticleEffect.prototype.includeParticle = function(particle, systemTime, index, allowedCount) {

            var frameTpfFraction = this.lastTpf*(index/allowedCount);

            if (this.effectData.gpuEffect) {
                ParticleParamParser.applyEffectParams(particle, this.effectData.gpuEffect.init_params);
            } else {
                ParticleParamParser.applyEffectParams(particle, this.effectData.simulation.init_params);
            }


            ParticleParamParser.applyEffectSprite(particle, this.effectData.sprite);
            
            particle.initToSimulation(systemTime+frameTpfFraction, this.pos, this.vel);

            this.updateParticle(particle, frameTpfFraction);

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
            return;
            for (var i = 0; i <  this.simulators[i].length; i++) {
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

        ParticleEffect.prototype.updateEffect = function(tpf, systemTime) {
            this.age += tpf;

            if (this.age > this.effectDuration) {
                for (var i = 0; i < this.aliveParticles.length; i++) {
                    EffectSimulators.dead(this.aliveParticles[i], tpf);
                    this.deadParticles.push(this.aliveParticles[i]);
                }
            } else {

                for (var i = 0; i < this.aliveParticles.length; i++) {
                    if (this.aliveParticles[i].dead) {
                        EffectSimulators.dead(this.aliveParticles[i], tpf);
                        this.deadParticles.push(this.aliveParticles[i]);
                    } else {
                        if (this.aliveParticles[i].params.gpu_sim) {
                            this.updateGpuParticle(this.aliveParticles[i], tpf)
                            if (this.aliveParticles[i].params.lifeTime.value < this.age) {
                                EffectSimulators.dead(this.aliveParticles[i], tpf);
                                this.deadParticles.push(this.aliveParticles[i]);
                            }
                        } else {
                            this.updateParticle(this.aliveParticles[i], tpf);
                        }
                    }
                }
            }

            while (this.deadParticles.length) {
                var dead = this.deadParticles.pop();
                var spliced = this.aliveParticles.splice(this.aliveParticles.indexOf(dead), 1)[0];
                spliced.resetParticle();
                this.renderer.returnParticle(spliced);
            }

            this.lastTpf = tpf;
        };

        return ParticleEffect;
    });