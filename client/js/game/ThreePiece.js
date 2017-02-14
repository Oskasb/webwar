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


        ThreePiece.prototype.removeThreePiece = function() {
            ThreeAPI.removeModel(this.entity);
        };

        ThreePiece.prototype.getFrustumCoordinates = function(store) {
            this.entity.getScreenCoordinates(store);
        };

        ThreePiece.prototype.sampleSpatial = function(spatial) {
            ThreeAPI.transformModel(this.entity, spatial.pos.getX(), spatial.pos.getY(), spatial.pos.getZ(), 0, -spatial.yaw(), 0);
        };


        ThreePiece.prototype.updateThreePiece = function() {

            this.sampleSpatial(this.piece.spatial);

        //    this.entity.transformComponent.setUpdated();

        };


        return ThreePiece;

    });


