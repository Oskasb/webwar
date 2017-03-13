"use strict";


define(['Events',
	'PipelineAPI'

],
	function(
		     evt,
			 PipelineAPI
		) {

		var socket;
		var frameStack = [];

		var messageCount = 0;
		var socketBytes = 0;

		var Connection = function() {};


		Connection.prototype.setupSocket = function(connectedCallback, errorCallback, disconnectedCallback) {
			var host = location.origin.replace(/^http/, 'ws');
			var pings = 0;

			socket = new WebSocket(host);

			socket.responseCallbacks = {};

			socket.onopen = function () {
				connectedCallback();
			};

			socket.onclose = function () {
				disconnectedCallback();
				
			};

			socket.onmessage = function (message) {

				messageCount++;
				socketBytes += message.data.length;
				PipelineAPI.setCategoryKeyValue('STATUS', 'RECIEVED_BYTES',socketBytes);

				pings++;
				frameStack.push(message.data);
			};

			socket.onerror = function (error) {
				console.log('WebSocket error: ' + error);
				errorCallback(error);
			};


			var sendMessage = function(msg, args) {

			//	console.log("SEND message", msg, args);
				if (!msg) {
					console.log("SEND REQUEST missing", msg, args);
				//	return;
				}

				socket.send(msg.make(args.data));
			};

			return sendMessage;

		};

		var responseStack = [];

		function processStackedMessage(messageData) {
			var resBuffer = JSON.parse(messageData);

			if (!resBuffer.length) {
				responseStack.push(resBuffer);
			} else {
				for (var i = 0; i < resBuffer.length; i++) {

					if (!resBuffer[i]) {
						console.log("Empty Message",i, resBuffer);
					} else {
						responseStack.push(resBuffer[i]);
					}
				}
			}
		}

		Connection.prototype.processTick = function() {

			for (var i = 0; i < frameStack.length; i++) {
				processStackedMessage(frameStack[i]);
			}

			frameStack = [];
			PipelineAPI.setCategoryKeyValue('STATUS', 'MESSAGE_STACK',messageCount);
			messageCount = 0;
			return responseStack;
		};
		
		return Connection;
	});