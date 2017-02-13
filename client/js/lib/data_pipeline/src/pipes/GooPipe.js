"use strict";

define([
	'data_pipeline/DataWorker',
	'data_pipeline/goodata/BundleLoader'
],
	function(
		DataWorker,
		BundleLoader
		) {

		var pollDelay = 0.2;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var options = {
			"polling":{
				"enabled":true,
				"frequency":1
			}
		};

		var GooPipe = function() {

		};

		GooPipe.passToDynamicLoader = function(goo, url, fileName, success, fail) {
			BundleLoader.loadBundleData(goo, url, fileName, success, fail)
		};



		GooPipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		GooPipe.storeConfig = function(goo, path, url, fileName, config, success, fail) {
			loadedData[url] = config;

			var fromLoader = function(srcUrl, loaderData, loader) {
				success(url, loaderData, loader);
			};


			GooPipe.passToDynamicLoader(goo, url, fileName, fromLoader, fail);


			var dataUpdated = function() {
				GooPipe.passToDynamicLoader(goo, url, fileName, fromLoader, fail)
			};

			GooPipe.registerPollCallback(url+fileName, dataUpdated);
		};

		GooPipe.loadBundleFromFolderUrl = function(path, goo, folderUrl, fileName, dataUpdated, fail) {
			var onLoaded = function(config, fileUrl) {
				GooPipe.storeConfig(goo, path, folderUrl, fileName, config, dataUpdated, fail);

			};

			var onWorkerOk = function(resUrl, res) {
				console.log("Worker success: ", res)
				onLoaded(res, resUrl);

			};
			var onWorkerFail = function(res) {
				fail("Worker fail: "+ res)
			};

			DataWorker.fetchJsonData(folderUrl+fileName, onWorkerOk, onWorkerFail);
		};



		GooPipe.tickGooPipe = function(tpf) {
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.error("GooPolling failed", err);
				};


				DataWorker.fetchJsonData(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail)
				pollCountdown = pollDelay;
			}
		};

		GooPipe.setGooPipeOpts = function(opts) {
			options = opts;
		};

		return GooPipe

	});