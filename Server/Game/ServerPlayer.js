ServerPlayer = function(pieceType, clientId, client, simTime) {

    var commandModuleId = "piece_command_module";

	if (!client) {
		console.log("Bad ConnectedClient!", clientId);
		return;
	}

	this.currentGridSector = null;
	
	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

    var piece = new GAME.Piece(pieceType, this.id, simTime, Number.MAX_VALUE);

	this.setPlayerPiece(piece, commandModuleId);

	client.attachPlayer(this);

    this.visiblePieces = [];
    this.otherPlayers = [];

    this.sendSeeQueue = [];
    this.sendUnseeQueue = [];
    piece.setName(this.id);
};


ServerPlayer.prototype.setPlayerPiece = function(p, commandModuleId) {
    var piece = p;
    this.piece = piece;

    var client = this.client;
    var clientId = this.clientId;

    var broadcast = function(piecePacket) {
        if (!client) {
            console.log("Bad ConnectedClient!", piece.id, piecePacket);
            return;
        }
        //    console.log("ServerPlayer broadcast: ", piece.id, piece.state);
        piece.setModuleState(commandModuleId, clientId);
        client.broadcastToVisible(piecePacket);
    };

    this.piece.setBroadcastFunction(broadcast);

    this.piece.networkDirty = true;

};


ServerPlayer.prototype.releaseCurrentCommandedPiece = function() {

    var broadcast = function() {};

    this.piece.setBroadcastFunction(broadcast);
};

ServerPlayer.prototype.makeAppearPacket = function() {
    var iAppearPacket = this.piece.makePacket();
    console.log("Make Appear:", this.id)
    iAppearPacket.data.state = GAME.ENUMS.PieceStates.APPEAR;
    return iAppearPacket;
};

ServerPlayer.prototype.makeHidePacket = function() {
    var iHidePacket = this.piece.makePacket();
    iHidePacket.data.state = GAME.ENUMS.PieceStates.HIDE;
    return iHidePacket;
};

ServerPlayer.prototype.arrayDiff = function(array1, array2, store) {

    for (var i = 0; i < array1.length; i++) {
        if (array2.indexOf(array1[i]) == -1) {
            if (array1[i] != this) {
                store.push(array1[i]);
            }
        }
    }
};


ServerPlayer.prototype.seePieces = function(gridSector, piecesAppear) {
    for (var i = 0; i < piecesAppear.length; i++) {
        if (!piecesAppear[i]) {
            console.log("No piece in Appear Queue!", i);
            return;
        }

        this.client.sendToClient(gridSector.makeAppearPacket(piecesAppear[i]));
    }
};

ServerPlayer.prototype.unseePieces = function(gridSector, piecesRemove) {
    for (var i = 0; i < piecesRemove.length; i++) {

        if (!piecesRemove[i]) {
            console.log("No piece in Remove Queue!", i);
            return;
        }
        this.client.sendToClient(gridSector.makeHidePacket(piecesRemove[i]));
    }
};

ServerPlayer.prototype.seePlayers = function(iAppearPacket, playersAppear) {
    for (var i = 0; i < playersAppear.length; i++) {
        if (playersAppear[i].id != this.id) {

            console.log("seePlayer: ", i, playersAppear[i].id);

            playersAppear[i].client.sendToClient(iAppearPacket);
            this.client.sendToClient(playersAppear[i].makeAppearPacket());
        }

    }
};

ServerPlayer.prototype.unseePlayers = function(iHidePAcket, playersRemove) {
    for (var i = 0; i < playersRemove.length; i++) {
        if (playersRemove[i].id != this.id) {
            playersRemove[i].client.sendToClient(iHidePAcket);
            this.client.sendToClient(playersRemove[i].makeHidePacket());
        }
    }
};



ServerPlayer.prototype.switchGridSector = function(gridSector) {

    console.log("Add player to Sector", this.id);

    gridSector.addPlayerToSector(this);

    if (this.currentGridSector) {
        this.currentGridSector.notifyPlayerLeave(this);
    }

    this.currentGridSector = gridSector;
    this.currentGridSector.notifyPlayerEnter(this);

    return gridSector;
};

