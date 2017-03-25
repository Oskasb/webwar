ServerPlayer = function(pieceType, clientId, client, simTime) {

	if (!client) {
		console.log("Bad ConnectedClient!", clientId);
		return;
	}

	this.currentGridSector = null;
	
	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

	this.configs = {};

	var piece;

	var broadcast = function(piecePacket) {
		if (!client) {
			console.log("Bad ConnectedClient!", piece.id, piecePacket);
			return;
		}
		client.broadcastToVisible(piecePacket);
	};
	
	piece = new GAME.Piece(pieceType, this.id, simTime, Number.MAX_VALUE, broadcast);
	this.piece = piece;

	this.piece.networkDirty = true;
	this.piece.setName(clientId);
	client.attachPlayer(this);

    this.visiblePieces = [];

    this.sendSeeQueue = [];
    this.sendUnseeQueue = [];

};


ServerPlayer.prototype.applyPieceConfig = function(pieceTypeConfigs) {
    if(!this.piece) {
        console.log('Bad Server Player');
        return
    }

	this.configs = pieceTypeConfigs;
};

ServerPlayer.prototype.makeAppearPacket = function() {
    var iAppearPacket = this.piece.makePacket();
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
        this.client.sendToClient(gridSector.makeAppearPacket(piecesAppear[i]));
    }
};

ServerPlayer.prototype.unseePieces = function(gridSector, piecesRemove) {
    for (var i = 0; i < piecesRemove.length; i++) {
        this.client.sendToClient(gridSector.makeHidePacket(piecesRemove[i]));
    }
};

ServerPlayer.prototype.seePlayers = function(iAppearPacket, playersAppear) {
    for (var i = 0; i < playersAppear.length; i++) {
        playersAppear[i].client.sendToClient(iAppearPacket);
        this.client.sendToClient(playersAppear[i].makeAppearPacket());
    }
};

ServerPlayer.prototype.unseePlayers = function(iHidePAcket, playersRemove) {
    for (var i = 0; i < playersRemove.length; i++) {
        playersRemove[i].client.sendToClient(iHidePAcket);
        this.client.sendToClient(playersRemove[i].makeHidePacket());
    }
};



ServerPlayer.prototype.switchGridSector = function(gridSector) {
    var visiblePre = [];
    var visiblePost = [];

    var playersAppear = [];
    var playersRemove = [];

    var piecesPre = [];
    var piecesPost = [];

    var piecesRemove = [];
    var piecesAppear = [];

    gridSector.addPlayerToSector(this);

    if (this.currentGridSector) {

    //    this.currentGridSector.getActivePieces(piecesPre);
        this.currentGridSector.notifyPlayerLeave(this);

        this.currentGridSector.getVisiblePlayers(visiblePre);
    }


    this.currentGridSector = gridSector;
    this.currentGridSector.getVisiblePlayers(visiblePost);

    this.currentGridSector.notifyPlayerEnter(this);
 //   this.currentGridSector.getActivePieces(piecesPost);

    this.arrayDiff(visiblePre,  visiblePost, playersRemove );

    this.arrayDiff(visiblePost, visiblePre,  playersAppear );

 //   this.arrayDiff(piecesPre,   piecesPost,  piecesRemove  );
 //  this.arrayDiff(piecesPost,  piecesPre,   piecesAppear  );

    var iHidePacket   = this.makeHidePacket();
    var iAppearPacket = this.makeAppearPacket();

    this.unseePlayers(iHidePacket, playersRemove);
    this.seePlayers(iAppearPacket, playersAppear);
 //   this.unseePieces(gridSector, piecesRemove);

    this.client.setVisiblePlayers(visiblePost);

    //       console.log("Player diff APP, REM", playersAppear.length, playersRemove.length);

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
		this.piece.requestTeleport();
        return;
	}

	if (this.currentGridSector != gridSector) {
        return this.switchGridSector(gridSector);
	}

    this.updateVisiblePieces();

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