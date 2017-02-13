define(['Events'], function(evt) {

	var TimeTracker = function() {
		this.startTime = performance.now();
		this.lastFrameTime = 0;
		this.frameTime = 1;
		this.currentTime = this.startTime;
		this.pingTime = 0;
		this.pingResponseTime = 0;

		this.pingInterval = 2000;
		this.tpf = 1;


		var _this = this;

		var handleTick = function(e) {
			_this.trackFrameTime(evt.args(e).frame)
		};

		evt.on(evt.list().CLIENT_TICK, handleTick)
	};

	TimeTracker.prototype.processFrameDuration = function(duration) {
		this.tpf = duration * 0.001;
		this.currentTime += this.tpf;
	};


	var pings = 0;

	TimeTracker.prototype.processPingDuration = function(duration) {
		pings++;

		if (SYSTEM_SETUP.DEBUG.trackPing) {
			evt.fire(evt.list().MESSAGE_UI, {channel: 'ping_tracker', message: 'Ping: ' + Math.round(duration)+' ms'});
		}


	};

	TimeTracker.prototype.trackFrameTime = function(frame) {
		this.frameTime = performance.now(); // new Date().getTime();

		this.processFrameDuration(this.frameTime - this.lastFrameTime);

		this.lastFrameTime = this.frameTime;
		
		return this.tpf;
		
	};

	TimeTracker.prototype.pingSend = function(frame) {
		this.pingTime = this.frameTime;

		evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ping', data:frame});

	};

	TimeTracker.prototype.ping = function(data) {
		this.pingResponseTime = this.frameTime;
		this.processPingDuration(this.pingResponseTime - this.pingTime);
	};

	return TimeTracker;

});
