"use strict";


define([
        'ThreeAPI',
        'game/modules/ThreeModule'
    ],
    function(
        ThreeAPI,
        ThreeModule
    ) {

        var ThreePiece = function(piece) {

            this.id = piece.id;
            this.piece = piece;
            this.rootObject3d = ThreeAPI.createRootObject();

            this.model = ThreeAPI.loadModel();
            ThreeAPI.addChildToObject3D(this.model, this.rootObject3d);
        };

        ThreePiece.prototype.attachModule = function(module, attachmentPoint) {
            return new ThreeModule(module, this.piece, this.rootObject3d, attachmentPoint);
        };


        ThreePiece.prototype.removeThreePiece = function() {
            ThreeAPI.removeModel(this.rootObject3d);
        };

        ThreePiece.prototype.getFrustumCoordinates = function(store) {
            this.entity.getScreenCoordinates(store);
        };

        ThreePiece.prototype.sampleSpatial = function(spatial) {
            ThreeAPI.transformModel(this.rootObject3d, spatial.pos.getX(), spatial.pos.getY(), spatial.pos.getZ(), 0, -spatial.yaw(), 0);
        };


        ThreePiece.prototype.updateThreePiece = function() {
            this.sampleSpatial(this.piece.spatial);
        };


        return ThreePiece;

    });


