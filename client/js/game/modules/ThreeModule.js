"use strict";


define([
        'ThreeAPI',
        'game/modules/ModuleEffectCreator'
    ],
    function(
        ThreeAPI,
        ModuleEffectCreator
    ) {


        var ThreeModule = function(module, clientPiece, attachmentPoint) {

            this.tempSpatial = new MODEL.Spatial();
            this.transform = attachmentPoint.transform;
            this.moduleSpatial = new MODEL.Spatial();
            this.moduleSpatial.setSpatial(attachmentPoint.transform);

            this.module = module;
            this.clientPiece = clientPiece;
            this.piece = clientPiece.piece;
            this.staticEffect = null;
            this.dynamicEffect = null;
            //    this.addModuleDebugBox()
        };


        ThreeModule.prototype.setModuleData = function(moduleData) {
            this.applies = moduleData.applies;
        };



        ThreeModule.prototype.buildModel = function(parentObj3d) {

            var started = 0;
            var finished = 0;
            
            var partsReady = function() {

            };

            started++;

            if (!this.applies) {
                partsReady();
                return;
            }

            this.parentObject3d = ThreeAPI.createRootObject();

            if (this.applies.three_model) {
                started++
                this.model = ThreeAPI.loadMeshModel(this.applies.three_model, this.parentObject3d, partsReady);
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

            if (this.applies.three_terrain) {
                started++;
                this.model = ThreeAPI.loadGround(this.applies, this.module.state.value, this.parentObject3d, partsReady);
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

        //    this.attachEffects();


            if (!this.model) {

                this.model = this.parentObject3d;

                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

            this.parentObject3d.position.x = this.transform.posX();
            this.parentObject3d.position.y = this.transform.posY();
            this.parentObject3d.position.z = this.transform.posZ();


            partsReady();
        };


        ThreeModule.prototype.attachEffects = function() {

            if (this.applies.spawn_effect) {
            //    console.log("Spawn Vel:", this.piece.spatial.vel.data)
                ModuleEffectCreator.createPositionEffect(this.piece.spatial.pos, this.applies.spawn_effect, this.transform, this.piece.spatial.vel);
            }

            if (this.applies.static_effect) {
                if (!this.staticEffect) {
                    this.staticEffect = ModuleEffectCreator.createModuleStaticEffect(this.applies.static_effect, this.piece.spatial.pos, this.transform, this.piece.spatial.vel);
                }
            }

        };

        ThreeModule.prototype.attachDynamicEffects = function() {


            if (this.applies.dynamic_effect) {
                if (!this.dynamicEffect) {
                    this.dynamicEffect = ModuleEffectCreator.createModuleStaticEffect(this.applies.dynamic_effect, this.piece.spatial.pos, this.transform);
                }
            }
        };

        ThreeModule.prototype.detatchEffects = function() {

            if (this.staticEffect) {
                ModuleEffectCreator.removeModuleStaticEffect(this.staticEffect);
                this.staticEffect = null;
            }

            if (this.dynamicEffect) {
                ModuleEffectCreator.removeModuleStaticEffect(this.dynamicEffect);
                this.dynamicEffect = null;
            }
        };


        ThreeModule.prototype.addModuleDebugBox = function() {

            this.debugModel = ThreeAPI.loadDebugBox(this.transform.size.getX(), this.transform.size.getY(), this.transform.size.getZ());
            ThreeAPI.addChildToObject3D(this.debugModel, this.model);
        };

        ThreeModule.prototype.removeModuleDebugBox = function() {
            if (this.debugModel) {
                this.model.remove(this.debugModel);
            }
        };

        ThreeModule.prototype.getParentObject3d = function() {
            return this.parentObject3d;
        };

        ThreeModule.prototype.attachToParent = function(parentObject3d) {
            if (!this.applies) return;

            if (this.applies.game_effect || this.applies.three_model || this.applies.module_model_child) {
                ThreeAPI.addChildToObject3D(this.model, parentObject3d);
                ThreeAPI.applySpatialToModel(this.transform, this.model);
            }

            this.parentObject3d = parentObject3d;
        };



        ThreeModule.prototype.removeThreeModule = function() {

            if (this.clientPiece.threePiece.render) {
                if(this.model) {
                    ModuleEffectCreator.createModuleModelEffect(this.piece, this.model, this.applies.remove_effect, this.transform)
                } else {
                    ModuleEffectCreator.createPositionEffect(this.piece.spatial.pos, this.applies.remove_effect, this.transform)
                }
            }

            if(this.model) {
                if (this.applies.three_terrain ) {
                    ThreeAPI.disposeModel(this.model);
                } else {
                    ThreeAPI.removeModel(this.model);
                }
            }

            this.detatchEffects();

        //    ThreeAPI.disposeModel(this.parentObject3d);
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



        ThreeModule.prototype.updateThreeModule = function(stateValue) {

            if (!this.applies) return;
            if (!this.transform) return;


            if (this.applies.dynamic_effect) {
                if (!stateValue) {
                    this.detatchEffects();
                } else {
                    this.attachDynamicEffects();
                    ModuleEffectCreator.updateEffect(this.dynamicEffect, this.model, this.piece.spatial.pos, this.transform, stateValue, this.piece.temporal.tickDelta)
                }

            }


            if (!stateValue) return;


            if (this.applies.spatial_axis) {
                var diff = this.angleDiffForAxis(stateValue, this.applies.spatial_axis);

                var factor = this.applies.rotation_velocity * this.applies.cooldown * 0.2;

                this.applyAngleRotationAxisToSpatial(diff, this.applies.rotation_axis, this.moduleSpatial, factor);

                ThreeAPI.applySpatialToModel(this.moduleSpatial, this.parentObject3d);
            }

            if (this.applies.animate_texture) {
                ThreeAPI.animateModelTexture(this.model, stateValue*this.applies.animate_texture[0]*this.applies.animate_speed_scale, stateValue*this.applies.animate_texture[1]*this.applies.animate_speed_scale);//
            }


            if (this.applies.emit_effect) {
                ModuleEffectCreator.createModuleApplyEmitEffect(this.piece, this.model, this.applies.emit_effect, this.transform, stateValue, this.applies.ground_print_effect)
            }


            if (this.applies.ground_print_effect) {
                ModuleEffectCreator.addGrundPrintEmitEffect(this.piece, this.model, this.applies.ground_print_effect, this.transform, stateValue, true)
            }

            if (this.applies.plant_static_effect) {
                ModuleEffectCreator.addGeometryEffect(this.model, this.applies.plant_static_effect, this.transform, stateValue, true)
            }
            
            return;



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