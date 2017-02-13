define([
	'goo/math/Vector3'
],
function (
	Vector3
) {
	'use strict';

	/**
	 * Result container for the {@link PhysicsSystem} and {@link AmmoPhysicsSystem}.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.normal]
	 * @param {Vector3} [settings.point]
	 * @param {Entity} [settings.entity]
	 */
	function RaycastResult(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.point = settings.point ? new Vector3(settings.point) : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.normal = settings.normal ? new Vector3(settings.normal) : new Vector3();

		/**
		 * @type {Entity}
		 */
		this.entity = settings.entity || null;
	}

	RaycastResult.prototype.reset = function () {
		this.entity = null;
	};

	return RaycastResult;
});