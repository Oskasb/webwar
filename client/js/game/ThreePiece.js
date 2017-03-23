"use strict";


define([
        'ThreeAPI',
        'PipelineObject'

    ],
    function(
        ThreeAPI,
        PipelineObject
    ) {

        var calcVec;

        var ThreePiece = function(piece, clientPiece) {

            calcVec = new MATH.Vec3(0, 0, 0);

            this.id = piece.id;
            this.piece = piece;
            this.clientPiece = clientPiece;
            this.parentObject3d = ThreeAPI.createRootObject();

            this.render = false;

            this.frustumCoords = new THREE.Vector3();
            this.boundingSize = this.clientPiece.pieceData.size || 100;

            var monBounds = function(serc, data) {
                if (data) {
                    this.addPieceDebugBox(this.boundingSize);
                } else {
                    this.removePieceDebugBox();
                }
            }.bind(this);

            this.debugPipe = new PipelineObject('STATUS', 'MON_BOUNDS', monBounds);
        };

        ThreePiece.prototype.addPieceDebugBox = function(size) {
            this.debugBox = ThreeAPI.loadModel(size, size, size);
            ThreeAPI.addChildToObject3D(this.debugBox, this.parentObject3d);
        };

        ThreePiece.prototype.removePieceDebugBox = function() {
            if (this.debugBox) {
                this.debugBox.parent.remove(this.debugBox);
            }
        };

        ThreePiece.prototype.includeAttachmentForVisibility = function(attachmentPoint) {

            if (attachmentPoint.transform.size.getLength()*0.7 > this.boundingSize) {
                this.boundingSize = attachmentPoint.transform.size.getLength()*0.7;
            }
        };

        ThreePiece.prototype.getVisibilityRange = function() {
            return (1+(this.boundingSize/10)*(this.boundingSize/10)) * 250;
        };


        ThreePiece.prototype.getParentObject3d = function() {
            return this.parentObject3d;
        };

        ThreePiece.prototype.removeThreePiece = function() {
            this.debugPipe.removePipelineObject();
            ThreeAPI.removeModel(this.parentObject3d);
        };

        ThreePiece.prototype.sampleSpatial = function(spatial) {
            ThreeAPI.transformModel(this.parentObject3d, spatial.pos.getX(), spatial.pos.getY(), spatial.pos.getZ(), spatial.pitch(), spatial.yaw(), spatial.roll());
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
            if (distance > this.getVisibilityRange()) {
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


