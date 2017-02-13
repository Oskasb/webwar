"use strict";

define(['data_pipeline/DataPipelineMessageHandler'],
	function(DataPipelineMessageHandler) {

		var onUpdateCallbacks = {};

		var worker = new Worker('./client/js/lib/data_pipeline/src/worker/WorkerMain.js');

		worker.onmessage = function(msg) {
			if (msg.data[0] == 'ready') {
				DataPipelineMessageHandler.notifyWorkerReady();
			}
			if (msg.data[0] == 'ok') {
				onUpdateCallbacks[msg.data[1]][0](msg.data[1], msg.data[2]);
				DataPipelineMessageHandler.handleDataUpdated(msg.data[1]);
			}
			if (msg.data[0] == 'fail') DataPipelineMessageHandler.handleWorkerError(msg.data[1], msg.data[2]);
			if (msg.data[0] == 'error_resolved') DataPipelineMessageHandler.handleErrorUpdate(msg.data[1], msg.data[2]);
			if (msg.data[0] == 'error_unchanged') DataPipelineMessageHandler.handleErrorUpdate(msg.data[1], msg.data[2]);
			if (msg.data[0] == 'error_changed') DataPipelineMessageHandler.handleErrorUpdate(msg.data[1], msg.data[2]);
		};

		var fetchJsonData = function(url, onDataUpdate, fail) {
			onUpdateCallbacks[url] = [onDataUpdate, fail];
			worker.postMessage(['json', url]);
		};

		var fetchSvgData = function(url, onDataUpdate, fail) {
			onUpdateCallbacks[url] = [onDataUpdate, fail];
			worker.postMessage(['svg', url]);
		};

		var fetchBinaryData = function(url, onDataUpdate, fail) {
			onUpdateCallbacks[url] = [onDataUpdate, fail];
			worker.postMessage(['bin', url]);
		};

		return {
			fetchJsonData:fetchJsonData,
			fetchSvgData:fetchSvgData,
			fetchBinaryData:fetchBinaryData
		};
	});