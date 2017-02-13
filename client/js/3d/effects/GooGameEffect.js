"use strict";


define([
        '3d/GooEntityFactory',
        'Events'
    ],
    function(
        GooEntityFactory,
        evt
    ) {

        var GooGameEffect = function() {
            this.started = false;
            this.callbacks = {};
            this.particles = [];
        };

        GooGameEffect.prototype.attachGameEffect = function(spatial, game_effect, particleUpdate) {

            this.onEnabledUpdate = particleUpdate;
            
            this.spatial = spatial;
            this.game_effect = game_effect;

            var onParticleDead = function(particle) {
                this.particles.splice(this.particles.indexOf(particle), 1);
            }.bind(this);

            var onParticleAdded = function(particle) {
                this.particles.push(particle);
            }.bind(this);

                this.callbacks.particleUpdate = particleUpdate;
                this.callbacks.onParticleAdded = onParticleAdded;
                this.callbacks.onParticleDead = onParticleDead;
        };

        GooGameEffect.prototype.startGooEffect = function() {
            this.started = true;
            this.paused = false;
            this.callbacks.particleUpdate = this.onEnabledUpdate;
            evt.fire(evt.list().GAME_EFFECT, {effect:this.game_effect, pos:this.spatial.pos, vel:this.spatial.vel, callbacks:this.callbacks});
        };

        GooGameEffect.prototype.setEffectIntensity = function(intensity) {

        };

        GooGameEffect.prototype.unpauseGooEffect = function() {
            this.startEffect();
        };

        GooGameEffect.prototype.pauseGooEffect = function() {
            this.paused = true;
            this.removeGooEffect();
        };

        GooGameEffect.prototype.removeGooEffect = function() {
            this.callbacks.particleUpdate = null;

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].lifeSpan = 0.4;
                this.particles[i].lifeSpanTotal = 0.4
            }
        };


        return GooGameEffect;

    });