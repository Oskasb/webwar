GridSector = function(minX, minY, size, row, column, gridIndex, serverWorld, sectorConfigs) {

    this.terrainFunctions = serverWorld.terrainFunctions;

    this.serverWorld = serverWorld;

    this.sectorConfig = null;

    this.sectorData = {
        minX : minX,
        minY : minY,
        size : size,
        config:this.sectorConfig,
        presentPlayers:0
    };

    this.row = row;
    this.column = column;
    this.gridIndex = gridIndex;
    
    this.activeSectorPlayers = [];
    
    this.neighborSectors = [];

    this.visiblePlayers = [];

    this.activeSectorPieces = [];

    this.groundPiece;
    
    this.groundPhysics = false;

    this.configsUpdated(sectorConfigs);

    this.normalStore = new MATH.Vec3(0, 0, 0);
    this.calcVec = new MATH.Vec3(0, 0, 0);
};


GridSector.prototype.makeAppearPacket = function(piece) {
    piece.spatial.updateSpatial(piece.temporal.stepTime);
    var iAppearPacket = piece.makePacket();
    iAppearPacket.data.state = GAME.ENUMS.PieceStates.APPEAR;
    return iAppearPacket;
};

GridSector.prototype.makeHidePacket = function(piece) {
    var iHidePacket = piece.makePacket();
    iHidePacket.data.state = GAME.ENUMS.PieceStates.HIDE;
    return iHidePacket;

};

GridSector.prototype.activateSector = function() {



    for (var i = 0; i < this.sectorConfig.ground.length; i++) {
        this.spawnGround(this.sectorConfig.ground[i])
    }

    if (this.sectorConfig.buildings) {
        for (var i = 0; i < this.sectorConfig.buildings.length; i++) {
            this.spawnSelection(this.sectorConfig.buildings[i])
        }
    }
    
    
    for (var i = 0; i < this.sectorConfig.spawn.length; i++) {
        this.spawnSelection(this.sectorConfig.spawn[i])
    }


    if (!this.groundPhysics) {
        this.terrainFunctions.addTerrainToPhysics(this.groundPiece);
        this.groundPhysics = true;
    }
    this.terrainFunctions.enableTerrainPhysics(this.groundPiece);
    this.groundPiece.networdDirty = true;
    this.activeSectorPieces.push(this.groundPiece);
};

GridSector.prototype.spawnGround = function(spawnData) {

    
    if (!this.groundPiece) {
    var posx = this.sectorData.minX // + 0.5 * this.sectorData.size;
    var posz = this.sectorData.minY // + 0.5 * this.sectorData.size;
    var rot = 0; //Math.random()*MATH.TWO_PI;
    var rotVel = 0; // (Math.random()-0.5)*3;
        var piece = this.groundPiece || this.serverWorld.createWorldTerrainPiece(spawnData.pieceType, posx, posz, rot, rotVel);
        this.groundPiece = piece;
    //    this.stitchTerrain();

        piece.spatial.updateSpatial(10);
        piece.setState(GAME.ENUMS.PieceStates.APPEAR);

    }



};

GridSector.prototype.stitchTerrain = function() {
    for (var i = 0; i < this.neighborSectors.length; i++) {
        this.stitchTerrainToNeighbor(this.neighborSectors[i]);
    }
};

GridSector.prototype.stitchTerrainToNeighbor = function(neightborSector) {
    
    if (!this.groundPiece) return;
    if (!neightborSector.groundPiece) return;

    var colOffset = neightborSector.column - this.column;
    var rowOffset = neightborSector.row - this.row;

    var vertsCenter = this.terrainFunctions.getPieceTerrainModule(this.groundPiece).state.value;
    var vertsNeighbor = this.terrainFunctions.getPieceTerrainModule(neightborSector.groundPiece).state.value;

    this.terrainFunctions.stitchEdgeVertices(vertsCenter, vertsNeighbor, colOffset, rowOffset);
};

var pos = [];

