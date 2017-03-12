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
        //    this.addModuleDebugBox()
        };


        ThreeModule.prototype.setModuleData = function(moduleData) {
            this.applies = moduleData.applies;
        };

        ThreeModule.prototype.buildModel = function(parentObj3d, apReady) {
            
            var started = 0;
            var finished = 0;
            var partsReady = function() {
                finished++
                if (started == finished) {
                    apReady(); 
                }
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
        //        this.addModuleDebugBox(this.model);
            }

            if (this.applies.three_terrain) {
                started++
                this.model = ThreeAPI.loadGround(this.applies, this.module.state.value, this.parentObject3d, partsReady);
                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            }

            if (!this.model) {

                this.model = this.parentObject3d // ThreeAPI.createRootObject();

                ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
            //    this.model = this.parentObject3d;
          //      ThreeAPI.addChildToObject3D(this.model, this.parentObject3d);
                
         //       this.addModuleDebugBox(this.model);

            }

        //    if (this.transform) {
                this.parentObject3d.position.x = this.transform.posX();
                this.parentObject3d.position.y = this.transform.posY();
                this.parentObject3d.position.z = this.transform.posZ();
        //    }


        //    if (this.applies.game_effect || this.applies.bundle_model || this.applies.module_model_child) {
        //        this.addModuleObject3D(parentObj3d);
        //        ThreeAPI.addChildToObject3D(this.parentObject3d, parentObj3d);
        //    }


            partsReady();
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
            if(this.model) {
                ThreeAPI.removeModel(this.model);
                
                if (this.clientPiece.threePiece.render) {
                    ModuleEffectCreator.createModuleRemovedEffect(this.piece, this.model, this.applies, this.transform)
                }
            }
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


            if (!stateValue) return;
            if (!this.applies) return;
            if (!this.transform) return;


            if (this.applies.pitch_roll__) {

                    var spatial = this.piece.spatial;
                    ThreeAPI.transformModel(
                        this.parentObject3d, 0, 0, 0,
                        spatial.pitch()*this.applies.pitch_roll[0],
                        0,
                        spatial.roll()*this.applies.pitch_roll[1]
                    );

                    this.model.needsUpdate = true;
                    if (Math.random() < 0.01) {
                        console.log(spatial.pitch());
                    }
                };



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
                
                ModuleEffectCreator.createModuleApplyEmitEffect(this.piece, this.model, this.applies, this.transform, stateValue)
              

            }

            if (this.applies.fireCannon) {
                if (stateValue) {
            //        evt.fire(evt.list().GAME_EFFECT, {effect:"spawn_pulse", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
                }

            }

            if (this.applies.three_terrain) {

                if (!this.model) return;
                var verts = this.model.children[0].children[0].geometry.vertices;

            //    this.model.children[0].position.x = 100;
            //    this.model.children[0].position.z = 100;
            //    this.model.rotation.y = -Math.PI*-0.5

  /*          *
                if (Math.random() < 0.1) {

                        var va = verts.length-1;
                        var vb = verts.length-1;
                        var vc = verts.length-1;
                        var vd = verts.length-1;

                        verts[0].set(verts[0].x, verts[0].y, stateValue[0] + 20 ); // Math.random());


                        verts[va].set(verts[va].x, verts[va].y, stateValue[va] + 10 ); // Math.random());
                        verts[vb].set(verts[vb].x, verts[vb].y, stateValue[vb] + 10 ); // Math.random());
                        verts[vc].set(verts[vc].x, verts[vc].y, stateValue[vc] + 10 ); // Math.random());
                        verts[vd].set(verts[vd].x, verts[vd].y, stateValue[vd] + 100 + Math.random()*50); // ;


                    this.model.children[0].children[0].geometry.verticesNeedUpdate  = true;

                //    this.model.children[0].children[0].rotation.y +=-Math.PI*-0.25
                };
*/
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