ActiveClients = function() {
	this.clientCount = 0;
	this.connectedClients = {};
	
};

ActiveClients.prototype.registerConnection = function(socket, dataHub) {
	this.clientCount++;
	var client = new ConnectedClient(this.clientCount, socket, this);
	client.setState(client.clientStates.CONNECTED);
	this.connectedClients[client.id] = client;
	client.sendToClient({id:'clientConnected', data:{clientId:client.id, pieceData:dataHub.configs.piece_data}});
	client.sendToClient({id:'updateGameData', data:{clientId:client.id, gameData:dataHub.configs}});
	client.notifyDataFrame();
};

ActiveClients.prototype.requestPlayer = function(data, clientId) {
	console.log("Request Player", JSON.stringify(data), clientId);
	if (data.name) {
		this.getClientById(clientId).setPlayerName(data.name);
	}
	
};

ActiveClients.prototype.broadcastToAllClients = function(data) {
	for (var key in this.connectedClients) {
        this.connectedClients[key].sendToClient(data);
    }
};

ActiveClients.prototype.registerClient = function(data) {
	return data;
};

ActiveClients.prototype.getClientById = function(id) {
	return this.connectedClients[id];

};

ActiveClients.prototype.clientDisconnected = function(clientId, packet) {
	delete this.connectedClients[clientId];
	if (!packet) console.log("Bad DC?", clientId);
    this.broadcastToAllClients(packet);
};