GridSector.prototype.sectorSeed = function(seed) {
    seed = this.activeSectorPieces.length + MATH.subAngles(Math.sqrt(seed*2.5162), MATH.TWO_PI) * 1.151231;
    return (seed * ((this.sectorData.minX*1.52123)+this.sectorData.minY*5.61231) + seed * this.sectorData.minY+seed+Math.cos(seed))*999.5121;
};

GridSector.prototype.sectorRandom = function(seed) {
    return MATH.sillyRandom(this.sectorSeed(seed));
};


GridSector.prototype.getRandomPointInSector = function(margin, nmStore, baseSeed) {

    pos[0] = margin + this.sectorData.minX + this.sectorRandom(baseSeed*0.38) * (this.sectorData.size - margin*2);
    pos[2] = margin + this.sectorData.minY + this.sectorRandom(baseSeed*0.77) * (this.sectorData.size - margin*2);
    pos[1] = this.terrainFunctions.getTerrainHeightAt(this.groundPiece, {data:[pos[0], 0, pos[2]]}, nmStore);
    return pos
};

var tries = 0;
var maxTries = 500;
var normalLimit = 0.95;

GridSector.prototype.checkPosForLegit = function(margin, nmStore, baseSeed) {

    pos = this.getRandomPointInSector(margin, nmStore, baseSeed);
    this.calcVec.setArray(pos);

    tries++;

    for (var i = 0; i < this.activeSectorPieces.length; i++) {
        var distance = this.activeSectorPieces[i].spatial.pos.getDistance(this.calcVec) ;
        if ((2 * distance - (2 * distance * (tries/maxTries))) < this.activeSectorPieces[i].config.size + margin  && tries < maxTries) {
            baseSeed += 8.612;
            return this.checkPosForLegit(margin, nmStore, baseSeed)
        }
    }

    if (nmStore.getY() < (normalLimit - (normalLimit * (tries/maxTries))) && tries < maxTries) {
        baseSeed += 4.212;
        return this.checkPosForLegit(margin, nmStore, baseSeed)
    }

    return pos
};


GridSector.prototype.getLegitNewPointInSector = function(margin) {

    var baseSeed = 3612.2;
    tries = 0;
    pos = this.checkPosForLegit(margin * 3, this.normalStore, baseSeed);
    return pos
};




GridSector.prototype.spawnRandomSectorPiece = function(spawnData, count, amount) {



    var rotVel = 0;

    var rot = this.sectorRandom(512)*MATH.TWO_PI;

    var piece = this.serverWorld.createWorldPiece(spawnData.pieceType, 0, 0, rot, rotVel, 0);
  //  piece.spatial.updateSpatial(10);

    pos = this.getLegitNewPointInSector(piece.config.size + 5);

    piece.spatial.pos.setXYZ(pos[0], pos[1], pos[2]);

    piece.setState(GAME.ENUMS.PieceStates.SPAWN);
    piece.groundPiece = this.groundPiece;
    
    
    if (spawnData.flatten) {
        this.flattenTerrainForPiece(piece, piece.config.size);
    }
    
    this.activeSectorPieces.push(piece)

};

GridSector.prototype.flattenTerrainForPiece = function(piece, reach) {
    
 
    this.terrainFunctions.setTerrainHeightAt(this.groundPiece, piece.spatial.pos, reach);

};


GridSector.prototype.spawnSelection = function(spawnData) {

    var amount = spawnData.min + Math.floor(this.sectorRandom(213)* spawnData.max);

    for (var i = 0; i < amount; i++) {
        this.spawnRandomSectorPiece(spawnData, i, amount);
    }
};


GridSector.prototype.deactivateSector = function() {

    for (var i = 0; i < this.activeSectorPieces.length; i++) {
        var piece = this.activeSectorPieces[i];
        if (piece) {
            piece.setState(GAME.ENUMS.PieceStates.TIME_OUT)
        }
    }

    this.activeSectorPieces.length = 0;
    this.terrainFunctions.disableTerrainPhysics(this.groundPiece);
};


