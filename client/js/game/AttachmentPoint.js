
"use strict";


define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {

        var AttachmentPoint = function(apData, moduleData) {
            this.data = {};
            this.slot = apData.slot;
            this.parent = apData.parent;
            this.point_id = apData.point_id;

            this.object3D = ThreeAPI.createRootObject();
            
            this.clientModules = [];

            this.transform = new MODEL.Spatial();

            if (apData.transform) {
                this.applyTransform(apData.transform)
            }

            this.attachModuleData(moduleData);
        };

        AttachmentPoint.prototype.attachModuleData = function (moduleData) {
            this.data.module = moduleData;
        };

        AttachmentPoint.prototype.attachClientModule = function (clientModule, apReady) {
            clientModule.buildGeometry(apReady);
            this.clientModules.push(clientModule);
            
        };
        
        AttachmentPoint.prototype.attachModuleModels = function () {
            for (var i = 0; i < this.clientModules.length; i++) {
                this.clientModules[i].attachModuleToParent(this.object3D);
            }
        };

        AttachmentPoint.prototype.attachToParent = function (parentObj3d) {
            ThreeAPI.addChildToObject3D(this.object3D, parentObj3d)
        };

        AttachmentPoint.prototype.applyTransform = function (transform) {
            if (transform.pos) this.transform.setPosXYZ(transform.pos[0], transform.pos[1], transform.pos[2]);
            if (transform.rot) this.transform.fromAngles(transform.rot[0]*Math.PI, transform.rot[1]*Math.PI, transform.rot[2]*Math.PI);
            if (transform.size) this.transform.setSizeXYZ(transform.size[0], transform.size[1], transform.size[2]);
        };

        AttachmentPoint.prototype.detatchAttachmentPoint = function (parentObj3d) {

            for (var i = 0; i < this.clientModules.length; i++) {
                this.clientModules[i].removeClientModule();
            }
            
            ThreeAPI.disposeModel(this.object3D)
        };
        
        return AttachmentPoint
    });