"use strict";

define([
	"gui/CanvasGui2D",
	'gui/layout/LayoutEnums',
	'gui/layout/ElementLayout',
	'gui/functions/UiCallbacks',
    'ui/canvas/CanvasDraw',
	'gui/elements/UiParent'
],
	function(
		CanvasGui2d,
		LayoutEnums,
		ElementLayout,
		UiCallbacks,
		CanvasDraw,
		UiParent
		) {

		var CanvasCalls2d = function(parentDiv, resolution, uiCallbacks) {
			this.callsToCanvas = 0;
			this.registerUiCallbacks(uiCallbacks)
			this.uiParent = new UiParent(this);
			this.canvasGui2d = new CanvasGui2d(parentDiv, resolution);
			this.aspect = this.canvasGui2d.aspect;
			var onUpdate = function() {
				this.updateParentLayout();
				this.callResetCallbacks();
			}.bind(this);

			var frustumUpdate = function() {
				this.updateParentLayout();
				if (Math.round(this.aspect*1000) != Math.round(this.canvasGui2d.aspect*1000)) {
					this.callResetCallbacks();
					this.aspect = this.canvasGui2d.aspect;
				}
			}.bind(this);

		//	this.canvasGui2d.onUpdateCallbacks.push(frustumUpdate);

			this.canvas = this.canvasGui2d.canvas;
			this.ctx = this.canvasGui2d.ctx;
			this.resolution = resolution;
			this.lastFont = "20px Verdana";

			this.attenuateColor = 'rgba(0, 0, 0, 0.2)';
			this.renderDepthLayers = [];
			this.drawInstructions = [];
			this.resetCallbacks = [];

			setTimeout(function() {
				onUpdate()
			}, 500)
		};


		CanvasCalls2d.prototype.updateParentLayout = function() {
			this.uiParent.layer.renderStates.passive.renderData.pos.final.left = 0;
			this.uiParent.layer.renderStates.passive.renderData.pos.final.top = 0;
			this.uiParent.layer.renderStates.passive.renderData.pos.origin.left = 0;
			this.uiParent.layer.renderStates.passive.renderData.pos.origin.top = 0;
			this.uiParent.layer.renderStates.passive.renderData.size.width = this.percentToX(100);
			this.uiParent.layer.renderStates.passive.renderData.size.height = this.percentToY(100);
		};


		CanvasCalls2d.prototype.toRgb = function(color) {
			return 'rgb('+Math.floor(color[0]*255)+','+Math.floor(color[1]*255)+','+Math.floor(color[2]*255)+')';
		};

		CanvasCalls2d.prototype.registerUiCallbacks = function(callbackMap) {
			UiCallbacks.addDrawCallbacks(callbackMap)
		};

		CanvasCalls2d.prototype.toRgba = function(color) {
			return CanvasDraw.toRgba(color);
		};

		CanvasCalls2d.prototype.pxToPercentX = function(px) {
			return px/this.canvasGui2d.scalePercentToX;
		};

		CanvasCalls2d.prototype.pxToPercentY = function(px) {
			return px/this.canvasGui2d.scalePercentToY;
		};

		CanvasCalls2d.prototype.percentToX = function(percent) {
			return percent*this.canvasGui2d.scalePercentToX;
		};

		CanvasCalls2d.prototype.percentToY = function(percent) {
			return percent*this.canvasGui2d.scalePercentToY;
		};

        CanvasCalls2d.prototype.getPxFactor = function() {
            return (this.canvasGui2d.resolution / 1024) * this.canvasGui2d.scalePxToX
        };
		CanvasCalls2d.prototype.pxToX = function(px) {
			return this.getPxFactor() * px;
		};



		var CALLS = {
			CALLBACK:	{id:'CALLBACK'		},
			APPLY_RECT:	{id:'APPLY_RECT'	},
			APPLY_BOX:	{id:'APPLY_BOX'		},
			APPLY_TEXT:	{id:'APPLY_TEXT'	},
			APPLY_LINE:	{id:'APPLY_LINE'	},
			APPLY_ARC:	{id:'APPLY_ARC'		}
		};

		CanvasCalls2d.prototype.valueYToUnitY = function(value, unit) {
			if (unit == LayoutEnums.units.pixels) {
				return this.pxToX(value);
			} else {
				return this.percentToY(value);
			}
		};

		CanvasCalls2d.prototype.valueXToUnitX = function(value, unit) {
			if (unit == LayoutEnums.units.pixels) {
				return this.pxToX(value);
			} else {
				return this.percentToX(value);
			}
		};


		CanvasCalls2d.prototype.processTextLabel = function(data) {
			if (data.text.color) this.ctx.fillStyle = data.text.color;
			if (data.text.font) {
				if (this.useFont != data.text.font) {
					this.useFont = data.text.font;
					this.ctx.font = this.useFont;
				}
			}

			this.ctx.textAlign = data.text.align;

			if (typeof(data.text.label) != 'string') {
				for (var i = 0; i < data.text.label.length; i++) {
					this.ctx.fillText(
						data.text.label[i],
						data.text.x,
						data.text.y + data.text.height*i
					);
				}
			} else {
				this.ctx.fillText(
					data.text.label,
					data.text.x,
					data.text.y
				);
			}
		};

		CanvasCalls2d.prototype.processTextCall = function(data) {
			if (data.text.callbacks) {
				for (var i = 0; i < data.text.callbacks.length; i++) {
					data.text.callbacks[i](data);
				}
			}
			if (data.text.callback) data.text.callback(data);

			if (data.text.label) {
				this.processTextLabel(data);
			}
		};

		CanvasCalls2d.prototype.processRectCall = function(data) {
			if (typeof(data.rect.color) != 'string') return;
			this.ctx.fillStyle = data.rect.color;
			this.ctx.fillRect(
				data.rect.x,
				data.rect.y,
				data.rect.w,
				data.rect.h
			);
		};

		CanvasCalls2d.prototype.processLineCall = function(data) {
			if (data.color) this.ctx.strokeStyle = this.toRgba(data.color);
			this.ctx.lineWidth = this.pxToX(data.w);
			this.ctx.beginPath();
			this.ctx.moveTo(
				this.percentToX(data.fromX),
				this.percentToY(data.fromY)
			);
			this.ctx.lineTo(
				this.percentToX(data.toX),
				this.percentToY(data.toY)
			);
			this.ctx.stroke();
		};

		CanvasCalls2d.prototype.processArcCall = function(data) {
			if (data.color) this.ctx.strokeStyle = this.toRgba(data.color);
			this.ctx.lineWidth = this.pxToX(data.w);
			this.ctx.beginPath();
			this.ctx.arc(
				this.percentToX(data.x),
				this.percentToY(data.y),
				this.pxToX(data.radius),
				data.start,
				data.end);
			this.ctx.stroke();
		};

		CanvasCalls2d.prototype.processDrawCallbackCall = function(data) {
			if (data.callbacks) {
				for (var i = 0; i < data.callbacks.length; i++) {
					data.callbacks[i].callback(this.ctx, data);
				}

			} else {
				data.callback.callback(this.ctx, data);
			}

		};

		CanvasCalls2d.prototype.processBoxCall = function(data) {
			if (!data.box) return;
			if (typeof(data.box.color) != 'string') return;
			this.ctx.strokeStyle = data.box.color;
			this.ctx.lineWidth = data.box.lineW;
			this.ctx.strokeRect(
				data.box.x,
				data.box.y,
				data.box.w,
				data.box.h
			);
		};


		CanvasCalls2d.prototype.callDraw = function(call, data) {
			this.callsToCanvas += 1;
			switch (call.id) {
				case CALLS.APPLY_RECT.id:
					if (!data.rect) return;
					this.processRectCall(data);

					break;
				case CALLS.APPLY_BOX.id:
					this.processBoxCall(data);
					break;
				case CALLS.APPLY_TEXT.id:
					if (!data.text) return;

					this.processTextCall(data);

					break;
				case CALLS.APPLY_LINE.id:
					this.processLineCall(data);

					break;
				case CALLS.APPLY_ARC.id:
					this.processArcCall(data);

					break;
				case CALLS.CALLBACK.id:
					this.processDrawCallbackCall(data);
					break;
			}
		};

		CanvasCalls2d.list = function() {
			return CALLS;
		};

		CanvasCalls2d.prototype.list = function() {
			return CanvasCalls2d.list();
		};

		CanvasCalls2d.prototype.attenuateGui = function() {
			this.resolution = this.canvasGui2d.resolution;

		//	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = this.attenuateColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		};

		var t = 0;

		CanvasCalls2d.prototype.updateCanvasCalls = function(tpf) {

		//	t+=tpf;
		//	if (t < 1) return
		//	t = 0;
			this.canvasGui2d.applyChanges();
			this.canvasGui2d.updateCanvasGui();

			this.ctx.globalCompositeOperation = 'source-over';
		//	this.setAttenuateColor([0, 0, 0, 0.1]);
			this.attenuateGui();
			this.ctx.globalCompositeOperation = 'lighter';
			UiCallbacks.getCallById('processCallbacks')(tpf, this.ctx);

			this.drawDepthLayers();

		};


		CanvasCalls2d.prototype.drawToCanvasGui = function(draw) {

		//	if (t < 0.9) return
			if (!draw.renderData) {
				console.error("No renderData", draw);
				draw.renderData = draw;
			}

			if (!draw.zIndex) draw.zIndex = 0;

			if (!this.drawInstructions[draw.zIndex]) {
				this.drawInstructions[draw.zIndex] = [];
				this.renderDepthLayers.push(draw.zIndex)
			}
			this.drawInstructions[draw.zIndex].push(draw.renderData);
		};

		CanvasCalls2d.prototype.drawSortedLayers = function() {
			this.callsToCanvas = 0;
			for (var i = 0; i < this.renderDepthLayers.length; i++) {
				 this.applyDrawInstructions(this.drawInstructions[this.renderDepthLayers[i]]);

			}
			this.drawInstructions  = {};
			this.renderDepthLayers = [];

		};


		CanvasCalls2d.prototype.drawDepthLayers = function() {
			this.renderDepthLayers.sort();
		//	this.renderDepthLayers.reverse();
			this.drawSortedLayers();
		};

		CanvasCalls2d.prototype.applyDrawInstructions = function(zLayer) {
			for (var i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].rect) this.callDraw(this.list().APPLY_RECT, zLayer[i]);
			}

			for (i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].box) this.callDraw(this.list().APPLY_BOX, zLayer[i]);
			}

			for (i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].line) this.callDraw(this.list().APPLY_LINE, zLayer[i].line);
			}

			for (i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].callback) this.callDraw(this.list().CALLBACK, zLayer[i]);
			}

			for (i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].text) this.callDraw(this.list().APPLY_TEXT, zLayer[i]);
			}

			for (i = 0 ; i < zLayer.length; i++) {
				if (zLayer[i].arc) this.callDraw(this.list().APPLY_ARC, zLayer[i].arc);
			}

		};

		CanvasCalls2d.prototype.setAttenuateColor = function(color) {
			this.attenuateColor = this.toRgba(color);
		};


        CanvasCalls2d.prototype.toggleGui = function(bool) {
             
        };



        CanvasCalls2d.prototype.applyTextureResolution = function(res) {
			this.canvasGui2d.setCanvasGuiResolution(res);

			if (this.resolution != res) {
				this.callResetCallbacks();
			}
			this.resolution = res;

		};
		
		CanvasCalls2d.prototype.applyTextureScale = function(txScale) {
			this.canvasGui2d.scaleCanvasGuiResolution(txScale);

			if (this.resolution != this.canvasGui2d.resolution) {
				this.callResetCallbacks();
			}

		};

		CanvasCalls2d.prototype.registerResetCallback = function(callback) {
			this.resetCallbacks.push(callback);
		};
		var resetTimeout;
		CanvasCalls2d.prototype.callResetCallbacks = function() {
			this.updateParentLayout();
		//	this.setAttenuateColor([0, 0, 0, 1]);
			this.attenuateGui();
			this.renderDepthLayers = [];
			this.drawInstructions = [];
			var rebuild = function() {
				this.updateParentLayout();
		//		this.setAttenuateColor([0, 0, 0, 0.2]);
				this.resolution = this.canvasGui2d.resolution;
				for (var i = 0; i < this.resetCallbacks.length; i++) {
					this.resetCallbacks[i]();
				}
				this.drawInstructions = [];
			}.bind(this);

			this.resolution = this.canvasGui2d.resolution;

			clearTimeout(resetTimeout);
			resetTimeout = setTimeout(function() {
				rebuild()
			}, 0);

		};


		return CanvasCalls2d

	});