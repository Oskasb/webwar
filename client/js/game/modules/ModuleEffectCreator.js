"use strict";


define([
        'Events',
        'PipelineAPI',
        'ThreeAPI',
        'EffectsAPI'
    ],
    function(
        evt,
        PipelineAPI,
        ThreeAPI,
        EffectsAPI
    ) {

        var calcVec = new THREE.Vector3();
        var calcVec2 = new THREE.Vector3();
        var calcVec3 = new THREE.Vector3();
        var calcQuat = new THREE.Quaternion();
        var threeObj = new THREE.Object3D();
        var zeroVec = new THREE.Vector3();

        var maxGroundContactDistance = 0.5;

        var maxActiveGroundPrints = 2200;

        var maxGeometryEffetcs = 1000;

        var groundprints = [];
        var geometryEffects = [];


        var effectData = {
            effect:'',
            pos:new THREE.Vector3(),
            vel:new THREE.Vector3()
        };

        var emitEffect = function(effectId, pos, vel) {
            effectData.effect = effectId;
            effectData.pos.set(pos.x, pos.y, pos.z);
            effectData.vel.set(vel.x, vel.y, vel.z);
            evt.fire(evt.list().GAME_EFFECT, effectData);
        };

        var posFromTransform = function(pos, transform, storeVec3) {
            storeVec3.set(pos.data[0]+ transform.pos.data[0], pos.data[1] + transform.pos.data[1], pos.data[2] + transform.pos.data[2]);
        };

        var sizeFromTransform = function(transform, storeVec3) {
            storeVec3.set(transform.size.data[0], transform.size.data[1],  transform.size.data[2]);
        };

        var ModuleEffectCreator = function() {

        };

        var pre = 0;

        ModuleEffectCreator.createModelTransformedEffects = function(piece, calcVec, transform, calcQuat, stateValue, velStore, posStore) {

            posStore.x = transform.size.getX()*Math.random() - transform.size.getX()*0.5;
            posStore.y = transform.size.getY()*Math.random() - transform.size.getY()*0.5;
            posStore.z = transform.size.getZ()*Math.random() - transform.size.getZ()*0.5;

            posStore.applyQuaternion(calcQuat);

            velStore.addVectors(calcVec, posStore);

            posStore.x = piece.spatial.vel.getX() * - stateValue*0.15 + Math.random()*0.02 - 0.01;
            posStore.y = piece.spatial.vel.getY() + Math.abs(stateValue);
            posStore.z = piece.spatial.vel.getZ() * - stateValue*0.15 + Math.random()*0.02 - 0.01;

            velStore.x += posStore.x*0.02;
            velStore.z += posStore.z*0.02;

        };


        ModuleEffectCreator.createActiveEffect = function(effectId, posVec, velVec) {
            emitEffect(effectId, posVec, velVec)
        //    evt.fire(evt.list().GAME_EFFECT, {effect:effectId, pos:posVec, vel:velVec});
        };


        ModuleEffectCreator.createModuleModelEffect = function(piece, model, remove_effect, transform) {

            if (!model.matrixWorld) {
                return;
            }

            if (!remove_effect) {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', 'default_remove_effect');
            } else {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', remove_effect);
            }

            calcVec.setFromMatrixPosition( model.matrixWorld );
            model.getWorldQuaternion(calcQuat);

            if (!calcVec.x) return;
            if (!piece.spatial.pos.data) return;

            for (var i = 0; i < fx.length; i++) {
                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createModelTransformedEffects(piece, calcVec, transform, calcQuat, 1, calcVec2, calcVec3);

                    ModuleEffectCreator.createActiveEffect(fx[i].particle_effects[j].id, calcVec2, calcVec3)
                }
            }
        };

        ModuleEffectCreator.createPositionEffect = function(pos, effectId, transform, vel) {

            evt.fire(evt.list().GAME_EFFECT, {
                effect: "test_effect",
                pos: pos,
                vel: vel
            });

            return

            if (!effectId) {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', 'default_remove_effect');
            } else {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', effectId);
            }

            posFromTransform(pos, transform, calcVec);

            if (!vel) {
                calcVec2.set(0, 5, 0);
            } else {
                calcVec2.set(vel.data[0], vel.data[1], vel.data[2]);
            }
            
            for (var i = 0; i < fx.length; i++) {
                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createActiveEffect(fx[i].particle_effects[j].id, calcVec, calcVec2);
                }
            }
        };


        ModuleEffectCreator.createModuleApplyEmitEffect = function(piece, model, emit_effect, transform, stateValue, glueToGround) {

            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', emit_effect);

            if (!model.matrixWorld) {
                console.log("No model matrix world?");
                return;
            }

            calcVec.setFromMatrixPosition( model.matrixWorld );
            model.getWorldQuaternion(calcQuat);

            if (!calcVec.x) return;
            if (!piece.spatial.pos.data) return;


            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createModelTransformedEffects(piece, calcVec, transform, calcQuat, stateValue, calcVec2, calcVec3);

                    if (glueToGround) {
                        pre = calcVec2.y;
                        ThreeAPI.setYbyTerrainHeightAt(calcVec2);
                        if (Math.abs(pre - calcVec2.y) > maxGroundContactDistance) {
                            return;
                        }
                        calcVec2.y += 0.1;
                    }

                    ModuleEffectCreator.createActiveEffect(fx[i].particle_effects[j].id, calcVec2, calcVec3)
                }
            }
        };


        ModuleEffectCreator.addGrundPrintEmitEffect = function(piece, model, emit_effect, transform, stateValue, glueToGround) {

            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', emit_effect);

            if (!model.matrixWorld) {
                console.log("No model matrix world?");
                return;
            }

            calcVec.setFromMatrixPosition( model.matrixWorld );
            model.getWorldQuaternion(calcQuat);

            if (!calcVec.x) return;
            if (!piece.spatial.pos.data) return;


            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createModelTransformedEffects(piece, calcVec, transform, calcQuat, stateValue, calcVec2, calcVec3);

                    if (glueToGround) {
                        pre = calcVec2.y;
                        ThreeAPI.setYbyTerrainHeightAt(calcVec2, calcVec);
                        if (Math.abs(pre - calcVec2.y) > maxGroundContactDistance) {
                            return;
                        }
                        calcVec2.y += 0.01+Math.random()*0.1;
                        threeObj.lookAt(calcVec);
                    //    calcQuat.setFromAxisAngle(calcVec, 1);
                    }

                //    calcVec3.set(0, 0, 0);

                    ModuleEffectCreator.createPassiveEffect(fx[i].particle_effects[j].id, calcVec2, zeroVec, zeroVec, threeObj.quaternion, groundprints);
                }
            }

            while (groundprints.length > maxActiveGroundPrints) {
                if (Math.random() < 0.2) {
                    EffectsAPI.returnPassiveEffect(groundprints.shift());
                } else {
                    EffectsAPI.returnPassiveEffect(groundprints.splice(Math.floor(groundprints.length*0.5*Math.random()), 1)[0]);
                }
            }
        };
        
        
        ModuleEffectCreator.createModuleStaticEffect = function(effectId, pos, transform, vel) {

            posFromTransform(pos, transform, calcVec);
            sizeFromTransform(transform, calcVec2);
            var fxArray = [];
            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', effectId);


            if (!vel) {
                calcVec3.set(0, 0, 0);
            } else {
                calcVec3.set(vel.data[0], vel.data[1], vel.data[2]);
            }

            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createPassiveEffect(fx[i].particle_effects[j].id, calcVec, calcVec3, calcVec2, null, fxArray);
                }
            }

            return fxArray;
        };


        ModuleEffectCreator.addGeometryEffect = function(model, effectId, transform, stateValue, glueToGround) {

        //    posFromTransform(pos, transform, calcVec);
            sizeFromTransform(transform, calcVec2);

            calcVec.setFromMatrixPosition( model.matrixWorld );

            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', effectId);

            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    ModuleEffectCreator.createPassiveEffect(fx[i].particle_effects[j].id, calcVec, zeroVec, calcVec2, glueToGround, geometryEffects);
                }
            }

            while (geometryEffects.length > maxGeometryEffetcs) {
                if (Math.random() < 0.2) {
                    EffectsAPI.returnPassiveEffect(geometryEffects.shift());
                } else {
                    EffectsAPI.returnPassiveEffect(geometryEffects.splice(Math.floor(geometryEffects.length*0.5*Math.random()), 1)[0]);
                }
            }

        };


        ModuleEffectCreator.createPassiveEffect = function(fxId, pos, vel, size, quat, store) {

            var fx = EffectsAPI.requestPassiveEffect(fxId, pos, vel, size, quat);

            if (!fx) {
                console.log("effect pool dry:", fxId)
            } else {
                store.push(fx);
            }
        };

        ModuleEffectCreator.removeModuleStaticEffect = function(fxArray) {
            for (var i = 0; i < fxArray.length; i++) {
                if (!fxArray[i]) {
                    console.log("Returning empty effect")
                } else {
                    EffectsAPI.returnPassiveEffect(fxArray[i]);
                }
            }
        };

        ModuleEffectCreator.updateEffect = function(fxArray, model, pos, transform, state, tpf) {

            calcVec.setFromMatrixPosition( model.matrixWorld );

            // posFromTransform(pos, transform, calcVec);

            for (var i = 0; i < fxArray.length; i++) {
                EffectsAPI.updateEffectPosition(fxArray[i], calcVec, state, tpf);
            }
        };


        return ModuleEffectCreator;

    });