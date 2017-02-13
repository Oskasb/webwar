
define([], function() {

	var touchAction = [0];

	var events = {
		touchstart:'touchstart',
		touchend:'touchend',
		touchmove:'touchmove'
	};

	var inputIsTouch = 'ontouchstart' in document.documentElement;

	var TouchActionListener = function() {
		this.enabled = inputIsTouch;
	};

	TouchActionListener.prototype.setupElementTouchListener = function(element) {

		var isFullscreen = false;

		function enterFullscreen() {

			var elem = document.body;
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
				elem.webkitRequestFullscreen();
			}

			isFullscreen = true;
		}



	var handleTouchStart = function() {
	//	if (!isFullscreen) enterFullscreen();

			touchAction[0] = 1;

		};

		var handleTouchEnd = function() {
			touchAction[0] = 0;
		};

		element.addEventListener(events.touchstart, handleTouchStart);
		element.addEventListener(events.touchend, handleTouchEnd);
	};

	TouchActionListener.prototype.sampleAction = function(mouseStore) {
		mouseStore.action[0] += touchAction[0];
	//	touchAction[0] = 0;
	};

	return TouchActionListener
});
