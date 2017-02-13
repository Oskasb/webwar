
"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var AttachmentPoint = function(apData, defaultModule) {
            this.slot = apData.slot;

            this.transform = new MODEL.Spatial();

            if (apData.transform) {
                this.applyTransform(apData.transform)
            }
            
            this.data = {module:defaultModule};
        };

        AttachmentPoint.prototype.applyTransform = function (transform) {
            if (transform.pos) this.transform.setPosXYZ(transform.pos[0], transform.pos[1], transform.pos[2]);
            if (transform.rot) this.transform.fromAngles(transform.rot[0], transform.rot[1], transform.rot[2]);
            if (transform.size) this.transform.setSizeXYZ(transform.size[0], transform.size[1], transform.size[2]);
        };
                
        return AttachmentPoint
    });