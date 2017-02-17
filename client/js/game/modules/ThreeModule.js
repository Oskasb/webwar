"use strict";


define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {


        var ThreeModule = function(module, piece, attachmentPoint) {

            this.tempSpatial = new MODEL.Spatial();
            this.transform = attachmentPoint.transform;
            this.moduleSpatial = new MODEL.Spatial();
            this.moduleSpatial.setSpatial(attachmentPoint.transform);
            this.piece = piece;
            this.module = module;
        };


        ThreeModule.prototype.setModuleData = function(moduleData) {
            this.applies = moduleData.applies;
        };

        ThreeModule.prototype.buildModel = function(parentObj3d) {
            if (!this.applies) return;

            this.parentObject3d = ThreeAPI.createRootObject();

            if (this.applies.game_effect || this.applies.bundle_model || this.applies.module_model_child) {
                this.model = ThreeAPI.loadModel(this.transform.size.getX(), this.transform.size.getY(), this.transform.size.getZ());
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

            if (this.applies.three_model) {
                this.model = ThreeAPI.loadMeshModel(this.applies.three_model, this.parentObject3d);
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

            if (this.applies.three_terrain) {
                this.model = ThreeAPI.loadGround(this.applies, this.module.state.value, this.parentObject3d);
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
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
            if(this.model) {
                ThreeAPI.removeModel(this.model);
            }
        };


        ThreeModule.prototype.inheritEntityWorldTransform = function(pos) {

            this.entity.transformComponent.updateWorldTransform();
            //    this.entity.transformComponent.worldTransform.rotation.toAngles(this.calcVec);
            this.calcVec3.setXYZ(pos[0], pos[1], pos[2]);
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


        ThreeModule.prototype.matchRandomVertices = function(vertices, heightData) {


        };




        ThreeModule.prototype.updateThreeModule = function(stateValue) {


            if (!stateValue) return;
            if (!this.applies) return;
            if (!this.transform) return;

            if (this.applies.spatial_axis) {
                var diff = this.angleDiffForAxis(stateValue, this.applies.spatial_axis);

                var factor = this.applies.rotation_velocity * this.applies.cooldown * 0.2;

                this.applyAngleRotationAxisToSpatial(diff, this.applies.rotation_axis, this.moduleSpatial, factor);

                ThreeAPI.applySpatialToModel(this.moduleSpatial, this.parentObject3d);
            }

            if (this.applies.animate_texture) {
                ThreeAPI.animateModelTexture(this.model, stateValue*this.applies.animate_texture[0]*this.applies.animate_speed_scale, stateValue*this.applies.animate_texture[1]*this.applies.animate_speed_scale);//
            }

            if (this.applies.three_terrain) {

                if (!this.model) return;
                var verts = this.model.children[0].children[0].geometry.vertices;


                if (!this.matchRandomVertices(verts, stateValue)) {

                    for (var i = 0; i < verts.length; i++) {
                        verts[i].z = stateValue[i];
                    }
                    this.model.children[0].children[0].geometry.needsUpdate = true;

                };

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