GridSector.prototype.addNeighborSector = function(neightborSector) {
        this.neighborSectors.push(neightborSector);
};


GridSector.prototype.notifyPlayerLeave = function(player) {



    this.activeSectorPlayers.splice(this.activeSectorPlayers.indexOf(player), 1);
    this.sectorData.presentPlayers = this.activeSectorPlayers.length;


    // clears the sector, makes it glitch... out and back
 //   for (var i = 0; i < this.activeSectorPieces.length; i++) {
//        player.client.sendToClient(this.makeHidePacket(this.activeSectorPieces[i]));
 //   }

    this.visiblePlayers.length = 0;

    this.getVisiblePlayers(this.visiblePlayers);

    if (this.visiblePlayers.length == 0) {
        this.deactivateSector()
    }

    this.notifyNeighborSectors();

};

GridSector.prototype.getVisiblePlayers = function(store) {

    for (var i = 0; i < this.neighborSectors.length; i++) {
        for (var j = 0; j < this.neighborSectors[i].activeSectorPlayers.length; j++) {
            if (store.indexOf(this.neighborSectors[i].activeSectorPlayers[j]) == -1) {
                store.push(this.neighborSectors[i].activeSectorPlayers[j]);
            }

        }
    }

    for (var j = 0; j < this.activeSectorPlayers.length; j++) {
        if (store.indexOf(this.activeSectorPlayers[j]) == -1) {
            store.push(this.activeSectorPlayers[j]);
        }
    }
};

GridSector.prototype.neighborActive = function() {

    this.visiblePlayers.length = 0;

    this.getVisiblePlayers(this.visiblePlayers);


    if (this.visiblePlayers.length == 0) {

        this.deactivateSector();

    } else {

        if (!this.activeSectorPieces.length) {
            this.activateSector();
        }

        for (var i = 0; i < this.visiblePlayers.length; i++) {
            this.playerSeeSectorPieces(this.visiblePlayers[i]);
        }
    }

};

GridSector.prototype.notifyNeighborSectors = function() {

    for (var i = 0; i < this.neighborSectors.length; i++) {
        this.neighborSectors[i].neighborActive();
    }

};

GridSector.prototype.playerSeeSectorPieces = function(player) {

    for (var i = 0; i < this.activeSectorPieces.length; i++) {
        if (!this.activeSectorPieces[i].removed) {
            player.client.sendToClient(this.makeAppearPacket(this.activeSectorPieces[i]));
        }
    }

};

GridSector.prototype.addPlayerToSector = function(player) {
    this.activeSectorPlayers.push(player);
};


GridSector.prototype.notifyPlayerEnter = function(player) {

    if (this.activeSectorPieces.length == 0) {
        this.activateSector()
    }

    
    this.notifyNeighborSectors();

    this.sectorData.presentPlayers = this.activeSectorPlayers.length;
    this.playerSeeSectorPieces(player);
};


GridSector.prototype.sendPacketToVisiblePlayers = function(packet, recipients) {

    for (var i = 0; i < recipients.length; i++) {
        recipients[i].client.sendToClient(packet);
    }
};

GridSector.prototype.sectorBasedBroadcast = function(packet, recipients) {

    this.getVisiblePlayers(recipients);
    this.sendPacketToVisiblePlayers(packet, recipients);
};


GridSector.prototype.configsUpdated = function(sectorConfigs) {

  //  this.groundPiece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
  //  this.groundPiece = null;

    var data = sectorConfigs.data;



    var useData = data[0];

    var weightsum = 0;

    for (var i = 0; i < data.length; i++) {
        weightsum += data[i].weight;
    }

    var selection = this.sectorRandom(weightsum*9123.1521)*weightsum;
    
    for (var i = 0; i < data.length; i++) {

        if (data[i].weight > selection) {
            useData = data[i];
            i = data.length+1;
        } else {
            selection -= data[i].weight;
        }
    }
    

    this.sectorConfig = useData;
    this.sectorData.sectorConfig = this.sectorConfig;
};






