ServerAttachmentPoint = function(piece, ap, index, conf, gameConfigs, serverModuleCallbacks) {
    this.slot = ap.slot;
    this.index = index;
    var module = {};

    var config = gameConfigs.MODULE_DATA[conf.default_modules[index]];

    for (var key in config) {
        module[key] = config[key];
    }

    for (key in ap) {
        module[key] = ap[key];
    }

    this.moduleConfig = module;
    
    conf.modules.push(module);


    piece.attachmentPoints[index] = this;

    var module = new ServerModule(this.moduleConfig.id, this.moduleConfig, piece, serverModuleCallbacks);
    module.setModuleState(this.moduleConfig.initState);
    piece.modules[index] = module;
    
};

ServerAttachmentPoint.prototype.attachModuleToAttachmentPoint = function(serverModule) {

    
};

ServerAttachmentPoint.prototype.setApplyCallback = function(callback) {

};



ServerAttachmentPoint.prototype.getAttachmentModuleState = function() {

};


