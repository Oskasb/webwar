"use strict";


define([
        'ThreeAPI',

    ],
    function(
        ThreeAPI
    ) {

        var ThreePiece = function(piece, clientPiece) {
            
            this.id = piece.id;
            this.piece = piece;
            this.clientPiece = clientPiece;
            this.parentObject3d = ThreeAPI.createRootObject();

            this.render = false;

            this.frustumCoords = new THREE.Vector3();
            
        //    this.addPieceDebugBox(this.clientPiece.pieceData.size);
            
            this.boundingSize = this.clientPiece.pieceData.size || 100;
            this.maxVisibilityRange = 1500;
        };

        ThreePiece.prototype.attachModule = function(module, attachmentPoint) {
            return new ThreeModule(module, this.clientPiece, this.parentObject3d, attachmentPoint);
        };

        ThreePiece.prototype.getParentObject3d = function() {
            return this.parentObject3d;
        };


        ThreePiece.prototype.removeThreePiece = function() {
            ThreeAPI.removeModel(this.parentObject3d);
        };


        ThreePiece.prototype.sampleSpatial = function(spatial) {
            ThreeAPI.transformModel(this.parentObject3d, spatial.pos.getX(), spatial.pos.getY(), spatial.pos.getZ(), spatial.pitch(), spatial.yaw(), spatial.roll());

        };


        ThreePiece.prototype.addPieceDebugBox = function(size) {
            this.debugBox = ThreeAPI.loadModel(size, size, size);
            ThreeAPI.addChildToObject3D(this.debugBox, this.parentObject3d);
        };



        ThreePiece.prototype.showThreePiece = function() {
            ThreeAPI.showModel(this.parentObject3d);
        };


        ThreePiece.prototype.hideThreePiece = function() {
            ThreeAPI.hideModel(this.parentObject3d);
        };



        ThreePiece.prototype.setRendereable = function(bool) {
            if (this.render != bool) {
                if (bool) {
                    this.showThreePiece();
                } else {
                    this.hideThreePiece();
                }
            }
            this.render = bool;
        };


        ThreePiece.prototype.determineVisibility = function() {



            var distance = ThreeAPI.distanceToCamera(this.piece.spatial.posX(), this.piece.spatial.posY(), this.piece.spatial.posZ())

            // out of visibility range
            if (distance > this.maxVisibilityRange) {
                this.setRendereable(false);
                return this.render;
            }

            // camera inside bounds
            if (distance < this.boundingSize) {

                this.setRendereable(true);
                return this.render;
            }

            this.clientPiece.getScreenPosition(this.frustumCoords);

            // behind the camera
        //    if (this.frustumCoords.x == -1) {
        //        if (distance > this.boundingSize) {
        //            this.setRendereable(false);
        //            return this.render;
        //        }
        //    }

            var pad = this.boundingSize*Math.PI / Math.sqrt(distance);

            if (MATH.valueIsBetween(this.frustumCoords.x, 0, 1) && MATH.valueIsBetween(this.frustumCoords.y, 0, 1) ) {
                this.setRendereable(true);
            } else {

                if (ThreeAPI.checkVolumeObjectVisible(this.piece.spatial.posX(), this.piece.spatial.posY(), this.piece.spatial.posZ(), this.boundingSize)) {
                    this.setRendereable(true);
                } else {
                    this.setRendereable(false);
                }
            }

            return this.render;

        };

        ThreePiece.prototype.updateThreePiece = function() {

            if (this.determineVisibility()) {
                this.sampleSpatial(this.piece.spatial);
            }

        };


        return ThreePiece;

    });


