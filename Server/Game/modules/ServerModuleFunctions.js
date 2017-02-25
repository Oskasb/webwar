ServerModuleFunctions = function(serverGameMain, serverWorld, pieceSpawner) {
    this.serverGameMain = serverGameMain;
    this.serverWorld = serverWorld;
    this.pieceSpawner = pieceSpawner;
    this.serverPieceProcessor = this.serverWorld.serverPieceProcessor;
};

ServerModuleFunctions.prototype.clampModuleRotation = function(module, angle, clamp) {
    return MATH.radialClamp(angle , module.state.value - clamp, module.state.value + clamp);
};



ServerModuleFunctions.prototype.applyModulePitch = function(sourcePiece, moduleData) {

    if (!moduleData.applies.master_module_id) {
        console.log("No master module for rotate function");
        return;
    }

    var target = this.serverWorld.getPieceById(sourcePiece.getModuleById(moduleData.applies.master_module_id).state.value);

    var clamp = moduleData.applies.rotation_velocity * moduleData.applies.cooldown;

    if (target === sourcePiece) {
        sourcePiece.getModuleById(sourcePiece.getModuleById(moduleData.applies.master_module_id).data.applies.toggle_attack_module_id).state.value = false;
    };

    var diff = 0;
    var angle = 0;
    if (!target) {
        angle = this.clampModuleRotation(sourcePiece.getModuleById(moduleData.id), angle, clamp);
        sourcePiece.setModuleState(moduleData.id, angle);
        diff = angle;
    } else {

        if (moduleData.id == 'cannon_pitch') {

            var pitchAimModuleID = sourcePiece.getModuleById(moduleData.applies.master_module_id).data.applies.pitch_aim_module_id;
            var targetAngle = this.serverPieceProcessor.getDistanceSquaredFromPieceToTarget(sourcePiece, target)*0.000005;

            angle = this.clampModuleRotation(sourcePiece.getModuleById(moduleData.id), targetAngle, clamp);
            angle = MATH.clamp(angle, moduleData.applies.rotation_min, moduleData.applies.rotation_max)

            sourcePiece.setModuleState(moduleData.id, angle);

            diff = MATH.subAngles(targetAngle, angle);
            sourcePiece.setModuleState(pitchAimModuleID, diff);

        }
    }

    if (diff > 0.0000001) {
        sourcePiece.networkDirty = true;
    }


};

ServerModuleFunctions.prototype.applyModuleYaw = function(sourcePiece, moduleData) {
    //   sourcePiece.pieceControls.setControlState(moduleData, action, value);

    //   console.log("Turret State:",sourcePiece.getModuleById("tank_turret").state.value);

//    console.log("SelectedTarget State:",sourcePiece.getModuleById("input_target_select").state.value);

    if (!moduleData.applies.master_module_id) {
        console.log("No master module for rotate function");
        return;
    }

    var clamp = moduleData.applies.rotation_velocity * moduleData.applies.cooldown;

    var target = this.serverWorld.getPieceById(sourcePiece.getModuleById(moduleData.applies.master_module_id).state.value);

    if (target === sourcePiece) {
        sourcePiece.getModuleById(sourcePiece.getModuleById(moduleData.applies.master_module_id).data.applies.toggle_attack_module_id).state.value = false;
    };

    var diff = 0;

    var angle = 0;
    if (!target || target === sourcePiece) {
        angle = this.clampModuleRotation(sourcePiece.getModuleById(moduleData.id), angle, clamp);
        sourcePiece.setModuleState(moduleData.id, angle);
        sourcePiece.setModuleState(moduleData.applies.master_module_id, sourcePiece.id);
        diff = angle;
    } else {

        if (moduleData.id == 'tank_turret') {

            var yawAimModuleID = sourcePiece.getModuleById(moduleData.applies.master_module_id).data.applies.yaw_aim_module_id;

            var worldAngle = this.serverPieceProcessor.getAngleFromPieceToTarget(sourcePiece, target) ; //  moduleData.transform.rot[moduleData.applies.rotation_axis];

            worldAngle = MATH.subAngles(worldAngle, sourcePiece.spatial.yaw());

            if (isNaN(sourcePiece.getModuleById(moduleData.id).state.value)) {
                console.log("NAN MODULE STATE")
                return;
            }


            angle = this.clampModuleRotation(sourcePiece.getModuleById(moduleData.id), worldAngle, clamp);
            sourcePiece.setModuleState(moduleData.id, angle);

            diff = MATH.subAngles(worldAngle, sourcePiece.getModuleById(moduleData.id).state.value);

            sourcePiece.setModuleState(yawAimModuleID, diff);

        }
    }

    if (diff > 0.00001) {
        sourcePiece.networkDirty = true;
    }
};