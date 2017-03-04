"use strict";


define([
        'ThreeAPI',

    ],
    function(
        ThreeAPI
    ) {

        var ThreePiece = function(piece) {

            this.id = piece.id;
            this.piece = piece;
            this.parentObject3d = ThreeAPI.createRootObject();
        //    this.model = ThreeAPI.createRootObject();
        //    ThreeAPI.addChildToObject3D(this.model, this.parentObject3d);
        };

        ThreePiece.prototype.attachModule = function(module, attachmentPoint) {
            return new ThreeModule(module, this.piece, this.parentObject3d, attachmentPoint);
        };

        ThreePiece.prototype.getParentObject3d = function() {
            return this.parentObject3d;
        };
        
        
        ThreePiece.prototype.removeThreePiece = function() {
            ThreeAPI.removeModel(this.parentObject3d);
        };

        ThreePiece.prototype.getFrustumCoordinates = function(store) {
            this.entity.getScreenCoordinates(store);
        };

        ThreePiece.prototype.sampleSpatial = function(spatial) {
            ThreeAPI.transformModel(this.parentObject3d, spatial.pos.getX(), spatial.pos.getY(), spatial.pos.getZ(), spatial.pitch(), spatial.yaw(), spatial.roll());

        };


        ThreePiece.prototype.addPieceDebugBox = function() {
            this.debugBox = ThreeAPI.loadModel();
            ThreeAPI.addChildToObject3D(this.debugBox, this.parentObject3d);
        };


        ThreePiece.prototype.updateThreePiece = function() {
            this.sampleSpatial(this.piece.spatial);
        };


        return ThreePiece;

    });


