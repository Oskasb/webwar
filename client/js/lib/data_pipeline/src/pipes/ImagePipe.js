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


		var ImagePipe = function() {

		};

		ImagePipe.registerPollCallback = function(url, onUpdateCallback) {
			if (!pollCallbacks[url]) {
				pollCallbacks[url] = [];
			}
			pollCallbacks[url].push(onUpdateCallback);
			pollIndex.push(url);
		};

        ImagePipe.callUrlCallbacks = function(url, img) {

     //       console.log(url, pollCallbacks)

            for (var i = 0; i < pollCallbacks[url].length; i++) {
                pollCallbacks[url][i](url, img);
            }

            loadedData[url] = img;
        };

		ImagePipe.storeData = function(url, svg, success) {
			loadedData[url] = svg;
			success(url, svg);
		};

		ImagePipe.loadImage = function(url, dataUpdated, fail) {

			var onLoaded = function(img, fileUrl) {
				ImagePipe.callUrlCallbacks(fileUrl, img);

			};

			var onWorkerOk = function(resUrl, res) {
				onLoaded(res, resUrl);
			};
			var onWorkerFail = function(res) {
				console.error("Worker error: ", res)
			};

			DataWorker.fetchBinaryData(url, onWorkerOk, onWorkerFail);
		};

		ImagePipe.tickImagePipe = function(tpf) {
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.error("Image Polling failed", err);
				};

				ImagePipe.loadImage(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		ImagePipe.setImagePipeOpts = function(opts) {
			options = opts;
		};

		return ImagePipe

	});