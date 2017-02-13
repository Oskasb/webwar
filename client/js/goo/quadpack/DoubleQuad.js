define([
	'goo/renderer/MeshData'
],
function (
	MeshData
) {
	'use strict';

	/**
	 * A rectangular, two dimensional shape. The local height of the
	 * DoubleQuad defines it's size about the y-axis, while the width defines
	 * the x-axis. The z-axis will always be 0.<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/quadpack/DoubleQuad/DoubleQuad-vtest.html Working example
	 *
	 * @param {number} [width=1] Total width of quad.
	 * @param {number} [height=1] Total height of quad.
	 * @param {number} [tileX=1] Number of texture repetitions in the texture's x direction.
	 * @param {number} [tileY=1] Number of texture repetitions in the texture's y direction.
	 */
	function DoubleQuad(width, height, tileX, tileY) {
		if (arguments.length === 1 && arguments[0] instanceof Object) {
			var props = arguments[0];
			width = props.width;
			height = props.height;
			tileX = props.tileX;
			tileY = props.tileY;
		}

		/** Half-extent along the local x axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.xExtent = width !== undefined ? width * 0.5 : 0.5;

		/** Half-extent along the local y axis.
		 * @type {number}
		 * @default 0.5
		 */
		this.yExtent = height !== undefined ? height * 0.5 : 0.5;

		/** Number of texture repetitions in the texture's x direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileX = tileX || 1;

		/** Number of texture repetitions in the texture's y direction.
		 * @type {number}
		 * @default 1
		 */
		this.tileY = tileY || 1;

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION,
			MeshData.NORMAL,
			MeshData.TEXCOORD0
		]);
		MeshData.call(this, attributeMap, 8, 12);

		this.rebuild();
	}

	DoubleQuad.prototype = Object.create(MeshData.prototype);
	DoubleQuad.prototype.constructor = DoubleQuad;

	/**
	 * Builds or rebuilds the mesh data.
	 * @returns {DoubleQuad} Self for chaining.
	 */
	DoubleQuad.prototype.rebuild = function () {
		var xExtent = this.xExtent;
		var yExtent = this.yExtent;
		var tileX = this.tileX;
		var tileY = this.tileY;

		this.getAttributeBuffer(MeshData.POSITION).set([
			-xExtent, -yExtent, 0,   -xExtent, yExtent, 0,   xExtent, yExtent, 0,   xExtent, -yExtent, 0,
			-xExtent, -yExtent, 0,   -xExtent, yExtent, 0,   xExtent, yExtent, 0,   xExtent, -yExtent, 0
		]);
		this.getAttributeBuffer(MeshData.NORMAL).set([
			0, 0,  1,   0, 0,  1,   0, 0,  1,   0, 0,  1,
			0, 0, -1,   0, 0, -1,   0, 0, -1,   0, 0, -1
		]);
		this.getAttributeBuffer(MeshData.TEXCOORD0).set([
			0, 0,   0, tileY,   tileX, tileY,   tileX, 0,
			0, 0,   0, tileY,   tileX, tileY,   tileX, 0
		]);

		this.getIndexBuffer().set([
			0, 3, 1,   1, 3, 2,
			7, 4, 5,   7, 5, 6
		]);

		return this;
	};

	return DoubleQuad;
});