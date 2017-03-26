"use strict";


define([
        'Events',
        'PipelineAPI',
    'EffectsAPI'
    ],
    function(
        evt,
        PipelineAPI,
        EffectsAPI
    ) {

        var calcVec = new THREE.Vector3();
        var calcVec2 = new THREE.Vector3();
        var calcVec3 = new THREE.Vector3();
        var calcQuat = new THREE.Quaternion();
        var zeroVec = new THREE.Vector3();

        var posFromTransform = function(pos, transform, storeVec3) {
            storeVec3.set(pos.data[0]+ transform.pos.data[0], pos.data[1] + transform.pos.data[1], pos.data[2] + transform.pos.data[2]);
        };

        var ModuleEffectCreator = function() {

        };

                
        ModuleEffectCreator.createModelTransformedEffects = function(effectId, piece, calcVec, transform, calcQuat, stateValue) {

            calcVec2.x = transform.size.getX()*Math.random() - transform.size.getX()*0.5;
            calcVec2.y = transform.size.getY()*Math.random() - transform.size.getY()*0.5;
            calcVec2.z = transform.size.getZ()*Math.random() - transform.size.getZ()*0.5;

            calcVec2.applyQuaternion(calcQuat);

            calcVec3.addVectors(calcVec, calcVec2);

            calcVec2.x = piece.spatial.vel.getX() * - stateValue*0.15 + Math.random()*0.02 - 0.01;
            calcVec2.y = piece.spatial.vel.getY() + Math.abs(stateValue);
            calcVec2.z = piece.spatial.vel.getZ() * - stateValue*0.15 + Math.random()*0.02 - 0.01;

            calcVec3.x += calcVec2.x*0.02;
            calcVec3.z += calcVec2.z*0.02;

        //    calcVec2.applyQuaternion(calcQuat);

            evt.fire(evt.list().GAME_EFFECT, {effect:effectId, pos:calcVec3, vel:calcVec2});
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
                    ModuleEffectCreator.createModelTransformedEffects(fx[i].particle_effects[j].id, piece, calcVec, transform, calcQuat, 1);
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
        
        
        ModuleEffectCreator.createModuleApplyEmitEffect = function(piece, model, applies, transform, stateValue) {

            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', applies.emit_effect);

            if (fx.length && fx != applies.emit_effect) {

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
                        ModuleEffectCreator.createModelTransformedEffects(fx[i].particle_effects[j].id, piece, calcVec, transform, calcQuat, stateValue);
                    }
                }
            } else {
                // no effect data here...
            }
        };
        
        ModuleEffectCreator.createModuleStaticEffect = function(effectId, pos, transform) {

            posFromTransform(pos, transform, calcVec);
            var fxArray = [];
            var fx = PipelineAPI.readCachedConfigKey('MODULE_EFFECTS', effectId);

            for (var i = 0; i < fx.length; i++) {

                if (!fx[i].particle_effects) {
                    console.log("Bad FX: ", fx)
                    return;
                }

                for (var j = 0; j < fx[i].particle_effects.length; j++) {
                    fxArray.push(EffectsAPI.requestPassiveEffect(fx[i].particle_effects[j].id, calcVec, zeroVec));
                //    ModuleEffectCreator.createModelTransformedEffects(fx[i].particle_effects[j].id, piece, calcVec, transform, calcQuat, stateValue);
                }
            }

            return fxArray;
        };

        ModuleEffectCreator.removeModuleStaticEffect = function(fxArray) {
            for (var i = 0; i < fxArray.length; i++) {
                EffectsAPI.returnPassiveEffect(fxArray[i]);
            }
        };

        ModuleEffectCreator.updateEffect = function(fxArray, pos, transform, state) {
            posFromTransform(pos, transform, calcVec);

            for (var i = 0; i < fxArray.length; i++) {
                EffectsAPI.updateEffectPosition(fxArray[i], calcVec, state);
            }
        };

        return ModuleEffectCreator;

    });