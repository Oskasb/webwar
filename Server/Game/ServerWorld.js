
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


ServerWorld.prototype.createWorldPiece = function(pieceType, posx, posz, rot, rotVel, posY) {


        piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel, posY);



    this.addWorldPiece(piece);
    return piece;
};

ServerWorld.prototype.createWorldTerrainPiece = function(pieceType, elevation, posx, posz, rot, rotVel) {

    var piece = this.pieceSpawner.spawnWorldPiece(pieceType, posx, posz, rot, rotVel);
    this.addWorldTerrainPiece(piece);
    
    this.terrainFunctions.setupTerrainPiece(piece, elevation);
    
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
    if (piece.physics) {
        CnnAPI.attachPiecePhysics(piece);
    }
    piece.setTerrainFunctions(this.terrainFunctions);
	this.pieces.push(piece);
};

ServerWorld.prototype.getPlayer = function(playerId) {
	return this.players[playerId];
};

ServerWorld.prototype.addPlayer = function(player) {
    if (player.piece.physics) {
        CnnAPI.attachPiecePhysics(player.piece);
    }

    player.piece.setTerrainFunctions(this.terrainFunctions);
    player.piece.teleportRandom();
	this.players[player.id] = player;
};

ServerWorld.prototype.removePlayer = function(playerId) {
    this.players[playerId].currentGridSector.notifyPlayerLeave(this.players[playerId]);
    
    if (this.players[playerId].piece.physics) {
        this.cannonAPI.removePhysicsPiece(this.players[playerId].piece)
    }
    
    
    
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

    if (piece.physics) {
    //    console.log("phys piece")
        this.cannonAPI.updatePhysicalPiece(piece);
    //    piece.setState(GAME.ENUMS.PieceStates.MOVING);
    //    piece.networkDirty = true;
    //    this.broadcastPieceState(piece);
    } else {
        if (piece.spatial.pos.getY() > 0) {
            this.applyGravity(piece);
        }


        if (piece.spatial.pos.getY() < 0) {
            piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
        }
    }
    piece.spatial.updateSpatial(piece.temporal.stepTime);
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


        if (this.pieces[i].physics) {
            this.cannonAPI.updatePhysicalPiece(this.pieces[i]);
        };


        if (this.pieces[i].spatial.vel.getX() > 0.05 || this.pieces[i].spatial.vel.getZ() > 0.05) {
            this.updateWorldPiece(this.pieces[i], currentTime);
        } else if (this.pieces[i].groundPiece) {

            if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.SPAWN) {
                this.pieces[i].setState(GAME.ENUMS.PieceStates.APPEAR)
                var y = this.pieces[i].spatial.pos.getY();
                this.pieces[i].spatial.pos.setY(this.terrainFunctions.getTerrainHeightAt(this.pieces[i].groundPiece, this.pieces[i].spatial.pos));
                piece.processTemporalState(currentTime);
                piece.spatial.updateSpatial(piece.temporal.stepTime);

                if (this.pieces[i].spatial.posY() != y) {
                    this.broadcastPieceState(this.pieces[i]);
                };

            }

        }

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
//    piece.setRemoved()
};

ServerWorld.prototype.updateTerrains = function(currentTime) {
    //var timeouts = [];


    for (var i = 0; i < this.terrains.length; i++) {
    //    this.updateWorldPiece(this.terrains[i], currentTime);
        if (this.terrains[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
    //        timeouts.push(this.terrains[i]);
        }
    }

  //  for (var i = 0; i < timeouts.length; i++) {
    //    this.removeTerrain(timeouts[i]);
  //  }

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
        var piece = this.players[key].piece;

        if (piece.physics.body) {

            //    console.log("Player Body")
            this.cannonAPI.updatePhysicalPiece(piece);
        //    piece.setState(GAME.ENUMS.PieceStates.MOVING);
        //    piece.networkDirty = true;
            //    this.broadcastPieceState(piece);
            piece.processServerState(currentTime);
    //        console.log(piece.spatial.posX(), piece.spatial.posY(), piece.spatial.posZ()  )
        } else {


            piece.spatial.pos.setY(this.terrainFunctions.getHeightForPlayer(this.players[key], MATH.tempNormal));
        //    piece.spatial.alignToGroundNormal(MATH.tempNormal);

            piece.processServerState(currentTime, this.terrainFunctions);
        }

        //   var currentY = this.terrainFunctions.getHeightForPlayer(this.players[key]);

		
                
    //    this.players[key].piece.spatial.glueToGround();
        this.updateSectorStatus(this.players[key]);
		this.players[key].client.notifyDataFrame();
		this.playerCount++;
	}
};


ServerWorld.prototype.tickSimulationWorld = function(currentTime) {
    this.cannonAPI.updatePhysicsSimulation(currentTime);
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