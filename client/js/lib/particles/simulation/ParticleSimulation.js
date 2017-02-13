"use strict";

define([
	'particle_system/simulation/SimulationParameters',
	'particle_system/defaults/DefaultSimulationParams'
], function(
	SimulationParameters,
    DefaultSimulationParams
	) {

	var Vector3 = goo.Vector3;
	var Camera = goo.Camera;
	var BoundingSphere = goo.BoundingSphere;
	
	var ParticleSimulation = function() {
		this.resetSimulation();
	};

	ParticleSimulation.prototype.resetSimulation = function() {
		this.renderers = [];
		this.particles = [];
		this.recover = [];
		this.active = false;
        this.onUpdate = null;
		this.callbacks = {};
        this.particleUpdate = null;
		this.onParticleAdded = null;
		this.onParticleDead = null;
	};

	ParticleSimulation.prototype.initSimulation = function(posVec, normVec, defaultSettings, effectData) {
		this.resetSimulation();

		var pos = new Vector3();
		var norm = new Vector3();

		if (isNaN(posVec.x)) {
			pos.setDirect(posVec.data[0], posVec.data[1], posVec.data[2])
		} else {
			pos.set(posVec);
		}

		if (isNaN(normVec.x)) {
			norm.setDirect(normVec.data[0], normVec.data[1], normVec.data[2])
		} else {
			norm.set(normVec);
		}

		this.params = new SimulationParameters(pos, norm, DefaultSimulationParams.particle_params, effectData);
		this.active = true;
	};


    ParticleSimulation.prototype.registerEffectCallbacks = function(callbacks) {
		this.callbacks = callbacks;
		return;
        if (callbacks.onUpdate) {
            this.onUpdate = callbacks.onUpdate;
        }

        if (callbacks.particleUpdate) {
            this.particleUpdate = callbacks.particleUpdate;
        }

		if (callbacks.onParticleAdded) {
			this.onParticleAdded = callbacks.onParticleAdded;
		}

		if (callbacks.onParticleDead) {
			this.onParticleDead = callbacks.onParticleDead;
		}

    };

	ParticleSimulation.prototype.registerParticleRenderer = function(renderer) {
		this.renderers.push(renderer);
	};

	ParticleSimulation.prototype.attachSpawnBehaviour = function(nr, rendererName) {
		this.behaviors[nr] = createSpawner(rendererName);
	};

	ParticleSimulation.prototype.notifyDied = function(particle) {
		particle.reset();
		for (var i = 0; i < this.renderers.length; i++) {
			this.renderers[i].died(particle)
		}
		if (this.callbacks.onParticleDead) {
			this.callbacks.onParticleDead(particle);
		}

		this.recover.push(particle);
	};

	ParticleSimulation.prototype.includeParticle = function(particle, ratio) {
		particle.joinSimulation(this.params, ratio);
		this.particles.push(particle);
		if (this.callbacks.onParticleAdded) {
			this.callbacks.onParticleAdded(particle);
		}
		
	};

    var testBound = new BoundingSphere(new Vector3(0, 0, 0), 30);

	ParticleSimulation.prototype.updateParticle = function(particle, goo, tpf) {

		if (particle.dead) {
			return;
		}

		// Particles need to have a fixed geometry the first frame of their life or things go bonkerz when framerate varies.
		var deduct = tpf;
		if (!particle.frameCount) {
			deduct = 0.016;
		}

		particle.lifeSpan -= deduct;

		if (this.callbacks.particleUpdate) {
			this.callbacks.particleUpdate(particle, deduct);
		} else {
			particle.defaultParticleUpdate(deduct);
		}

		if (particle.lifeSpan < 0 || particle.requestKill) {
			this.notifyDied(particle);
			return;
		}


        var camera = goo.renderSystem.camera;

        if (!camera) return;


		if (isNaN(particle.position.x)) {
			testBound.center.setDirect(particle.position.data[0], particle.position.data[1], particle.position.data[2]);
		} else {
			testBound.center.set(particle.position);
		}


        if (camera.contains(testBound) != Camera.Outside) {
            this.renderParticle(tpf, particle);
        }

	};



	ParticleSimulation.prototype.updateSimParticles = function(goo, tpf) {

        if (this.callbacks.onUpdate) {
			this.callbacks.onUpdate(this);
        }


		for (var i = 0; i < this.particles.length; i++) {
			this.updateParticle(this.particles[i], goo, tpf)
		}

	};

    ParticleSimulation.prototype.renderParticleUpdate = function(renderer, tpf, particle) {
        renderer.updateParticle(tpf, particle)
    };

	ParticleSimulation.prototype.renderParticle = function(tpf, particle) {

		for (var i = 0; i < this.renderers.length; i++) {
		//	if (typeof(this.renderers[i].updateParticle) == 'function') {
            this.renderParticleUpdate(this.renderers[i], tpf, particle);
		//	}
		}

	};

	return ParticleSimulation
})
;