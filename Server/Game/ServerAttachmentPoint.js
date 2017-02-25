

ServerAttachmentPoint = function(piece, ap, index, conf, gameConfigs, serverModuleCallbacks) {
    this.slot = ap.slot;
    this.point_id = ap.point_id;
    this.transform = ap.transform;
    this.index = index;
    this.piece = piece;
    var module = {};

    this.calcVec = new MATH.Vec3(0, 0, 0);
    
    var config = gameConfigs.MODULE_DATA[conf.default_modules[index]];

    for (var key in config) {
        module[key] = config[key];
    }

    for (key in ap) {
        module[key] = ap[key];
    }

    this.moduleConfig = module;
    
    conf.modules.push(module);


    this.parent_id = ap.parent;
    piece.attachmentPoints[index] = this;
    this.parentIndex;


    var module = new ServerModule(this, this.moduleConfig.id, this.moduleConfig, piece, serverModuleCallbacks);
    module.setModuleState(this.moduleConfig.initState);
    piece.modules[index] = module;

    this.module = module;

    this.updateParentIndex();
};


ServerAttachmentPoint.prototype.getOffsetPosition = function(vec3) {

    if (!this.transform) {
        return vec3;
    }

    this.updateParentIndex();

    if (this.transform.pos) {
        vec3.setArray(this.transform.pos);  
    } else {
        vec3.setXYZ(0, 0, 0);
    }

    if (this.transform.rot) {
        if (this.transform.rot[0]) {
            var pitchMod = this.transform.rot[0];            
            if (this.module.data.applies.applyPitch) {
                pitchMod = MATH.addAngles(pitchMod, this.module.state.value);
            }
            vec3.rotateX(pitchMod);
        }
        
        if (this.transform.rot[1]) {
            var yawMod = this.transform.rot[1];
            if (this.module.data.applies.applyYaw) {
                yawMod = MATH.addAngles(yawMod, this.module.state.value);
            }
            vec3.rotateY(yawMod);
        }
        
        if (this.transform.rot[2]) {
            vec3.rotateZ(this.transform.rot[2]);
        }
    }

    if (this.parentIndex) {
        this.piece.attachmentPoints[this.parentIndex].getOffsetPosition(this.calcVec);
        vec3.addVec(this.calcVec);
    }
    
    return vec3;
};

ServerAttachmentPoint.prototype.updateParentIndex = function() {

    if (this.parent_id) {
        for (var i = 0; i < this.piece.attachmentPoints.length; i++) {
            if (this.piece.attachmentPoints[i].point_id = this.parent_id) {
                this.parentIndex = i;
            }
        }
    }
};



ServerAttachmentPoint.prototype.getAttachmentModuleState = function() {

};


