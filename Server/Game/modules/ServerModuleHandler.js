ServerModuleHandler = function(serverModuleFunctions) {
    this.serverModuleFunctions = serverModuleFunctions;
};

ServerModuleHandler.prototype.initModuleControls = function(serverGameMain) {
    this.serverGameMain = serverGameMain;
};



ServerModuleHandler.prototype.handleModuleControlAction = function(piece, actionData) {
    if (actionData.vector) {
        piece.setInputVector(actionData.vector.state);
        piece.networkDirty = true;
        return;
    }

    console.log("Module Action:", piece.id, actionData);
    for (var key in actionData) {
        piece.setModuleState(key, actionData[key]);
    }
    
    piece.networkDirty = true;
};

