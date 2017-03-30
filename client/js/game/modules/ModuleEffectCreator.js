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

        var groundprints = [];

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

            evt.fire(evt.list().GAME_EFFECT, {effect:effectId, pos:posVec, vel:velVec});
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

        ModuleEffectCreator.createPositionEffect = function(pos, remove_effect, transform) {


            if (!remove_effect) {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', 'default_remove_effect');
            } else {
                var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', remove_effect);
            }

            posFromTransform(pos, transform, calcVec);

            calcVec2.set(0, 5, 0);

            for (var i = 0; i < fx.length; i++) {
                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    evt.fire(evt.list().GAME_EFFECT, {effect:fx[i].particle_effects[j].id, pos:calcVec, vel:calcVec2});
                    //    ModuleEffectCreator.createModelTransformedEffects(fx[i].particle_effects[j].id, piece, calcVec, transform, calcQuat, 1);
                }
            }
        };


        ModuleEffectCreator.createModuleApplyEmitEffect = function(piece, model, emit_effect, transform, stateValue, glueToGround) {

            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', emit_effect);

            if (!model.matrixWorld) {
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
                        calcVec2.y += 0.01;
                        threeObj.lookAt(calcVec);
                    //    calcQuat.setFromAxisAngle(calcVec, 1);
                    }

                    calcVec3.set(0, 0, 0);

                    groundprints.push(EffectsAPI.requestPassiveEffect(fx[i].particle_effects[j].id, calcVec2, zeroVec, zeroVec, threeObj.quaternion));

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
        
        
        ModuleEffectCreator.createModuleStaticEffect = function(effectId, pos, transform, tpf) {

            posFromTransform(pos, transform, calcVec);
            sizeFromTransform(transform, calcVec2);
            var fxArray = [];
            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', effectId);

            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    fxArray.push(EffectsAPI.requestPassiveEffect(fx[i].particle_effects[j].id, calcVec, zeroVec, calcVec2));
                }
            }

            return fxArray;
        };


        ModuleEffectCreator.removeModuleStaticEffect = function(fxArray) {
            for (var i = 0; i < fxArray.length; i++) {
                EffectsAPI.returnPassiveEffect(fxArray[i]);
            }
        };


        ModuleEffectCreator.updateEffect = function(fxArray, pos, transform, state, tpf) {
            posFromTransform(pos, transform, calcVec);

            for (var i = 0; i < fxArray.length; i++) {
                EffectsAPI.updateEffectPosition(fxArray[i], calcVec, state, tpf);
            }
        };


        return ModuleEffectCreator;

    });