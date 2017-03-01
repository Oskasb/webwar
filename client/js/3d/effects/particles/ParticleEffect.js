

"use strict";

define(['3d/effects/particles/EffectSimulators'],
    function(EffectSimulators) {

        var calcVec = new THREE.Vector3();
        
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
            this.pos.copy(pos);
        };

        ParticleEffect.prototype.setEffectVelocity = function(vel) {
            this.vel.copy(vel);
        };

        ParticleEffect.prototype.attachSimulators = function() {
            var effect = this.effectData.effect;

            this.simulators = [];
            for (var i = 0; i < effect.simulators.length; i++) {
                this.simulators.push(effect.simulators[i])
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

        function createCurveParam(curveId, amplitude, min, max) {
            return new MATH.CurveState(MATH.curves[curveId], amplitude+MATH.randomBetween(min, max));
        }

        ParticleEffect.prototype.applyParamToParticle = function(particle, init_params) {
            if (init_params.value) {
                particle.params[init_params.param] = {};
                particle.params[init_params.param].value = MATH.randomBetween(init_params.value.min, init_params.value.max);
            }
            if (init_params.vec3) {
                if (!particle.params[init_params.param]) {
                    particle.params[init_params.param] = new THREE.Vector3();
                }
                calcVec.x = init_params.vec3.x + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
                calcVec.y = init_params.vec3.y + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
                calcVec.z = init_params.vec3.z + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
                particle.params[init_params.param].addVectors(particle.params[init_params.param], calcVec);
            }

            if (init_params.curve3D) {
                particle.params[init_params.param] = [];

                for (var i = 0; i < init_params.curve3D.length; i++) {
                    particle.params[init_params.param][i] = createCurveParam(init_params.curve3D[i], init_params.amplitudes[i], init_params.spread.min, init_params.spread.max)
                }
            }

            if (init_params.curve1D) {
                particle.params[init_params.param] = createCurveParam(init_params.curve1D, init_params.amplitude, init_params.spread.min, init_params.spread.max)
            }
            
        };

        ParticleEffect.prototype.includeParticle = function(particle, index, allowedCount) {

            particle.setPosition(this.pos);
            particle.setVelocity(this.vel);

            var init_params = this.effectData.effect.init_params;

            for (var i = 0;i < init_params.length; i++) {
                this.applyParamToParticle(particle, init_params[i])
            }
            
            this.updateParticle(particle, this.lastTpf*(index/allowedCount));
        };


        ParticleEffect.prototype.updateParticle = function(particle, tpf) {
            for (var i = 0; i < this.simulators.length; i++) {
                EffectSimulators[this.simulators[i].process](particle, tpf, this.simulators[i].source, this.simulators[i].target);
            }
        };        
        
                
        ParticleEffect.prototype.updateEffect = function(tpf) {
            this.age += tpf;

            for (var i = 0; i < this.aliveParticles.length; i++) {
                if (this.aliveParticles[i].dead) {
                    EffectSimulators.dead(this.aliveParticles[i], tpf);
                    this.deadParticles.push(this.aliveParticles[i]);
                } else {
                    this.updateParticle(this.aliveParticles[i], tpf);
                }
            }

            while (this.deadParticles.length) {
                this.renderer.particles.push(this.aliveParticles.splice(this.aliveParticles.indexOf(this.deadParticles.pop()), 1).pop());
            }

            this.lastTpf = tpf;
        };

        return ParticleEffect;
    });