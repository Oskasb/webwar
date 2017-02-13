ServerModuleCallbacks = function(serverGameMain, serverWorld, pieceSpawner) {
    this.serverGameMain = serverGameMain;
    this.serverWorld = serverWorld;
    this.pieceSpawner = pieceSpawner;
    
    this.serverModuleFunctions = new ServerModuleFunctions(serverGameMain, serverWorld, pieceSpawner);
    
};

ServerModuleCallbacks.prototype.getCallback = function(callback) {

    
    
};



ServerModuleCallbacks.prototype.updateModuleState = function(piece, value, moduleData) {

};

ServerModuleCallbacks.prototype.fireCannon = function(piece, value, moduleData) {

    var bulletPiece = this.pieceSpawner.spawnBullet(piece, moduleData, this.serverGameMain.getNow(), this.serverGameMain.gameConfigs.PIECE_DATA, this.serverGameMain.gameConfigs);
    this.serverWorld.addWorldPiece(bulletPiece);
};

ServerModuleCallbacks.prototype.applyControl = function(piece, value, moduleData) {
//    this.serverWorld.applyControlModule(piece, moduleData, value);
};

ServerModuleCallbacks.prototype.applyPitch = function(piece, value, moduleData) {
    this.serverModuleFunctions.applyModulePitch(piece, moduleData, value);
};

ServerModuleCallbacks.prototype.applyYaw = function(piece, value, moduleData) {
    this.serverModuleFunctions.applyModuleYaw(piece, moduleData, value);
};

ServerModuleCallbacks.prototype.requestTeleport = function(piece, action, value, moduleData) {
    piece.requestTeleport();
};

ServerModuleCallbacks.prototype.applyForward = function(piece, value, moduleData) {
//    this.serverWorld.applyControlModule(piece, moduleData, value);
};