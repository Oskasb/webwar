"use strict";

define([
	'ui/GameScreen',
	'Events'

],
	function(
		GameScreen,
		evt
		) {

		var VisualCursor = function() {
			this.x = 0;
			this.y = 0;
			this.vectorColor = [0.3, 0.9, 0.8, 1];
			this.renderPointer = {
				pointer:{
					x:0,
					y:0,
					hidden:false
				},
				action:[0, 0]
			}

		};

		VisualCursor.prototype.pxXtoPercentX = function(x) {
			return 100*x/GameScreen.getWidth()
		};

		VisualCursor.prototype.pxYtoPercentY = function(y) {
			return 100*y/GameScreen.getHeight();
		};


		VisualCursor.prototype.moveTo = function(x, y, hoverCount) {
			this.renderPointer.pointer.x = x;
			this.renderPointer.pointer.y = y;
			this.renderPointer.pointer.hidden = hoverCount;
			evt.fire(evt.list().CURSOR_MOVE, this.renderPointer);
			return this.renderPointer.pointer;
		};

		VisualCursor.prototype.transformConnector = function(x1, y1, x2, y2, distance, zrot) {
			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();
			if (distance > 5) {
				evt.fire(evt.list().CURSOR_LINE, {

					fromX:x1,
					fromY:y1,
					toX:x2,
					toY:y2,
					w: 2*1+(distance+0.4),
					zrot:zrot

				});
			}

		};

		VisualCursor.prototype.showDragToPoint = function(x, y, distance, angle) {
			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();
			evt.fire(evt.list().CURSOR_DRAG_TO, {
				renderData:{
					arc:{
						x:this.renderPointer.pointer.x,
						y:this.renderPointer.pointer.y,
						radius:8+12*(distance),
						start:-Math.PI*0.5+angle+(Math.PI*distance),
						end:-Math.PI*0.5+angle-(Math.PI*distance),
						w: 2*1+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}

			});
		};

		VisualCursor.prototype.showStartDragPoint = function(x, y, distance, angle) {

			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();

			evt.fire(evt.list().CURSOR_START_DRAG, {
				renderData:{
					arc:{
						x:100*x/width,
						y:100*y/height,
						radius:4/(distance+0.1),
						start:-Math.PI*0.5+angle+(Math.PI*distance),
						end:-Math.PI*0.5+angle-(Math.PI*distance),
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					line:{
						x:100*x/width,
						y:100*y/height,
						toX:100*x/width+20*distance,
						toY:100*y/height,
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}
			});
			evt.fire(evt.list().CURSOR_LINE, {
				renderData:{
					line:{
						x:100*x/width,
						y:100*y/height,
						toX:100*x/width,
						toY:100*y/height+20*distance,
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}
			});
		};

		VisualCursor.prototype.showPressPoint = function(state) {
			evt.fire(evt.list().CURSOR_PRESS, {
				renderData:{
					arc:{
						x:this.renderPointer.pointer.x,
						y:this.renderPointer.pointer.y,
						radius:5+4*state,
						start:2*Math.PI,
						end:0,
						w: 5+2*state,
						color:this.vectorColor
					},
					zIndex:10000}
			});
		};

		var timeoutTrigger;
		var fireOnRelease
		VisualCursor.prototype.visualizeMouseAction = function(action) {
			this.renderPointer.action = action;

			if (action[0] == 1) {
				fireOnRelease = true;

				timeoutTrigger = setTimeout(function() {
					fireOnRelease = false;
				}, 100);

			}

			if (action[0] == 0) {

				if (fireOnRelease) {
					evt.fire(evt.list().CURSOR_RELEASE_FAST, this.renderPointer);
					clearTimeout(timeoutTrigger);
				}
				fireOnRelease = false
			}


		//	DEBUG_MONITOR(JSON.stringify(this.renderPointer))

			/*
			this.vectorColor[0]=0.5+action[0]*0.5;
			this.vectorColor[1]=0.5+action[1]*0.5;

			evt.fire(evt.list().CURSOR_PRESS, {
				renderData:{
					arc:{
						x:this.renderPointer.pointer.x,
						y:this.renderPointer.pointer.y,
						radius:5+4*state,
						start:2*Math.PI,
						end:0,
						w: 5+2*state,
						color:this.vectorColor
					},
					zIndex:10000}
			});

			this.showPressPoint(action[0]+action[1]);
            */
		};


		VisualCursor.prototype.lineDistance = function(fromX, fromY, toX, toY) {
			return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
		};

		VisualCursor.prototype.visualizeVector = function(fromX, fromY, toX, toY) {
			var distance = this.lineDistance(fromX, fromY, toX, toY);
		//	this.showStartDragPoint(fromX, fromY, distance, Math.atan2( toX - fromX, fromY - toY));

			this.transformConnector(fromY, fromX, toY, toX, distance, Math.atan2( toY - fromY, fromX - toX));

		//	this.transformConnector(fromX, fromY, toX, toY, distance, Math.atan2( toX - fromX, fromY - toY));



		//	this.showDragToPoint(toX, toY, distance , Math.atan2(fromX - toX, toY - fromY) );
		};

		return VisualCursor;

	});