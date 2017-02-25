PieceSpawner = function(serverWorld, serverModuleCallbacks) {
    this.serverWorld = serverWorld;
    this.serverModuleCallbacks;
    this.pieceCount = 0;
    this.calcVec = new MATH.Vec3(0, 0, 0);
    this.calcVec2 = new MATH.Vec3(0, 0, 0);
    this.gameConfigs;
};


PieceSpawner.prototype.setServerModuleCallbacks = function(serverModuleCallbacks) {
    this.serverModuleCallbacks = serverModuleCallbacks;
};


PieceSpawner.prototype.notifyConfigsUpdated = function(gameConfigs, players) {
    //   console.log("Module data updated...", gameConfigs.PIECE_DATA);

    for (var key in players) {

        if (gameConfigs.PIECE_DATA) {
            players[key].applyPieceConfig(this.buildPieceData(players[key].piece.type, gameConfigs));
        }

        console.log("Notify player...", key)
        players[key].client.sendToClient({id:'updateGameData', data:{clientId:players[key].client.id, gameData:gameConfigs}});
        players[key].client.notifyDataFrame();
    }
};

PieceSpawner.prototype.buildPieceData = function(pieceType, gameConfigs) {

    var config = {};

    for (var key in gameConfigs.PIECE_DATA[pieceType]) {
        config[key] = gameConfigs.PIECE_DATA[pieceType][key];
    }

    config.modules = [];

    return config;
};



PieceSpawner.prototype.addAttachmentPoints = function(piece, conf, gameConfigs) {
    for (var i = 0; i < conf.attachment_points.length; i++) {
        new ServerAttachmentPoint(piece, conf.attachment_points[i], i, conf, gameConfigs, this.serverModuleCallbacks)
    }
};



PieceSpawner.prototype.spawnPlayerPiece = function(client, data, clients, simulationTime, gameConfigs) {
    this.pieceCount++;
    this.gameConfigs = gameConfigs;
    
    var player = this.serverWorld.getPlayer(data.clientId);
    if (player) {
        console.log("Player already registered", data.clientId);
    } else {
        player = new ServerPlayer('player_ship', data.clientId, clients.getClientById(data.clientId), simulationTime);
    }
    player.piece.setName(data.name);
    
    var config = this.buildPieceData(player.piece.type, gameConfigs);

    player.applyPieceConfig(config);
    player.piece.applyConfig(config);


    this.addAttachmentPoints(player.piece, config, gameConfigs);

    return player;
};



PieceSpawner.prototype.spawnPhysicsPiece = function(pieceType, posx, posz, rot, rotVel, posY) {
    this.pieceCount++;

    var piece = new GAME.Piece(pieceType, pieceType+' '+this.pieceCount, new Date().getTime(), Number.MAX_VALUE);
    var config = this.buildPieceData(pieceType, this.gameConfigs);

    piece.applyConfig(config);

    this.addAttachmentPoints(piece, config, this.gameConfigs);

    piece.setState(GAME.ENUMS.PieceStates.SPAWN);

    return piece;

};

PieceSpawner.prototype.spawnWorldPiece = function(pieceType, posx, posz, rot, rotVel, posY) {
    this.pieceCount++;
    
    var piece = new GAME.Piece(pieceType, pieceType+' '+this.pieceCount, new Date().getTime(), Number.MAX_VALUE);
    var config = this.buildPieceData(pieceType, this.gameConfigs);

    piece.applyConfig(config);

    this.addAttachmentPoints(piece, config, this.gameConfigs);

    piece.setState(GAME.ENUMS.PieceStates.SPAWN);
    piece.spatial.setPosXYZ(posx, posY, posz);
    piece.spatial.setYaw(rot);
    piece.spatial.setYawVel(rotVel);
    return piece;
    
};



PieceSpawner.prototype.spawnBullet = function(sourcePiece, cannonModuleData, now, pieceData, gameConfigs) {
    this.pieceCount++;

    var apply = cannonModuleData.applies;
    var bulletConfig = pieceData[apply.bullet];


    var bullet = new GAME.Piece(apply.bullet, apply.bullet+' '+this.pieceCount, now, apply.lifeTime);
    bullet.registerParentPiece(sourcePiece);


    var conf = {};

    for (var key in bulletConfig) {
        conf[key] = bulletConfig[key];
    }
    conf.modules = [];


    bullet.applyConfig(conf);

    this.addAttachmentPoints(bullet, conf, gameConfigs);


    bullet.spatial.setSpatial(sourcePiece.spatial);

    this.calcVec.setVec(sourcePiece.spatial.vel);
    this.calcVec.scale(sourcePiece.temporal.stepTime * 3);

    bullet.spatial.pos.addVec(this.calcVec);


    this.calcVec2.setXYZ(0, 0, 0);
    
    if (apply.yaw_module) {
        var yawModule = sourcePiece.getModuleById(apply.yaw_module);
        bullet.spatial.addYaw(yawModule.state.value);
        if (!apply.pitch_module) {
            var ap = yawModule.getAttachmentPoint(); 
            ap.getOffsetPosition(this.calcVec2);
        }
    }


    if (apply.pitch_module) {
        var pitchModule = sourcePiece.getModuleById(apply.pitch_module);
        bullet.spatial.addPitch(pitchModule.state.value);
        
        var ap = pitchModule.getAttachmentPoint();
        ap.getOffsetPosition(this.calcVec2);
    }


    this.calcVec2.rotateX(sourcePiece.spatial.pitch());
    this.calcVec2.rotateY(sourcePiece.spatial.yaw());
    this.calcVec2.rotateZ(sourcePiece.spatial.roll());


    bullet.spatial.pos.addVec(this.calcVec2);

    bullet.setState(GAME.ENUMS.PieceStates.SPAWN);

    bullet.spatial.updateSpatial(sourcePiece.temporal.stepTime * 10);

    bullet.spatial.setYawVel(0);


    bullet.spatial.getForwardVector(this.calcVec);
    this.calcVec.scale(apply.barrel_length);
    bullet.spatial.pos.addVec(this.calcVec);

    bullet.pieceControls.actions.applyForward = apply.exitVelocity;
    bullet.applyForwardControl(MODEL.ReferenceTime);
    return bullet;

};


