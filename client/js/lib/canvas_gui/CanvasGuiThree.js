"use strict";

define([
		'data_pipeline/PipelineAPI',
	'ThreeAPI',
		'ui/GameScreen'
	],
	function(
		PipelineAPI,
		ThreeAPI,
		GameScreen
	) {
		
		var CanvasGuiThree = function(resolution, canvasGuiConfig) {
			//		console.log(cameraEntity)



			this.guiConfig = {
				element:{
					pos:[0, 0],
					size:[1, 1],
					blendMode:"AdditiveBlending"
				}
			};


			if (canvasGuiConfig) {
				this.guiConfig = canvasGuiConfig;
			}

			this.config = {
				resolution:resolution
			};

			this.blendModes = {};
			this.blendSelection = 0;

			this.resolution = resolution;
			this.size = 1;
			this.txScale = 1;
			this.aspect = 1;
			this.scalePercentToX = 1;
			this.scalePxToX = 1;
			this.scalePercentToY = 1;

			this.materialSettings = {
				blending : 'CustomBlending',
				blendEquation: 'AddEquation',
				blendSrc : 'SrcColorFactor',
				blendDst : 'SrcAlphaFactor'
			};

			this.constructCanvas();
			this.setupParts();

			this.onUpdateCallbacks = [];

			var configUpdated = function(url, config) {
				this.handleConfigUpdate(url, config);
			//	this.setBlendModeId(this.guiConfig.element.blendMode);
			}.bind(this);

			PipelineAPI.subscribeToCategoryKey('setup', 'page', configUpdated);

		};

		CanvasGuiThree.prototype.setupParts = function() {


			this.materialStore = {}

			this.uiQuad = ThreeAPI.loadModel(0.1,0.1,0.1);
			ThreeAPI.buildCanvasObject(this.uiQuad, this.canvas, this.materialStore);
			ThreeAPI.attachObjectToCamera(this.uiQuad);



		//	this.material = this.createCanvasMaterial(ShaderLib.uber);
		};

		CanvasGuiThree.prototype.constructCanvas = function() {
			this.top = 0;
			this.left = 0;
			this.aspectMarginTop = 0;
			this.aspectMarginLeft = 0;
			this.ctx = this.setupCanvas(this.resolution);
		};



		CanvasGuiThree.prototype.resolutionUpdated = function() {
			this.canvas.width = this.resolution;
			this.canvas.height = this.resolution;
			ThreeAPI.buildCanvasObject(this.uiQuad, this.canvas, this.materialStore);
			this.top = 0;
			this.updateFrustum();
		};

		CanvasGuiThree.prototype.setupCanvas = function(resolution) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = 'canvas_gui_id';
			this.canvas.width = resolution;
			this.canvas.height = resolution;
			this.canvas.dataReady = true;
			this.ctx = this.canvas.getContext('2d');
			this.ctx.globalCompositeOperation = 'source-over';
			return this.ctx;
		};

		CanvasGuiThree.prototype.updateFrustum = function() {

			this.top = GameScreen.getHeight();
			this.left = GameScreen.getWidth();
			if (this.top > this.left) {
				this.aspectMarginLeft = this.left * (this.guiConfig.element.pos[1]+this.guiConfig.element.size[1])*0.02;
				this.aspectMarginTop = this.top * (this.guiConfig.element.pos[0]+this.guiConfig.element.size[0])*.02;
				this.size = this.left * this.guiConfig.element.size[1]*2;
				this.scalePxToX =  this.top / this.size;
			} else {
				this.aspectMarginLeft = this.left * (this.guiConfig.element.pos[1]+this.guiConfig.element.size[1])*0.02;
				this.aspectMarginTop = this.top * (this.guiConfig.element.pos[0]+this.guiConfig.element.size[0])*0.02;
				this.size = this.top * this.guiConfig.element.size[0]*2;
				this.scalePxToX = this.left / this.size;
			}

			// (this.aspectMarginLeft*0.1, this.aspectMarginTop*0.1, -2);
			this.aspect = this.left / this.top;
			this.uiQuad.position.set( this.guiConfig.element.pos[0]* this.aspect *0.5, this.guiConfig.element.pos[1]  *0.5,  -1)

			this.uiQuad.scale.set(this.guiConfig.element.size[0], this.guiConfig.element.size[1], 1);
			this.scalePercentToX = 1.01/ (this.size / this.left);
			this.scalePercentToY = 1.01 / (this.size / this.top);

		};

		CanvasGuiThree.prototype.applyBlendModeSelection = function(floatValue, callback) {
			this.blendSelection = floatValue;

			if (!this.config.blending) {
				return;
			}

			var selection = Math.floor(floatValue * this.config.blending.modes.length);
			this.setBlendModeId(this.config.blending.modes[selection].id);

			callback(this.config.blending.modes[selection].data);
		};

		CanvasGuiThree.prototype.setElementPos = function(x, y) {

			this.guiConfig.element.pos[0] = x;
			this.guiConfig.element.pos[1] = -y;

			this.uiQuad.position.x = this.guiConfig.element.pos[0];
			this.uiQuad.position.y = this.guiConfig.element.pos[1];
		};

		CanvasGuiThree.prototype.updateBlendMode = function() {
			return;
			var blendState = this.blendModes[this.blendModeId].blendState;
		//	var uniforms = this.blendModes[this.blendModeId].uniforms;

			this.materialStore.material.blending = blendState;
		};


		CanvasGuiThree.prototype.setBlendModeId = function(blendModeId) {
			this.blendModeId = blendModeId;
			this.updateBlendMode();
		};

		CanvasGuiThree.prototype.setCanvasGuiResolution = function(res) {
			this.resolution = res;
			this.resolutionUpdated();
		};

		CanvasGuiThree.prototype.scaleCanvasGuiResolution = function(scale) {
			this.txScale = scale;
			var targetRes = MATH.nearestHigherPowerOfTwo(this.config.resolution * this.txScale);
			if (targetRes != this.resolution) {
				this.setCanvasGuiResolution(targetRes);
			}
		};

		CanvasGuiThree.prototype.handleConfigUpdate = function(url, config) {
			this.config = config;

			for (var i = 0; i < config.blending.modes.length; i++) {
				this.blendModes[config.blending.modes[i].id] = config.blending.modes[i].data;
			}

		//	this.applyBlendModeSelection(this.blendSelection, function() {});
			this.scaleCanvasGuiResolution(this.txScale)
		};

		CanvasGuiThree.prototype.updateCanvasGui = function() {

			this.uiQuad.position.z = -1;
			this.materialStore.texture.needsUpdate = true;

			if (this.top === GameScreen.getHeight() && this.left === GameScreen.getWidth()) {
			} else {
				this.updateFrustum();
			}
		};


		CanvasGuiThree.prototype.onFrustumUpdate = function() {
			for (var i = 0; i < this.onUpdateCallbacks.length; i++) {
				this.onUpdateCallbacks[i]();
			}
		};

		CanvasGuiThree.prototype.toggle3dGui = function(bool) {
			ThreeAPI.setObjectVisibility(this.uiQuad, bool);
		};


		CanvasGuiThree.prototype.remove3dGuiHost = function() {
			ThreeAPI.removeModel(this.uiQuad);
			this.canvas.removeElement();
		};

		return CanvasGuiThree

	});