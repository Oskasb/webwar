GridSector = function(minX, minY, size, row, column, gridIndex, serverWorld, sectorConfigs) {

    this.terrainFunctions = new TerrainFunctions();

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

    this.configsUpdated(sectorConfigs);
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

    for (var i = 0; i < this.sectorConfig.spawn.length; i++) {
        this.spawnSelection(this.sectorConfig.spawn[i])
    }

};

GridSector.prototype.spawnGround = function(spawnData) {

    
    
    if (!this.groundPiece) {
    var posx = this.sectorData.minX // + 0.5 * this.sectorData.size;
    var posz = this.sectorData.minY // + 0.5 * this.sectorData.size;
    var rot = 0; //Math.random()*MATH.TWO_PI;
    var rotVel = 0; // (Math.random()-0.5)*3;
        var piece = this.groundPiece || this.serverWorld.createWorldTerrainPiece(spawnData.pieceType, posx, posz, rot, rotVel);

        piece.spatial.updateSpatial(10);
        piece.setState(GAME.ENUMS.PieceStates.APPEAR);
        this.groundPiece = piece;
    }

    this.activeSectorPieces.push(this.groundPiece);

};

GridSector.prototype.spawnSelection = function(spawnData) {

    var amount = spawnData.min + Math.floor(Math.random()* spawnData.max);

    var terrainModule = this.terrainFunctions.getPieceTerrainModule(this.groundPiece);

    for (var i = 0; i < amount; i++) {
        var posx = this.sectorData.minX + ((Math.random()*0.98)+0.01) * this.sectorData.size;
        var posz = this.sectorData.minY + ((Math.random()*0.98)+0.01) * this.sectorData.size;
        var rot = 0; //Math.random()*MATH.TWO_PI;
        var rotVel = 0; // (Math.random()-0.5)*3;
        
        var posY = this.terrainFunctions.getTerrainHeightAt(this.groundPiece, {data:[posx, 0, posz]});
        
        var piece = this.serverWorld.createWorldPiece(spawnData.pieceType, posx, posz, rot, rotVel, posY);

        piece.spatial.updateSpatial(10);
        piece.setState(GAME.ENUMS.PieceStates.SPAWN);
        piece.groundPiece = this.groundPiece;
        this.activeSectorPieces.push(piece)
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

    var selection = Math.random()*weightsum;
    
    for (var i = 0; i < data.length; i++) {

        if (data[i].weight < selection) {
            useData = data[i];
            i = data.length+1;
        } else {
            selection += data[i].weight;
        }
    }
    

    this.sectorConfig = useData;
    this.sectorData.sectorConfig = this.sectorConfig;
};






