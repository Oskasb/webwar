

"use strict";

define([],
    function() {
        
        var shortPuff = function(time, tpf, particle) {
              
        };

        var bigSpin = function(time, tpf, particle) {
            var i = particle.particleIndex;

            particle.age += tpf;
            
            particle.setAttribute3D('translate',
                100 * ( 1 + Math.sin( 0.1 * i + time )),
                100 * ( 1 + Math.cos( 0.1 * i + time )),
                20 * ( 1 + Math.cos( 0.1 * i + time*0.7 )));

            particle.setAttribute1D('size',  1 + Math.sin( 0.01 * i + time )*100 );

            particle.setAttribute3D('customColor',
                Math.cos(time*0.01 + i*0.2) * ( 0.5 + Math.sin(i + 0.01 * i + time*0.01 )),
                Math.sin(time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + time*0.01 )),
                Math.sin(time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + time*0.022 ))
            );
        };
        
        var simulators = {
            short_puff:shortPuff,
            big_spin:bigSpin
        };
        
        var ParticleEffect = function() {
            this.effectData = {};
            this.renderer = null;
            this.aliveParticles = [];
            this.pos = new THREE.Vector3();
        };

        ParticleEffect.prototype.updateEffectData = function(effectData) {
            
            this.effectData = effectData;
            this.simulator = simulators[effectData.effect.simulation.process];
        };

        ParticleEffect.prototype.applyRenderer = function(renderer) {
            this.renderer = renderer;
            this.age = 0;
            
            var idealCount = this.effectData.effect.count;
            
            var allowedCount = renderer.calculateAllowance(idealCount); 
            
            for (var i = 0; i < allowedCount; i++) {
                var particle = renderer.requestParticle();
                particle.setAttribute3D('translation', this.pos.x, this.pos.y, this.pos.z);
                this.aliveParticles.push(particle);
                
            }
            
        };

        ParticleEffect.prototype.setEffectPosition = function(x, y, z) {
            this.pos.x = x;
            this.pos.y = y;
            this.pos.z = z;
        };

        ParticleEffect.prototype.updateEffect = function(tpf) {
            this.age += tpf;
            
            for (var i = 0; i < this.aliveParticles.length; i++) {
                if (this.aliveParticles[i].dead) {
                    this.renderer.particles.join(this.aliveParticles.splice(i, 1));
                    i--;
                } else {
                    simulators[this.effectData.effect.simulation.process](this.age, tpf, this.aliveParticles[i]);
                    if (this.aliveParticles[i].age > this.effectData.effect.duration) {
                        this.aliveParticles[i].dead = true;
                    }
                }
            }
        };

  

        return ParticleEffect;

    });