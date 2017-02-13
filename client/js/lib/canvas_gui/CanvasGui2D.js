"use strict";

define([
	'data_pipeline/PipelineAPI'

],
	function(

		PipelineAPI
		) {

	    var CanvasGui2D = function(parentDiv, resolution) {
	//		console.log(parentDiv);
			this.parentDiv = parentDiv;

			this.config = {
				resolution:resolution
			};

			this.blendModes = {};
			this.blendSelection = 0;

			this.resolution = resolution;
		    this.size = resolution;
			this.txScale = 1;
			this.aspect = 1;

            this.scalePxToX = 1 / resolution;

            this.aspect = 1;

            this.scalePercentToX = 0.01*resolution;
            this.scalePercentToY = 0.01*resolution;

			this.constructCanvas();

			var configUpdated = function(url, config) {
			//	this.handleConfigUpdate(url, config);
			}.bind(this);

		   PipelineAPI.subscribeToCategoryKey('setup', 'page', configUpdated);

		};

		CanvasGui2D.prototype.constructCanvas = function() {
			this.top = 0;
			this.left = 0;
			this.ctx = this.setupCanvas(this.camera, this.resolution);
		};

		CanvasGui2D.prototype.resolutionUpdated = function() {
			this.canvas.width = this.resolution;
			this.canvas.height = this.resolution;
		};

		CanvasGui2D.prototype.setupCanvas = function(camera, resolution) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = 'canvas_gui_id'+this.parentDiv.id;
			this.canvas.width = resolution;
			this.canvas.height = resolution;
			this.canvas.dataReady = true;
			this.ctx = this.canvas.getContext('2d');

			this.parentDiv.appendChild(this.canvas);

			this.ctx.globalCompositeOperation = 'source-over';
			return this.ctx;
		};

		CanvasGui2D.prototype.updateFrustum = function() {

		};

		CanvasGui2D.prototype.applyBlendModeSelection = function(floatValue, callback) {

		};

		CanvasGui2D.prototype.updateBlendMode = function() {

		};


		CanvasGui2D.prototype.setBlendModeId = function(blendModeId) {

		};

		CanvasGui2D.prototype.setCanvasGuiResolution = function(res) {
				this.resolution = res;
				this.resolutionUpdated();
		};

		CanvasGui2D.prototype.handleConfigUpdate = function(url, config) {
			this.scaleCanvasGuiResolution(this.txScale)
		};

		CanvasGui2D.prototype.updateCanvasGui = function() {

		};

		CanvasGui2D.prototype.applyChanges = function() {

		};

		CanvasGui2D.prototype.onFrustumUpdate = function() {

		};

		return CanvasGui2D

	});