ServerWorld = function(sectorGrid) {
    this.sectorGrid = sectorGrid;
    sectorGrid.setServerWorld(this);
	this.players = {};
	this.playerCount = 0;
	this.pieces = [];
    this.terrains = [];
	this.stars = [];
	this.actionHandlers;
	this.pieceCount = 0;

	this.calcVec = new MATH.Vec3(0, 0, 0);

    this.gravityVector = new MATH.Vec3(0, -9, 0);

    var _this = this;
    var broadcast = function(piece) {
        _this.broadcastPieceState(piece);
    };

    this.serverPieceProcessor = new ServerPieceProcessor(broadcast);
};

ServerWorld.prototype.setPieceSpawner = function(pieceSpawner) {
	this.pieceSpawner = pieceSpawner;
};

ServerWorld.prototype.initWorld = function(clients) {
	this.connectedClients = clients;
};

ServerWorld.prototype.getPieceById = function(id) {


        if (this.players[id]) {
            return this.players[id].piece;
        }


    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].id == id) {
            return this.pieces[i];
        }
    }

    console.log("getPieceById:",id,"not found")
};


ServerWorld.prototype.applyControlModule = function(sourcePiece, moduleData, action, value) {
//    sourcePiece.pieceControls.setControlState(moduleData, action, value);
    sourcePiece.networkDirty = true;
};

ServerWorld.prototype.createWorldPiece = function(pieceType, posx, posz, rot, rotVel) {
    
    piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel);
    this.addWorldPiece(piece);
    return piece;
};

ServerWorld.prototype.createWorldTerrainPiece = function(pieceType, posx, posz, rot, rotVel) {

    piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel);
    this.addWorldTerrainPiece(piece);
    return piece;
};

ServerWorld.prototype.addWorldTerrainPiece = function(piece) {

    this.broadcastPieceState(piece);
    piece.setState(GAME.ENUMS.PieceStates.MOVING);
    this.terrains.push(piece);
};

ServerWorld.prototype.addWorldPiece = function(piece) {
    
    this.broadcastPieceState(piece);
    piece.setState(GAME.ENUMS.PieceStates.MOVING);
	this.pieces.push(piece);
};

ServerWorld.prototype.getPlayer = function(playerId) {
	return this.players[playerId];
};

ServerWorld.prototype.addPlayer = function(player) {
	this.players[player.id] = player;
};

ServerWorld.prototype.removePlayer = function(playerId) {
    this.players[playerId].currentGridSector.notifyPlayerLeave(this.players[playerId]);
	delete this.players[playerId];
};



ServerWorld.prototype.fetch = function(data) {
	return this.stars;
};

ServerWorld.prototype.broadcastPieceState = function(piece) {
	var packet = piece.makePacket();
	if (!packet) console.log("Bad Packet?", piece);

    if (!piece.recipients) {
        piece.recipients = [];
    }
    
    this.sectorGrid.broadcastToGridSector(piece.spatial, packet, piece.recipients);

//	this.connectedClients.broadcastToAllClients(packet);

    if (piece.getState() == GAME.ENUMS.PieceStates.EXPLODE) {
        piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
        this.removePiece(piece);
    }
};

ServerWorld.prototype.applyGravity = function(piece) {
    piece.spatial.addVelXYZ(0, this.gravityVector.getY()*piece.temporal.stepTime, 0);


};

ServerWorld.prototype.updateWorldPiece = function(piece, currentTime) {

	piece.processTemporalState(currentTime);

    if (piece.spatial.pos.getY() > 0) {
        this.applyGravity(piece);
    }

	piece.spatial.updateSpatial(piece.temporal.stepTime);

    if (piece.spatial.pos.getY() < 0) {
        piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
    }

/*
    if (piece.networkDirty) {
        this.broadcastPieceState(piece);
        piece.networkDirty = false;
    }
*/
};

ServerWorld.prototype.removePiece = function(piece) {
    this.pieces.splice(this.pieces.indexOf(piece), 1);
    this.broadcastPieceState(piece);
    piece.setRemoved()
};

ServerWorld.prototype.updatePieces = function(currentTime) {
	var timeouts = [];

	for (var i = 0; i < this.pieces.length; i++) {
		this.updateWorldPiece(this.pieces[i], currentTime);

		if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
			timeouts.push(this.pieces[i]);
		}
	}

	for (var i = 0; i < timeouts.length; i++) {
		this.removePiece(timeouts[i]);
	}
};

ServerWorld.prototype.removeTerrain = function(piece) {
    this.terrains.splice(this.terrains.indexOf(piece), 1);
    this.broadcastPieceState(piece);
    piece.setRemoved()
};

ServerWorld.prototype.updateTerrains = function(currentTime) {
    var timeouts = [];


    for (var i = 0; i < this.terrains.length; i++) {
        this.updateWorldPiece(this.terrains[i], currentTime);
        if (this.terrains[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
            timeouts.push(this.terrains[i]);
        }
    }

    for (var i = 0; i < timeouts.length; i++) {
        this.removeTerrain(timeouts[i]);
    }

};

ServerWorld.prototype.updateSectorStatus = function(player) {
    var sector = player.notifyCurrentGridSector(this.sectorGrid.getGridSectorForSpatial(player.piece.spatial));

    if (sector) {
    //    console.log("Sector change", sector.row, sector.column);
    }

};

ServerWorld.prototype.updatePlayers = function(currentTime) {
	this.playerCount = 0;
	for (var key in this.players) {
		this.players[key].piece.processServerState(currentTime);
        this.players[key].piece.spatial.glueToGround();
        this.updateSectorStatus(this.players[key]);
		this.players[key].client.notifyDataFrame();
		this.playerCount++;
	}
};


ServerWorld.prototype.tickSimulationWorld = function(currentTime) {
    this.updateTerrains(currentTime);
    this.updatePieces(currentTime);
    this.updatePlayers(currentTime);
    this.serverPieceProcessor.checkProximity(this.players, this.pieces);
};


ServerWorld.prototype.tickNetworkWorld = function() {

    for (var key in this.players) {
    //    if (this.players[key].piece.spatial.vel.getLength() + Math.abs(this.players[key].piece.spatial.rotVel) > 0.01) {
			this.players[key].piece.networkDirty = true;
    //    }
    }

    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].spatial.vel.getLength() + Math.abs(this.pieces[i].spatial.rotVel.getLength()) > 0.01) {
            this.broadcastPieceState(this.pieces[i]);
        }
    }

};