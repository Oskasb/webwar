
var tempVec;
var CnnAPI;

ServerWorld = function(sectorGrid) {
    this.cannonAPI = new CannonAPI();
    CnnAPI = this.cannonAPI;
    this.terrainFunctions = new TerrainFunctions(this.cannonAPI);
    this.sectorGrid = sectorGrid;
    sectorGrid.setServerWorld(this);
	this.players = {};
	this.playerCount = 0;
	this.pieces = [];
    this.terrains = [];
	this.actionHandlers;
	this.pieceCount = 0;

	this.calcVec = new MATH.Vec3(0, 0, 0);

    this.gravityVector = new MATH.Vec3(0, -9, 0);

    var _this = this;
    var broadcast = function(piece) {
        _this.broadcastPieceState(piece);
    };

    this.serverPieceProcessor = new ServerPieceProcessor(broadcast);

    tempVec = new MATH.Vec3(0, 0, 0);
};

ServerWorld.prototype.setPieceSpawner = function(pieceSpawner) {
	this.pieceSpawner = pieceSpawner;
};

ServerWorld.prototype.initWorld = function(clients) {
	this.connectedClients = clients;

    this.cannonAPI.initServerPhysics();

};

ServerWorld.prototype.getPieceById = function(id) {


    if (this.players[id]) {
 //       return this.players[id].piece;
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


ServerWorld.prototype.createWorldPiece = function(pieceType, posx, posz, rot, rotVel, posY) {
    
    piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel, posY);
    
    return piece;
};

ServerWorld.prototype.createWorldTerrainPiece = function(pieceType, elevation, posx, posz, rot, rotVel) {

    var piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel);
    this.addWorldTerrainPiece(piece);
    
    this.terrainFunctions.setupTerrainPiece(piece, elevation);
    
    return piece;
};

ServerWorld.prototype.addWorldTerrainPiece = function(piece) {
    this.terrains.push(piece);
};

ServerWorld.prototype.addWorldPiecePhysics = function(piece) {

    if (piece.physics) {
        CnnAPI.attachPiecePhysics(piece);
    }
    piece.setTerrainFunctions(this.terrainFunctions);
};

ServerWorld.prototype.addWorldPiece = function(piece) {
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

    this.players[playerId].piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);

	delete this.players[playerId];
};


