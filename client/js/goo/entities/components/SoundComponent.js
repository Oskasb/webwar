define([
	'goo/entities/components/Component',
	'goo/sound/AudioContext',
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function (
	Component,
	AudioContext,
	Vector3,
	MathUtils
) {
	'use strict';

	//! AT: every method here is prefixed with a check for AudioContext. Is it really needed? can it just be refactored away?
	//Or, isn't just one (the first) warning enough - it might ruing everything if flooding the console

	/**
	 * Component that adds sound to an entity.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Sound/Sound-vtest.html Working example
	 * @extends {Component}
	 */
	function SoundComponent() {
		Component.apply(this, arguments);

		this.type = 'SoundComponent';

		/**
		 * Current sounds in the entity. Add a sound using {@link SoundComponent#addSound}.
		 * @type {Array<Sound>}
		 */
		this.sounds = [];
		this._isPanned = true;
		this._outDryNode = AudioContext.getContext().createGain();
		this._outWetNode = AudioContext.getContext().createGain();
		this.connectTo();
		this._pannerNode = AudioContext.getContext().createPanner();

		this._pannerNode.connect(this._outDryNode);
		this._inNode = AudioContext.getContext().createGain();
		this._inNode.connect(this._pannerNode);
		this._oldPosition = new Vector3();
		this._position = new Vector3();
		this._orientation = new Vector3();
		this._velocity = new Vector3();
		this._attachedToCamera = false;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	SoundComponent.type = 'SoundComponent';

	SoundComponent.prototype = Object.create(Component.prototype);
	SoundComponent.prototype.constructor = SoundComponent;

	/**
	 * Add a sound to the component
	 * @param {Sound} sound
	 */
	SoundComponent.prototype.addSound = function (sound) {
		if (this.sounds.indexOf(sound) === -1) {
			sound.connectTo([this._inNode, this._outWetNode]);
			this.sounds.push(sound);
		}
	};

	/**
	 * Remove sound from component
	 * @param {Sound} sound
	 */
	SoundComponent.prototype.removeSound = function (sound) {
		var idx = this.sounds.indexOf(sound);
		if (idx > -1) {
			sound.stop();
			this.sounds.splice(idx, 1);
			sound.connectTo();
		}
	};

	/**
	 * Get a component's sound by id
	 * @param {string} id
	 * @returns {Sound}
	 */
	SoundComponent.prototype.getSoundById = function (id) {
		for (var i = 0; i < this.sounds.length; i++) {
			if (this.sounds[i].id === id) {
				return this.sounds[i];
			}
		}
	};

	/**
	 * Connect output of component to audionodes
	 * @param {object} [nodes]
	 * @param {AudioNode} [nodes.dry]
	 * @param {AudioNode} [nodes.wet]
	 */
	SoundComponent.prototype.connectTo = function (nodes) {
		this._outDryNode.disconnect();
		this._outWetNode.disconnect();
		if (nodes && nodes.dry) {
			this._outDryNode.connect(nodes.dry);
		}
		if (nodes && nodes.wet) {
			this._outWetNode.connect(nodes.wet);
		}
	};

	/**
	 * Updates the component valueas according to config
	 * @param {object} [config]
	 * @param {number} config.volume
	 * @param {number} config.reverb
	 */
	SoundComponent.prototype.updateConfig = function (config) {
		if (config.volume !== undefined) {
			this._outDryNode.gain.value = MathUtils.clamp(config.volume, 0, 1);
		}
		if (config.reverb !== undefined) {
			this._outWetNode.gain.value = MathUtils.clamp(config.reverb, 0, 1);
		}
	};

	/**
	 * Updates position, velocity and orientation of component and thereby all connected sounds.
	 * Since all sounds in the engine are relative to the current camera, the model view matrix needs to be passed to this method.
	 * @param {object} settings See {@link SoundSystem}
	 * @param {Matrix4x4} mvMat The model view matrix from the current camera, or falsy if the component is attached to the camera.
	 * @param {number} tpf
	 * @hidden
	 */
	SoundComponent.prototype.process = function (settings, mvMat, tpf) {
		this._pannerNode.rolloffFactor = settings.rolloffFactor;
		this._pannerNode.maxDistance = settings.maxDistance;

		if (this._attachedToCamera || !mvMat) {
			// The component is attached to the current camera.
			if (this._isPanned) {
				this._inNode.disconnect();
				this._inNode.connect(this._outDryNode);
				this._isPanned = false;
			}
			this._pannerNode.setPosition(0, 0, 0);
			this._pannerNode.setVelocity(0, 0, 0);
			this._pannerNode.setOrientation(0, 0, 0);
			return;
		} else if (!this._isPanned) {
			this._inNode.disconnect();
			this._inNode.connect(this._pannerNode);
			this._isPanned = true;
		}

		mvMat.getTranslation(this._position);
		this._velocity.setVector(this._position).subVector(this._oldPosition).div(tpf);
		this._oldPosition.setVector(this._position);
		this._orientation.setDirect(0, 0, -1);
		mvMat.applyPostVector(this._orientation);

		var pd = this._position.data;
		this._pannerNode.setPosition(pd[0], pd[1], pd[2]);
		var vd = this._velocity.data;
		this._pannerNode.setVelocity(vd[0], vd[1], vd[2]);
		var od = this._orientation.data;
		this._pannerNode.setOrientation(od[0], od[1], od[2]);
	};

	return SoundComponent;
});