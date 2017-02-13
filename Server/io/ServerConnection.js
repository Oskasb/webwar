
ServerConnection = function() {
	this.socketMessages = new SocketMessages();
};

ServerConnection.prototype.shutdownSocket = function() {
	this.wss.close();
};

ServerConnection.prototype.setupSocket = function(wss, dataHub, clients, removePlayerCallback) {
	this.wss = wss;
	var messages = this.socketMessages.messages;

	wss.on("connection", function(ws) {

		var sends = 0;



		console.log("websocket connection open");

		var respond = function(msg) {
			ws.send(msg)
		};

		clients.registerConnection(ws, dataHub);

		ws.on("message", function(message) {
			if (typeof(message) != 'string') {
				console.log("not JSON", message);
				var msg = message;
			} else {
				var msg = JSON.parse(message);
			}

			if (messages[msg.id]) {
				messages[msg.id].call(respond, msg.data, dataHub, ws.clientId);
			} else {
				console.log("undefined SocketMessage ", message);
			}

			sends++;
		});


		ws.on("close", function() {
			
			var packet = removePlayerCallback(ws.clientId);
			clients.clientDisconnected(ws.clientId, packet);
			console.log("connection closed "+ws.clientId);

		})
	});

	console.log("Init Server Connection")
};

