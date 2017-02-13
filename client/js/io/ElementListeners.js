"use strict";

define([
	'ui/GameScreen',
	'io/MouseActionListener',
	'io/TouchActionListener',
	'Events'
],
	function(
		GameScreen,
		MouseActionListener,
		TouchActionListener,
		evt
		) {


		var x;
		var y;
		var dx;
		var dy;
		var wheelDelta;

		var ElementListeners = function() {

			var touchWait;
			var _this = this;

			var setupTouch = function() {
				evt.fire(evt.list().SCREEN_CONFIG, {inputModel:'touch'});
				this.actionListener = new TouchActionListener();
				this.setupTouchListener();

				clearListeners();

				clearTimeout(touchWait);

			}.bind(this);

			var setupMouse = function() {

				touchWait = setTimeout(function() {
					console.log("setup Mouse Action Listener")
					evt.fire(evt.list().SCREEN_CONFIG, {inputModel:'mouse'});
					_this.actionListener = new MouseActionListener();
					_this.setupMouseListener();
					clearListeners();
				}, 10);
				window.removeEventListener('mousemove', setupMouse);
			}.bind(this);

			var clearListeners = function() {
				window.removeEventListener('mousemove', setupMouse);
				window.removeEventListener('touchstart', setupTouch);
			};
			
			
			window.addEventListener('mousemove', setupMouse);
			window.addEventListener('touchstart', setupTouch);
		};

		ElementListeners.prototype.setupMouseListener = function() {
			this.actionListener.setupElementClickListener(GameScreen.getElement());
			GameScreen.getElement().addEventListener('mousemove', function(e) {
				e.stopPropagation();
				x = (e.clientX);
				y = (e.clientY);
				dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
				dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
			});

			GameScreen.getElement().addEventListener('mouseout', function(e) {
				e.stopPropagation();
				dx = 0;
				dy = 0;
			});

			var zoomTimeout;

			GameScreen.getElement().addEventListener('mousewheel', function(e) {
				e.stopPropagation();
				if (zoomTimeout) return;
				wheelDelta = e.wheelDelta / 1200;
				setTimeout(function() {
					zoomTimeout = false;
				}, 100);
				zoomTimeout = true;
			});
		};

		ElementListeners.prototype.setupTouchListener = function() {
			this.actionListener.setupElementTouchListener(GameScreen.getElement());
			GameScreen.getElement().addEventListener('touchstart', function(e) {
				e.preventDefault();
				x = (e.touches[0].clientX);
				y = (e.touches[0].clientY);
				dx = 0;
				dy = 0;
			});

			GameScreen.getElement().addEventListener('touchmove', function(e) {
				e.preventDefault();
				x = (e.touches[0].clientX);
				y = (e.touches[0].clientY);
				dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
				dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
			});


			GameScreen.getElement().addEventListener('touchend', function(e) {
				e.preventDefault();
				dx = 0;
				dy = 0;
			});
		};


		ElementListeners.prototype.sampleMouseState = function(mouseStore) {
			mouseStore.action[0] = 0;
			this.actionListener.sampleAction(mouseStore);

			mouseStore.x = x;
			mouseStore.y = y;
			mouseStore.dx = dx;
			mouseStore.dy = dy;
			mouseStore.wheelDelta = wheelDelta;

			wheelDelta = 0;
			dx = 0;
			dy = 0;
		};

		return ElementListeners;

	});