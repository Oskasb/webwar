"use strict";

define([
	'gui/CanvasGuiMain'
],
	function(
		CanvasGuiMain
		) {

		var defaultResolution = 1024;

		var CanvasGuiAPI = function(uiTxResolution) {
			this.canvasGuiMain = new CanvasGuiMain();
			this.uiTxResolution = uiTxResolution || defaultResolution;
		//	this.pointerCursor = this.canvasGuiMain.pointerCursor;
			this.enabled = true;

			this.is2d = false;
			this.is3d = false;
		};

		CanvasGuiAPI.prototype.init3dCanvasGui = function(callbackMap, canvasGuiConfig) {
			this.canvasGuiMain.initGuiMain(callbackMap, this.uiTxResolution, canvasGuiConfig);
			this.is3d = true;
		};

		CanvasGuiAPI.prototype.initDomCanvasGui = function(parentDiv, callbackMap) {
			this.canvasGuiMain.initGui2d(parentDiv, callbackMap, this.uiTxResolution);
			this.is2d = true;
		};
		
		CanvasGuiAPI.prototype.setUiToStateId = function(state) {
			this.canvasGuiMain.setMainUiState(state);
		};

		CanvasGuiAPI.prototype.setElementPosition = function(x, y) {
			this.canvasGuiMain.setCanvas3dCoords(x, y);
		};

		CanvasGuiAPI.prototype.adjustCanvasBlendMode = function(modeValue, callback) {
			this.canvasGuiMain.adjustCanvasBlendMode(modeValue, callback);
		};

		CanvasGuiAPI.prototype.attachUiSubstateId = function(state) {
			this.canvasGuiMain.addUiSubstateId(state);
		};

		CanvasGuiAPI.prototype.updateCanvasGui = function(tpf) {
			if (this.enabled) {
				this.canvasGuiMain.tickGuiMain(tpf)
			}
		};

		CanvasGuiAPI.prototype.getPointerCursor = function() {
			return this.pointerCursor;
		};

		CanvasGuiAPI.prototype.getCanvasContext = function() {
			return this.canvasGuiMain.canvasCalls.ctx;
		};
		
		CanvasGuiAPI.prototype.addGuiStateTransitionCallback = function(transitionId, callback) {
			this.canvasGuiMain.addGuiStateTransitionCallback(transitionId, callback)
		};

		CanvasGuiAPI.prototype.setGuiTextureScale = function(txScale) {
			this.canvasGuiMain.setGuiTextureScale(txScale)
		};

		CanvasGuiAPI.prototype.setGuiTextureResolution = function(res) {
			this.canvasGuiMain.setGuiTextureResolution(res)
		};

		CanvasGuiAPI.prototype.setGuiAttenuationRgba = function(rgba) {
			this.canvasGuiMain.setGuiAttenuationRgba(rgba)
		};
		
		CanvasGuiAPI.prototype.getPointerState = function() {
			return this.getPointerCursor().getPointerState();
		};

		CanvasGuiAPI.prototype.toggleGuiEnabled = function(bool) {
			this.enabled = bool;
			this.canvasGuiMain.toggleEnabled(bool, this.is3d);
		};

		CanvasGuiAPI.prototype.removeCanvasGui = function() {
			this.canvasGuiMain.removeGuiMain()
		};
		
		return CanvasGuiAPI;

	});