ServerWorld.prototype.playerTakeControlOfPiece = function(piece, playerId, commandModuleId) {

//    this.splicePiece(piece);

    var player = this.players[playerId];

//    var oldPiece = player.piece;
    if (!player) {
        console.log("No player by ID: ", playerId);
        return;
    }
    player.releaseCurrentCommandedPiece();
    player.setPlayerPiece(piece, commandModuleId);

//    this.addWorldPiece(oldPiece);
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

ServerWorld.prototype.applyGravity = function(piece, tpf) {
    piece.spatial.addVelXYZ(0, this.gravityVector.getY()*tpf, 0);


};

ServerWorld.prototype.updateWorldPiece = function(piece, currentTime, tpf) {

    var tpfMod = tpf+(tpf-piece.temporal.stepTime)*0.1;



    if (piece.physics) {
    //    console.log("phys piece")
        this.cannonAPI.updatePhysicalPiece(piece);
        piece.processServerState(currentTime);
    } else {
        piece.processTemporalState(currentTime);
        tempVec.setVec(piece.spatial.vel);
        tempVec.scale(tpfMod);
        tempVec.addVec(piece.spatial.pos);

        var gridSector = this.sectorGrid.getGridSectorForSpatial(piece.spatial);

        if (gridSector) {
            piece.groundPiece = gridSector.groundPiece;
        }





        var groundHeight = 0;
        if (piece.groundPiece) {
            groundHeight = this.terrainFunctions.getTerrainHeightAt(piece.groundPiece, tempVec)
        }

        if (piece.spatial.pos.getY() > groundHeight) {
            this.applyGravity(piece, tpfMod);
        } else {
            piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
        }

    }

    piece.spatial.updateSpatial(tpfMod);

};

ServerWorld.prototype.splicePiece = function(piece) {
    this.pieces.splice(this.pieces.indexOf(piece), 1);
};


ServerWorld.prototype.removePiece = function(piece) {
    var pre = this.pieces.length;

    this.splicePiece(piece);

    if (piece.gridSector) {
        piece.gridSector.deactivatePiece(piece);
    }


    var post = this.pieces.length;

    if (post != pre-1) {
        console.log("Remove piece failed, incorrect array length")
    }

};

var timeouts = [];
var remove = [];

ServerWorld.prototype.updatePieces = function(currentTime, tpf) {


	for (var i = 0; i < this.pieces.length; i++) {

        if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.APPEAR) {
            this.pieces[i].setState(GAME.ENUMS.PieceStates.STATIC);
        }


        if (this.pieces[i].physics) {
    //        this.cannonAPI.updatePhysicalPiece(this.pieces[i]);
    //        this.pieces[i].processServerState(currentTime);
            this.updateWorldPiece(this.pieces[i], currentTime, tpf);
        } else if (Math.abs(this.pieces[i].spatial.vel.getX()) > 0.0001 || Math.abs(this.pieces[i].spatial.vel.getZ()) > 0.0001) {
            this.updateWorldPiece(this.pieces[i], currentTime, tpf);

        } else if (this.pieces[i].groundPiece) {


            if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.SPAWN) {
                this.pieces[i].setState(GAME.ENUMS.PieceStates.APPEAR);
                
                var terrainHeight = this.terrainFunctions.getTerrainHeightAt(this.pieces[i].groundPiece, this.pieces[i].spatial.pos);

                this.pieces[i].spatial.pos.setY(Math.max(terrainHeight, 0));

                piece.processTemporalState(currentTime);
                piece.spatial.updateSpatial(piece.temporal.stepTime);

            }

        }

        if (this.pieces[i].temporal.lifeTime < this.pieces[i].temporal.getAge()) {
            this.pieces[i].setState(GAME.ENUMS.PieceStates.TIME_OUT);
        }


        if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
			timeouts.push(this.pieces[i]);
		}

        if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.REMOVED) {
            remove.push(this.pieces[i]);
        }
	}

	for (var i = 0; i < timeouts.length; i++) {
        this.broadcastPieceState(timeouts[i]);
		this.removePiece(timeouts[i]);
	}

    for (var i = 0; i < remove.length; i++) {
        this.removePiece(remove[i]);
    }

    timeouts.length = 0;
    remove.length = 0;
};

ServerWorld.prototype.removeTerrain = function(piece) {
    this.terrains.splice(this.terrains.indexOf(piece), 1);
    this.broadcastPieceState(piece);
//    piece.setRemoved()
};

ServerWorld.prototype.updateTerrains = function(currentTime) {


};

ServerWorld.prototype.updateSectorStatus = function(player) {
    var sector = player.notifyCurrentGridSector(this.sectorGrid.getGridSectorForSpatial(player.piece.spatial));
    
    if (player.sendSeeQueue.length) {
        player.processSeeSendQueue();
    }
    
    if (player.sendUnseeQueue.length) {
        player.processUnseeSendQueue();
    }
};



ServerWorld.prototype.updatePlayers = function(currentTime, tpf) {
	this.playerCount = 0;
	for (var key in this.players) {

/*
        var piece = this.players[key].piece;

        if (piece.physics) {
            if (piece.physics.body) {

                this.cannonAPI.updatePhysicalPiece(piece);

                piece.processServerState(currentTime);

            }
        } else {
            
            piece.spatial.pos.setY(this.terrainFunctions.getHeightForPlayer(this.players[key], MATH.tempNormal));

            piece.processServerState(currentTime, this.terrainFunctions);
        }
*/
        this.updateSectorStatus(this.players[key]);
		this.players[key].client.notifyDataFrame();
		this.playerCount++;
	}
};


ServerWorld.prototype.tickSimulationWorld = function(currentTime, tpf) {
    this.cannonAPI.updatePhysicsSimulation(currentTime);
    this.updateTerrains(currentTime);

    this.updatePlayers(currentTime);

    this.updatePieces(currentTime, tpf);

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