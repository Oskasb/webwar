"use strict";

define([
//	'goo/entities/SystemBus',
	'Events'

],
	function(
	//	SystemBus
		evt
		) {

		var ConfigCache;

		require(['data_pipeline/data/ConfigCache'], function(CC) {
			ConfigCache = CC;
		});

		var okCount = 0;
		var failCount = 0;

		var generateMsgLevels = function(err) {
			var msg = [];
			if (typeof(err) == "array") {
				for (var i = 0; i < err.length; i++) {
					msg.push(err[i])
				}
			} else {
				msg.push(err);
			}
			return msg;
		};

		var handleWorkerError = function(url, err) {

			var msg = generateMsgLevels(err);
			msg.push(failCount);
			msg.push(url);
			failCount += 1;
			delayedSend('data_error_channel', msg, 50)
		};

		var handleErrorUpdate = function(update, err) {
			var msg = generateMsgLevels(err);
			msg.push(update);
			delayedSend('data_error_update_channel', msg, 300);
			evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+msg});
	//		SystemBus.emit("message_to_gui", {channel:'alert_channel', message:"Data Update Error"});


		};


		var delayedSend = function(channel, msg, delay) {
			setTimeout(function() {
				evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:'Pipeline Update '+msg});
	//			SystemBus.emit('message_to_gui', {channel:channel, message:msg})
			}, delay)
		};

		var handleDataUpdated = function(url) {
			okCount += 1;
			delayedSend('data_update_channel', url+' '+okCount, 500);
		//	delayedSend('data_update_channel', url+' '+okCount, 500);
		//	delayedSend('data_update_channel', url+' '+okCount, 2500);
		};

		var handleValidationPass = function(list) {
			delayedSend('data_validation_update_channel', list, 500);
		//	delayedSend('data_validation_update_channel', list, 600);
		//	delayedSend('data_validation_update_channel', list, 3500);
		};

		var handleValidationError = function(msg) {
			delayedSend('data_validation_error_channel', msg, 500);
		//	delayedSend('data_validation_error_channel', msg, 600);
		//	delayedSend('data_validation_error_channel', msg, 3500);
		};


		var notifyWorkerReady = function() {
			ConfigCache.pipelineReady(true)
		};

		return {
			notifyWorkerReady:notifyWorkerReady,
			handleWorkerError:handleWorkerError,
			handleErrorUpdate:handleErrorUpdate,
			handleDataUpdated:handleDataUpdated,
			handleValidationPass:handleValidationPass,
			handleValidationError:handleValidationError
		}
	});