

"use strict";

define(['3d/effects/particles/EffectSimulators',
        '3d/effects/particles/ParticleParamParser'],
    function(EffectSimulators,
             ParticleParamParser
    ) {

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



        ParticleEffect.prototype.includeParticle = function(particle, index, allowedCount) {

            particle.setPosition(this.pos);
            particle.setVelocity(this.vel);

            var init_params = this.effectData.effect.init_params;

            ParticleParamParser.applyEffectParams(particle, init_params);
            ParticleParamParser.applyEffectSprite(particle, this.effectData.sprite);
            
            
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