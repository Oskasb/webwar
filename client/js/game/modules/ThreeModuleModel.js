"use strict";


define([
        '3d/GooEntityFactory',
        'game/modules/ModuleEffect',
        'game/modules/ModuleEmitter',
        'game/modules/ModuleModel',
        'Events'
    ],
    function(
        GooEntityFactory,
        ModuleEffect,
        ModuleEmitter,
        ModuleModel,
        evt
    ) {


        var ThreeModuleModel = function (parentEntity) {
            this.parentEntity = parentEntity;
            this.moduleEntity;
            this.entityName;
            this.baseRotation = new goo.Vector3();
            this.baseTranslation = new goo.Vector3();
        };
        
                
        ThreeModuleModel.prototype.attachEntityToModule = function(childEntityName) {
            this.entityName = childEntityName;
            var e = this.parentEntity;


            var checkName = function(entity) {
                console.log(entity.name, childEntityName);
                if (entity.name == childEntityName) {
                    e = entity;
                    return true;
                }
            };


            this.parentEntity.traverse(checkName);

            this.moduleEntity = e;

            this.parentEntity.transformComponent.transform.rotation.toAngles(this.baseRotation);
            this.baseTranslation.set(this.moduleEntity.transformComponent.transform.translation);
            console.log("Module Entity", this.moduleEntity, this.baseRotation);

        };

        ThreeModuleModel.prototype.applyModuleTranslation = function(state, shakeAxis) {

            if (this.moduleEntity.name != this.entityName) {
                this.attachEntityToModule(this.entityName)
                return;
            }

            this.moduleEntity.transformComponent.transform.translation.setDirect(this.baseTranslation.x, this.baseTranslation.y,this.baseTranslation.z);

            this.moduleEntity.transformComponent.transform.translation.addDirect(
                shakeAxis[0]*state*(Math.random()-0.5),
                shakeAxis[1]*state*(Math.random()-0.5),
                shakeAxis[2]*state*(Math.random()-0.5)
            );
            this.moduleEntity.transformComponent.setUpdated();
        };

        ThreeModuleModel.prototype.applyModuleRotation = function(rot) {

            if (this.moduleEntity.name != this.entityName) {
                this.attachEntityToModule(this.entityName)
                return;
            }

            this.moduleEntity.transformComponent.transform.rotation.fromAngles(rot[0] - this.baseRotation.x, rot[1] - this.baseRotation.y, rot[2] - this.baseRotation.z);
            this.moduleEntity.transformComponent.setUpdated();
        };

        ThreeModuleModel.prototype.applyTextureAnimation = function(state, animAxis) {

            if (this.moduleEntity.name != this.entityName) {
                console.log("tx",this.moduleEntity.meshRendererComponent)
                this.attachEntityToModule(this.entityName)
                return;
            }
        //    this.moduleEntity.meshRendererComponent.materials[0].offsetState.enabled = true;
            var tx = this.moduleEntity.meshRendererComponent.materials[0].getTextureEntries().DIFFUSE_MAP;
        //    tx.offset.addDirect(state*animAxis[0], state*animAxis[1]);

        //    tx.offset.addDirect(state*animAxis[0], state*animAxis[1]);
            tx.offset.x += state*animAxis[0];
            tx.offset.y += state*animAxis[1];// (state*animAxis[0], state*animAxis[1]);
        //    tx.offset.y = 0

        //    this.moduleEntity.meshRendererComponent.materials[0].shader.uniforms.offsetRepeat[2]+=state*0.0001;
            // this.moduleEntity.meshRendererComponent.materials[0].shader.updateProcessors(this.moduleEntity.meshRendererComponent.materials[0].shader.uniforms)
        };


        return ThreeModuleModel;
        
    });