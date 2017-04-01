"use strict";

define([
	'data_pipeline/DataWorker',
	'Events'
],
	function(
		DataWorker,
		evt
		) {

		var pollDelay = 0.2;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};
		var errorCallback = function() {};

		var options = {
			"polling":{
				"enabled":false,
				"frequency":5
			}
		};

		var JsonPipe = function() {

		};

		JsonPipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		JsonPipe.storeConfig = function(url, config, success) {
			loadedData[url] = config;
			success(url, config);
		};

		JsonPipe.loadJsonFromUrl = function(url, dataUpdated, fail) {
			var onLoaded = function(config, fileUrl) {
				JsonPipe.storeConfig(fileUrl, config, dataUpdated);
				JsonPipe.registerPollCallback(fileUrl, dataUpdated);
			};

			var onWorkerOk = function(resUrl, res) {
			//	onLoaded(JSON.parse(res), resUrl);
				evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:'JSON Loaded: '+resUrl});
				onLoaded(res, resUrl);

			};
			var onWorkerFail = function(res) {
				evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Worker Error: '+res});
				fail("Worker fail: "+ res)
			};

			DataWorker.fetchJsonData(url, onWorkerOk, onWorkerFail);
		};

		JsonPipe.saveJsonToUrl = function(json, url) {

			DataWorker.saveJsonData(json, url);
			
		};
		
		JsonPipe.tickJsonPipe = function(tpf) {
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Poll Error: '+err});
					errorCallback("Json: ", err);
				};
				JsonPipe.loadJsonFromUrl(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false);
				pollCountdown = pollDelay;
			}
		};

		JsonPipe.setJsonPipeOpts = function(opts, pipelineErrorCb, ConfigCache) {
			options = opts;
			errorCallback = pipelineErrorCb;
			
			var statusUpdate = function(key, value) {

				if (value) {
					evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:'Enable JSON Poll'});
				} else {
					evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Disable JSON Poll'});
				}

				options.polling.enabled = value;

			};

			ConfigCache.subscribeToCategoryKey('STATUS', "PIPELINE", statusUpdate)
		};


		return JsonPipe

	});