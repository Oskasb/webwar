"use strict";


define([
        'ThreeAPI',
        '3d/GooEntityFactory',
        'game/modules/ModuleEffect',
        'game/modules/ModuleEmitter',
        'game/modules/ThreeModuleModel',
        'Events'
    ],
    function(
        ThreeAPI,
        GooEntityFactory,
        ModuleEffect,
        ModuleEmitter,
        ThreeModuleModel,
        evt
    ) {




        var ThreeModule = function(module, piece, rootObject3d, attachmentPoint) {

            this.calcVec = new goo.Vector3();
            this.calcVec2 = new goo.Vector3();
            this.calcVec3 = new goo.Vector3();

            this.tempSpatial = new MODEL.Spatial();

            this.transform = attachmentPoint.transform;

            this.moduleSpatial = new MODEL.Spatial();
            this.moduleSpatial.setSpatial(attachmentPoint.transform);

            this.particles = [];
            this.piece = piece;
            this.module = module;
            this.applies = module.data.applies;
            this.flicker = 0;
            this.animate = this.applies.animate;

            if (this.applies) {

                if (this.applies.game_effect) {
                    this.moduleModel = new ThreeModuleModel(rootObject3d);
                    this.model = ThreeAPI.loadModel(this.transform.size.getX(), this.transform.size.getY(), this.transform.size.getZ());
                    ThreeAPI.addChildToObject3D(this.model, rootObject3d);
                    ThreeAPI.applySpatialToModel(this.transform, this.model);
                }

                if (this.applies.bundle_model || this.applies.module_model_child) {
                    this.moduleModel = new ThreeModuleModel(rootObject3d);

                    this.model = ThreeAPI.loadModel(this.transform.size.getX(), this.transform.size.getY(), this.transform.size.getZ());
                    ThreeAPI.addChildToObject3D(this.model, rootObject3d);
                    ThreeAPI.applySpatialToModel(this.transform, this.model);
                    // this.moduleModel.attachEntityToModule(this.applies.module_model_child);

                }

                this.rootObject3d = rootObject3d;

                if (this.applies.game_effect) {
                    this.moduleEffect = new ModuleEffect();
                    this.moduleEffect.setupEffectModelData(this.applies, this.piece, this.tempSpatial);
                } else if (this.applies.emit_effect) {
                    this.moduleEmitter = new ModuleEmitter();
                    this.moduleEmitter.setupEmitEffectData(this.applies, this.piece, this.tempSpatial, this.transform);
                }

                if (this.applies.spawn_effect) {
                    evt.fire(evt.list().GAME_EFFECT, {effect:module.data.applies.spawn_effect, pos:piece.spatial.pos, vel:piece.spatial.vel});
                }
            }

        };


        ThreeModule.prototype.activateGooModule = function() {
            if (this.moduleEffect) {
                this.moduleEffect.gameEffect.startGooEffect()
            }
        };


        ThreeModule.prototype.removeModule = function() {

            if (this.applies.remove_effect) {
                this.tempSpatial.stop();
                evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.remove_effect, pos:this.piece.spatial.pos, vel:this.tempSpatial.rot});
            }

            if (this.moduleEffect) {
                this.moduleEffect.gameEffect.removeGooEffect();
            }

            this.entity.removeFromWorld();
        };


        ThreeModule.prototype.inheritEntityWorldTransform = function(pos) {

            this.entity.transformComponent.updateWorldTransform();
            //    this.entity.transformComponent.worldTransform.rotation.toAngles(this.calcVec);
            this.calcVec3.setDirect(pos[0], pos[1], pos[2]);
            this.calcVec3.applyPost(this.entity.transformComponent.worldTransform.rotation);
            this.calcVec3.addVector(this.entity.transformComponent.worldTransform.translation);
            this.tempSpatial.setPosXYZ(this.calcVec3.x, this.calcVec3.y, this.calcVec3.z);

        };

        ThreeModule.prototype.calcLocalTargetAngle = function(stateValue) {
            return stateValue;
            var ang = MATH.radialLerp(this.transform.rot[this.applies.rotation_axis], stateValue, this.applies.rotation_velocity);

            ang = MATH.radialClamp(ang, this.transform.rot[this.applies.rotation_axis]-this.applies.rotation_velocity*0.2, this.transform.rot[this.applies.rotation_axis]+this.applies.rotation_velocity*0.2);

            return ang;
        };

        ThreeModule.prototype.angleDiffForAxis = function(angle, axis) {
            return angle // - this.piece.spatial[axis]();
        };


        ThreeModule.prototype.applyAngleRotationAxisToSpatial = function(angle, rotation, spatial, factor) {
            spatial.fromAngles(
                MATH.radialLerp(spatial.pitch(), angle*rotation[0],  factor),
                MATH.radialLerp(spatial.yaw(),   angle*rotation[1],  factor),
                MATH.radialLerp(spatial.roll(),  angle*rotation[2],  factor)
            );
        };


        ThreeModule.prototype.clampModuleAngle = function(angle, axis) {
            return MATH.radialClamp(angle , module.state.value - clamp, module.state.value + clamp);
        };


        ThreeModule.prototype.updateGooModule = function() {

            return;
            
            if (!this.applies) return;
            if (!this.transform) return;

            if (this.applies.spatial_axis) {
                var diff = this.angleDiffForAxis(this.module.state.value, this.applies.spatial_axis);

                var factor = this.applies.rotation_velocity * this.applies.cooldown * 0.2;

                this.applyAngleRotationAxisToSpatial(diff, this.transform.rot.data, this.moduleSpatial, factor);

                if (this.moduleModel) {
                    this.moduleModel.applyModuleRotation(this.moduleSpatial.rot.data);
                }
            }

            if (this.applies.animate_texture) {
                if (this.moduleModel) {
                    this.moduleModel.applyTextureAnimation(this.module.state.value*this.applies.animate_speed_scale, this.applies.animate_texture);
                }
            }

            if (this.applies.animate_shake) {
                if (this.moduleModel) {
                    this.moduleModel.applyModuleTranslation(this.module.state.value / this.applies.state_factor, this.applies.animate_shake);
                }
            }

            if (this.moduleSpatial.getSizeVec().getLengthSquared() > 0.5) {
                this.tempSpatial.setPosXYZ(
                    this.moduleSpatial.size.data[0]*(Math.random()-0.5),
                    this.moduleSpatial.size.data[1]*(Math.random()-0.5),
                    this.moduleSpatial.size.data[2]*(Math.random()-0.5)
                );
                this.inheritEntityWorldTransform(this.tempSpatial.pos.data);

            } else {
                this.tempSpatial.setSpatial(this.piece.spatial);
            }

            this.tempSpatial.addSpatial(this.moduleSpatial);
            this.tempSpatial.fromAngles(this.moduleSpatial.pitch(), this.moduleSpatial.yaw(), this.moduleSpatial.roll());
            this.tempSpatial.applyYaw(this.piece.spatial.yaw());

            if (this.moduleEffect) {

                if (this.module.on) {

                    this.moduleEffect.updateModuleEffect(this.module, this.tempSpatial.pos, this.tempSpatial.rot)

                } else {
                    if (this.moduleEffect.gameEffect.started) {
                        if (!this.moduleEffect.gameEffect.paused) {
                            this.moduleEffect.gameEffect.pauseGooEffect();
                        }
                    }
                }
            }

            if (this.moduleEmitter) {
                if (this.module.on) {
                    if (this.applies.effect_data.intensity) {
                        if (this.applies.effect_data.intensity < Math.random()) {
                            return;
                        }
                    }
                    this.moduleEmitter.updateModuleEmitter(this.module, this.tempSpatial.pos, this.tempSpatial.rot)
                }
            }
        };

        return ThreeModule;

    });