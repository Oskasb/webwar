define([
		'application/debug/lines/LineRenderer'
	],
	function (
			  LineRenderer
			  ) {
		'use strict';
		
		var System= {update:function(){}};
	//	var	SystemBus = goo.SystemBus;
		var	Vector3 = THREE.Vector3;
		
		function LineRenderSystem(world) {

			this._lineRenderers = [];
			
			this._lineRenderers.push(new LineRenderer(this.world));
		}

	//	LineRenderSystem.prototype = Object.create(System.prototype);
		LineRenderSystem.prototype.constructor = LineRenderSystem;


        var start = new Vector3();
        var end = new Vector3();
		var tmpVec1 = new Vector3();
		var tmpVec2 = new Vector3();
		var tmpVec3 = new Vector3();

		LineRenderSystem.axis = ['x', 'y', 'z'];

		//setup a preset of colors
		LineRenderSystem.prototype.WHITE = new Vector3(1, 1, 1);
		LineRenderSystem.prototype.GREY = new Vector3(0.5, 0.5, 0.5);
		LineRenderSystem.prototype.PINK = new Vector3(1, 0.6, 0.6);
		LineRenderSystem.prototype.RED = new Vector3(1, 0, 0);

		LineRenderSystem.prototype.PURPLE = new Vector3(1, 0.5, 1);
		LineRenderSystem.prototype.GREEN = new Vector3(0, 1, 0);
		LineRenderSystem.prototype.PEA = new Vector3(0.5, 1, 0.5);

		LineRenderSystem.prototype.BLUE = new Vector3(0, 0, 1);
		LineRenderSystem.prototype.AQUA = new Vector3(0, 1, 1);
		LineRenderSystem.prototype.CYAN = new Vector3(0.5, 1, 1);
		LineRenderSystem.prototype.MAGENTA = new Vector3(1, 0, 1);
		LineRenderSystem.prototype.DARKPURP = new Vector3(0.35, 0, 0.35);
		LineRenderSystem.prototype.YELLOW = new Vector3(1, 1, 0);
		LineRenderSystem.prototype.ORANGE = new Vector3(1, 0.8, 0.3);
		LineRenderSystem.prototype.BLACK = new Vector3(0, 0, 0);


		LineRenderSystem.prototype.drawLine = function (start, end, color) {
			var lineRenderer = this._lineRenderers[0];

			lineRenderer._addLine(start, end, color);
		};
		
		
		LineRenderSystem.prototype._drawAxisLine = function (start, startEndDelta, startDataIndex, endDataIndex, startPolarity, endPolarity, color, transformMatrix) {
			var startAxis = LineRenderSystem.axis[startDataIndex];
			var endAxis = LineRenderSystem.axis[endDataIndex];

			var lineStart = tmpVec2.set(start);
			lineStart[startAxis] += startEndDelta[startAxis] * startPolarity;

			var lineEnd = tmpVec3.set(lineStart);
			lineEnd[endAxis] += startEndDelta[endAxis] * endPolarity;

			if (transformMatrix !== undefined) {
				lineStart.applyPostPoint(transformMatrix);
				lineEnd.applyPostPoint(transformMatrix);
			}

			this.drawLine(lineStart, lineEnd, color);
		};

		/**
		 * Draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix.
		 * @param {Vector3} min
		 * @param {Vector3} max
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {Matrix4} [transformMatrix]
		 */
		LineRenderSystem.prototype.drawAABox = function (min, max, color, transformMatrix) {
			var diff = tmpVec1.set(max).sub(min);

			for (var a = 0; a < 3; a++) {
				for (var b = 0; b < 3; b++) {
					if (b !== a) {
						this._drawAxisLine(min, diff, a, b, 1, 1, color, transformMatrix);
					}
				}

				this._drawAxisLine(max, diff, a, a, -1, 1, color, transformMatrix);
				this._drawAxisLine(min, diff, a, a, 1, -1, color, transformMatrix);
			}
		};

		/**
		 * Draws a cross at a position with the given color and size.
		 * @param {Vector3} position
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {number} [size=0.05]
		 */
		LineRenderSystem.prototype.drawCross = function (position, color, size) {
			size = size || 0.05;

			start.x = position.data[0] - size;
            start.y = position.data[1];
            start.z = position.data[2] - size;
            end.x = position.data[0] + size;
            end.y = position.data[1];
            end.z = position.data[2] + size;

			this.drawLine(start, end, color);

            start.x = position.data[0] + size;
            start.y = position.data[1];
            start.z = position.data[2] - size;
            end.x = position.data[0] - size;
            end.y = position.data[1];
            end.z = position.data[2] + size;

			this.drawLine(start, end, color);

            start.x = position.data[0];
            start.y = position.data[1] - size;
            start.z = position.data[2];
            end.x = position.data[0];
            end.y = position.data[1] + size;
            end.z = position.data[2];

			this.drawLine(start, end, color);
		};

		LineRenderSystem.prototype.render = function () {
			for (var i = 0; i < this._lineRenderers.length; i++) {
				var lineRenderer = this._lineRenderers[i];
				lineRenderer._clear();
			}
		};

        LineRenderSystem.prototype._pause = function () {
            for (var i = 0; i < this._lineRenderers.length; i++) {
                var lineRenderer = this._lineRenderers[i];
                lineRenderer._pause();
            }
        };


        LineRenderSystem.prototype.clear = function () {
			for (var i = 0; i < this._lineRenderers.length; i++) {
				var lineRenderer = this._lineRenderers[i];
				lineRenderer._remove();
			}
			delete this._lineRenderers;
		};


		return LineRenderSystem;
	});