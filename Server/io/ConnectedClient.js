ConnectedClient = function(seed, socket, clients) {
	this.id = 'client_'+seed;
	this.socket = socket;
    this.connectedClients = clients;
	socket.clientId = this.id;
    this.dataBuffer = [];

    this.visiblePlayers = [];
    
    this.player;
    
    this.clientStates = {
        CONSTRUCTED:'CONSTRUCTED',
        DISCONNECTED:'DISCONNECTED',
        CONNECTED:'CONNECTED',
        PLAYING:'PLAYING'
    };
    this.setState(this.clientStates.CONSTRUCTED);
};

ConnectedClient.prototype.setPlayerName = function(name) {
    this.player.piece.setName(name);
};

ConnectedClient.prototype.setState = function(state) {
    console.log("Set ConnectedClient state: ", state);
    this.state = this.clientStates[state];
};

ConnectedClient.prototype.getState = function() {
    return this.state;
};

ConnectedClient.prototype.attachPlayer = function(serverPlayer) {
    this.player = serverPlayer;
};


ConnectedClient.prototype.setVisiblePlayers = function(visiblePlayers) {
    this.visiblePlayers.length = 0;
    for (var i = 0; i < visiblePlayers.length; i++) {
        this.visiblePlayers.push(visiblePlayers[i]);
    }
    
};



ConnectedClient.prototype.notifyDataFrame = function() {

//    for (var i = 0; i < this.dataBuffer.length; i++) {
    if (this.dataBuffer.length) {
//        console.log("Data Buffer Length; ", this.dataBuffer.length);
        this.socket.send(JSON.stringify(this.dataBuffer));
    }

//    }
    this.dataBuffer = [];
};


ConnectedClient.prototype.sendToClient = function(data) {
    if (!data) {
        return;
    }
    this.dataBuffer.push(data);
};


ConnectedClient.prototype.broadcastToVisible = function(data) {
    for (var i = 0; i < this.visiblePlayers.length; i++) {
        this.visiblePlayers[i].client.sendToClient(data);
    }
    this.sendToClient(data);
};


ConnectedClient.prototype.broadcastToAll = function(data) {
    if (!data) console.log("Bad broadcast all", data);
    this.connectedClients.broadcastToAllClients(data);
};

