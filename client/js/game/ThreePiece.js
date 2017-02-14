"use strict";


define([
        'ThreeAPI',
        'game/modules/ThreeModule',
        'Events'
    ],
    function(
        ThreeAPI,
        ThreeModule,
        evt
    ) {

        var ThreePiece = function(piece) {

            this.id = piece.id;
            this.piece = piece;
            this.entity = ThreeAPI.loadModel();
            ThreeAPI.addModel(this.entity);
        };

        ThreePiece.prototype.attachModule = function(module, attachmentPoint) {
            return new ThreeModule(module, this.piece, this.entity, attachmentPoint);
        };


        ThreePiece.prototype.removeGooPiece = function() {
            this.entity.removeFromWorld();
        };

        ThreePiece.prototype.getFrustumCoordinates = function(store) {
            this.entity.getScreenCoordinates(store);
        };



        ThreePiece.prototype.sampleSpatial = function(spatial) {
            
            this.entity.position.x = spatial.pos.getX();
            this.entity.position.y = spatial.pos.getY();
            this.entity.position.z = spatial.pos.getZ();
            this.entity.rotation.x = 0;
            this.entity.rotation.y = -spatial.yaw();
            this.entity.rotation.x = 0;
        };


        ThreePiece.prototype.updateThreePiece = function() {

            this.sampleSpatial(this.piece.spatial);

        //    this.entity.transformComponent.setUpdated();

        };


        return ThreePiece;

    });


