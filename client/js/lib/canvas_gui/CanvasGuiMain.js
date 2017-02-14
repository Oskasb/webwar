"use strict";

define([
	'gui/GuiConfigLoader',
	'gui/CanvasGuiState',
	'gui/CanvasCalls',
	'gui/GuiBusSends',
	'gui/io/InputState',
	'gui/io/PointerCursor',
	'gui/io/GameScreen'
],
	function(
		GuiConfigLoader,
		CanvasGuiState,
		CanvasCalls,
		GuiBusSends,
		InputState,
		PointerCursor,
		GameScreen
		) {


		var CanvasGuiMain = function() {
		//	GameScreen.registerAppContainer(parentDiv);
		//	this.inputState = new InputState();
		//	this.pointerCursor = new PointerCursor(this.inputState);
		//	this.guiConfigLoader = new GuiConfigLoader();
		};

		CanvasGuiMain.prototype.loadMasterConfig = function(masterUrl, ok, fail) {
			this.guiConfigLoader.initConfigs(masterUrl, ok, fail);
		};

		CanvasGuiMain.prototype.initGuiMain = function(callbackMap, uiResolution, canvasGuiConfig) {
			this.canvasCalls = new CanvasCalls(uiResolution, callbackMap, canvasGuiConfig);
			this.canvasGuiState = new CanvasGuiState(this.canvasCalls, this.pointerCursor);
			var reset = function() {
				this.canvasGuiState.rebuildGuiLayers();
			}.bind(this);
			this.canvasCalls.registerResetCallback(reset);
		};

		CanvasGuiMain.prototype.initGui2d = function(parentDiv, callbackMap, uiResolution) {
		//	this.canvasCalls = new CanvasCalls2d(parentDiv, uiResolution, callbackMap);
			this.canvasGuiState = new CanvasGuiState(this.canvasCalls);
			var reset = function() {
				this.canvasGuiState.rebuildGuiLayers();
			}.bind(this);
			this.canvasCalls.registerResetCallback(reset);
		};


		CanvasGuiMain.prototype.setMainUiState = function(state) {
			this.canvasGuiState.loadMainState(state);
		};

		CanvasGuiMain.prototype.addUiSubstateId = function(state) {
			this.canvasGuiState.attachMainStateId(state);
		};

		CanvasGuiMain.prototype.adjustCanvasBlendMode = function(modeValue, callback) {
			this.canvasCalls.canvasGui3d.applyBlendModeSelection(modeValue, callback);
		};
		
		CanvasGuiMain.prototype.setCanvas3dCoords = function(x, y) {
		//	this.canvasCalls.canvasGui3d.setElementPos(x, y);
			this.canvasCalls.canvasGuiThree.setElementPos(x, y);

		};

		CanvasGuiMain.prototype.tickGuiMain = function(tpf) {
	//		this.inputState.initFrameSample();
			this.canvasGuiState.updateGuySystems(tpf, this.inputState);
	//		this.inputState.updateInputState(tpf, this.pointerCursor);
	//		this.canvasGuiState.drawLayers(tpf)
            this.canvasCalls.updateCanvasCalls(tpf);
		};

		CanvasGuiMain.prototype.addGuiStateTransitionCallback = function(transitionId, callback) {
			this.pointerCursor.addGuiStateTransitionCallback(transitionId, callback)
		};

        
		CanvasGuiMain.prototype.setGuiAttenuationRgba = function(rgba) {
			this.canvasCalls.setAttenuateColor(rgba);
		};
		

		CanvasGuiMain.prototype.setGuiTextureResolution = function(res) {
			this.canvasCalls.applyTextureResolution(res);
		};

		CanvasGuiMain.prototype.setGuiTextureScale = function(txScale) {
			this.canvasCalls.applyTextureScale(txScale);
		};
        
        CanvasGuiMain.prototype.toggleEnabled = function(bool) {
            this.canvasCalls.toggleGui(bool);
        };

        CanvasGuiMain.prototype.removeGuiMain = function() {
            this.canvasCalls.removeGuiElements();
        };

		return CanvasGuiMain;

});