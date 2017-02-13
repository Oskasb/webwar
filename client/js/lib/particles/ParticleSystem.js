define([
	'particle_system/simulation/ParticleSimulator'
],

function (
	ParticleSimulator
) {
	"use strict";

	function ParticleSystem(goo) {
		this.particleCount = 0;
		this.materialsCount = 0;
		this.simulatorCount = 0;
		this.simulationsCount = 0;
		this.goo = goo;
		this.atlases = {};
		this.simData = {};
		this.simulators = {};
		this.groups = {};
	}

	ParticleSystem.prototype.addConfiguredAtlasSystems = function (simConfigs, rendererConfigs, atlasConfig, texture) {
		for (var i = 0; i < simConfigs.simulators.length; i++) {
			var simSettings = simConfigs.simulators[i];
			var simulator = new ParticleSimulator(this.goo, simSettings, rendererConfigs, atlasConfig, texture);
			this.simulators[simSettings.id] = simulator;
		}
	};

	ParticleSystem.prototype.spawnParticleSimulation = function(id, position, normal, effectData, callbacks) {
		this.simulators[id].addEffectSimulation(position, normal, effectData, callbacks)
	};

	ParticleSystem.prototype.get = function (id) {
		return this.simulators[id];
	};

	


	ParticleSystem.prototype.getSystemMaterialCount = function (id) {
		return this.materialsCount;
	};


	ParticleSystem.prototype.getParticleSimCount = function (id) {
		return this.simulationsCount;
	};
	
	ParticleSystem.prototype.getParticleTotalCount = function (id) {
		return this.particleCount;
	};

	ParticleSystem.prototype.removeParticleSystemId = function(id) {
		if (this.simulators[id]) {
			this.simulators[id].remove();
			delete this.simulators[id];
		}
	};

	ParticleSystem.prototype.remove = function (id) {

		if (!id) {
			for (var key in this.simulators) {
				this.removeParticleSystemId(key);
			}
		} else {
			this.removeParticleSystemId(id);
		}
	};

	ParticleSystem.prototype.wakeParticle = function(id) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.wakeParticle();
		}
	};

	ParticleSystem.prototype.setVisible = function(id, visible) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.setVisible(visible);
		}
	};

	ParticleSystem.prototype.update = function(tpf) {
		this.particleCount = 0;
		this.simulationsCount = 0;
		this.materialsCount = 0;
		
		for (var simulatorId in this.simulators) {
			var simulator = this.simulators[simulatorId];
			simulator.update(tpf);
			this.particleCount += simulator.totalPool - simulator.availableParticles.length;
			this.simulationsCount += simulator.activeSimulations;
			this.materialsCount += simulator.materialsCount;
		}
		
	};

	return ParticleSystem;
});