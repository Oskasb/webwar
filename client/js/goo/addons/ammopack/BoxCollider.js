define([
	'goo/addons/ammopack/Collider',
	'goo/math/Vector3'
],
/** @lends */
function (
	Collider,
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 */
	function BoxCollider(settings) {
		settings = settings || {};

		/**
		 * The half extents of the collider box.
		 * @type {Vector3}
		 */
		this.halfExtents = typeof(settings.halfExtents) !== 'undefined' ? new Vector3(settings.halfExtents) : new Vector3(0.5, 0.5, 0.5);
	}
	BoxCollider.prototype = Object.create(Collider.prototype);
	BoxCollider.constructor = BoxCollider;

	BoxCollider.prototype.serialize = function () {
		return {
			type: 'box',
			halfExtents: Array.prototype.slice.call(this.halfExtents.data, 0)
		};
	};

	return BoxCollider;
});
