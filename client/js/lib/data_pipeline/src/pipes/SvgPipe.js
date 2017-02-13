"use strict";

define([
	'data_pipeline/DataWorker'
],
	function(
		DataWorker
		) {

		var pollDelay = 1;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var options = {
			"polling":{
				"enabled":false,
				"frequency":1
			}
		};


		var SvgPipe = function() {

		};

		SvgPipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		SvgPipe.storeData = function(url, svg, success) {
			loadedData[url] = svg;
			success(url, svg);
		};

		SvgPipe.loadSvg = function(url, dataUpdated, fail) {
			var onLoaded = function(svg, fileUrl) {
				SvgPipe.storeData(fileUrl, svg, dataUpdated);
				SvgPipe.registerPollCallback(fileUrl, dataUpdated);
			};

			var onWorkerOk = function(resUrl, res) {
				onLoaded(res, resUrl);
				//	console.log("Worker success: ", res, activatePolling)
			};
			var onWorkerFail = function(res) {
				console.error("Worker error: ", res)
			};

			DataWorker.fetchSvgData(url, onWorkerOk, onWorkerFail);
		};

		SvgPipe.tickSvgPipe = function(tpf) {
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.error("Svg Polling failed", err);
				};
				SvgPipe.loadSvg(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		SvgPipe.setSvgPipeOpts = function(opts) {
			options = opts;
		};

		return SvgPipe

	});