ServerPlayer.prototype.arraySwitch = function(source, target, untarget) {

    for (var i = 0; i < source.length; i++) {
        if (target.indexOf(source[i]) == -1) {
            target.push(source[i]);
        }

        if (untarget.indexOf(source[i]) != -1) {
            untarget.splice(untarget.indexOf(source[i]), 1);
        }
    }
};

ServerPlayer.prototype.updateVisiblePlayers = function() {

    var playersRemove = [];
    var playersAppear = [];

    var piecesPre = this.otherPlayers;




    this.otherPlayers = [];
    this.currentGridSector.getVisiblePlayers(this.otherPlayers);

    this.arrayDiff(piecesPre,   this.otherPlayers,  playersRemove  );
    this.arrayDiff(this.otherPlayers,  piecesPre,   playersAppear  );

    if (playersRemove.length) {
        var iHidePacket   = this.makeHidePacket();
        this.unseePlayers(iHidePacket, playersRemove);
    }

    if (playersAppear.length) {
 //       console.log(playersAppear[0].id, this.id)
        var iAppearPacket = this.makeAppearPacket();
        this.seePlayers(iAppearPacket, playersAppear);
    }

    this.client.setVisiblePlayers(this.otherPlayers);

};

ServerPlayer.prototype.updateVisiblePieces = function() {

    var piecesRemove = [];
    var piecesAppear = [];

    var piecesPre = this.visiblePieces;
    this.visiblePieces = [];
    this.currentGridSector.getVisibleFromPosition(this.piece.spatial.pos, this.visiblePieces);

    var piecesPost = this.visiblePieces;

    this.arrayDiff(piecesPre,   piecesPost,  piecesRemove  );
    this.arrayDiff(piecesPost,  piecesPre,   piecesAppear  );

    this.arraySwitch(piecesRemove, this.sendUnseeQueue, this.sendSeeQueue);
    this.arraySwitch(piecesAppear, this.sendSeeQueue, this.sendUnseeQueue);

};


ServerPlayer.prototype.prioritizeQueue = function(count, sourcQueue, prioStore) {

    var send = count;

    var tail = [];

    for (var i = 0; i < sourcQueue.length; i++) {
        if (!sourcQueue[i].config.priority) {
            prioStore.push(sourcQueue[i])
        } else {
            tail.push(sourcQueue[i])
        }
    }

    if (send - prioStore.length > 0) {
        send = Math.min(send-prioStore.length, tail.length);
    }

    while (send) {
        send--;
        prioStore.push(tail.pop());
    }

    sourcQueue.length = 0;

    while (tail.length) {
        sourcQueue.push(tail.pop());
    }

};


ServerPlayer.prototype.processSeeSendQueue = function() {

    if (!this.sendSeeQueue.length) return;
    var send = 25;

    var seeNow = [];
    this.prioritizeQueue(send, this.sendSeeQueue, seeNow);

    this.seePieces(this.currentGridSector, seeNow);
};


ServerPlayer.prototype.processUnseeSendQueue = function() {

    if (!this.sendUnseeQueue.length) return;

    var send = 25;

    var unseeNow = [];
    this.prioritizeQueue(send, this.sendUnseeQueue, unseeNow);

    this.unseePieces(this.currentGridSector, unseeNow);
};



ServerPlayer.prototype.notifyCurrentGridSector = function(gridSector) {


	if (!gridSector) {
	//	this.piece.requestTeleport();
        return;
	}

	if (this.currentGridSector != gridSector) {
        return this.switchGridSector(gridSector);
	}

    this.updateVisiblePlayers();

    if (this.sendSeeQueue.length + this.sendUnseeQueue.length < 20) {
        this.updateVisiblePieces();
    }

};

ServerPlayer.prototype.makePacket = function() {
	return this.piece.makePacket();
};

ServerPlayer.prototype.setInputTrigger = function(bool, actionCallback) {
	this.piece.setInputTrigger(bool, actionCallback)
};

ServerPlayer.prototype.setInputVector = function(state) {
	this.piece.setInputVector(state)
};

ServerPlayer.prototype.updatePlayer = function(currentTime) {
	this.piece.processServerState(currentTime);

};