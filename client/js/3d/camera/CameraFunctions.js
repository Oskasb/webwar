"use strict";


define(['PipelineAPI','ThreeAPI'], function(PipelineAPI, ThreeAPI) {


    var pieces;
    var headingVec;
    var calcVec;
    var hasTarget;
    var targetDistance = 0;

    var CameraFunctions = function() {
        headingVec = new MATH.Vec3(0, 0, 0);
        calcVec = new MATH.Vec3(0, 0, 0);
        this.cameraTarget;

        this.distanceFactor = 0.001;
        this.distanceLimit = 200;

        this.velocityFactor = 1;

        this.targetPos  = new THREE.Vector3(0, 0, 0);
        this.targetVel = new THREE.Vector3(0, 0, 0);
        this.targetDir = new THREE.Vector3(0, 0, 0);
        this.targetRotVel = new THREE.Vector3(0, 0, 0);

        this.targetIdeal = new THREE.Vector3(0, 0, 0);
        this.finalTPos = new THREE.Vector3(0, 0, 0);

        this.cameraIdeal = new THREE.Vector3(0, 0, 0);
        this.finalCPos = new THREE.Vector3(0, 0, -10);


        this.distance  = new THREE.Vector3(0, 0, 7);

        this.frameCPos = new THREE.Vector3(0, 0, 0);
        this.frameTPos = new THREE.Vector3(0, 0, 0);

        this.moochVec  = new THREE.Vector3(0, 0, 0);
        this.calcVec   = new THREE.Vector3(0, 10, 0);
        this.forVec   = new THREE.Vector3(0, 10, 0);
        this.calcVec2 = new THREE.Vector3(0, 10, 0);
        this.calcVec3 = new THREE.Vector3(0, 10, 0);

        this.lookAtElevation = new THREE.Vector3(0, 2, 0);
        this.elevation = new THREE.Vector3(0, 3, 0);

        this.passiveinfluence = new THREE.Vector3(0, 0, -1);
        this.influence = new THREE.Vector3(0, 0, -1);


        this.masterCamLerp = 0.03;
        this.masterPosLerp = 0.06;
        this.camLerpFactor = this.masterCamLerp;

        this.posLerpFactor = this.masterPosLerp;

        this.lerpLimit = 2;
        this.rotVelFactor = 100;

        this.rotVel = 0;

        this.frameDist = 0;
        this.frameVel = 0;
        this.maxDist = 30;

        this.headingMin = 4;
        this.followMin = 4;


        pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');

        var clear;

        var selected = function(src, data) {

            clearTimeout(clear, 1);

            targetId = data;
            clear = setTimeout(function() {
                targetId = null;
            }, 4000);

        };
        PipelineAPI.subscribeToCategoryKey("GAME_DATA", "TOGGLE_TARGET_SELECTED", selected);

    };
    var targetId;

    CameraFunctions.prototype.checkTarget = function() {

         //this.targetPiece.readServerModuleState('input_target_select')[0].value;

        if (targetId) {
       //     console.log("HAS TARGET ID")
            if (pieces[targetId]) {
                if (!hasTarget) {
                }
                hasTarget = true;
                return targetId;
            }
        }

        if (hasTarget) {
            console.log("DROP TARGET")
            hasTarget = false;
        }

        return false;
    };

    CameraFunctions.prototype.setCameraTargetPiece = function(piece) {
        this.targetPiece = piece.piece;
    };

    CameraFunctions.prototype.setToIdealFrame = function() {


        this.frameTPos.x = this.targetIdeal.x;
        this.frameTPos.y = this.targetIdeal.y;
        this.frameTPos.z = this.targetIdeal.z;

        this.frameCPos.x = this.cameraIdeal.x;
        this.frameCPos.y = this.cameraIdeal.y;
        this.frameCPos.z = this.cameraIdeal.z;

    };

    CameraFunctions.prototype.calcTargetIdealPosition = function() {
        this.calcVec.addVectors(this.forVec, this.lookAtElevation);
        this.targetIdeal.addVectors(this.target, this.calcVec);
    };


    CameraFunctions.prototype.calcDistanceGain = function() {
        return Math.sqrt(9+this.frameVel)-4 + this.rotVel*this.rotVel*this.rotVel*1.1 + Math.sqrt(this.frameVel*this.frameVel*this.frameVel*this.frameVel*0.005);
    };



    CameraFunctions.prototype.calcIdealElevations = function() {
        this.calcVec.subVectors(this.cameraIdeal, this.targetPos);

        var distance = Math.max(this.maxDist*0.2, this.calcVec.length()*0.01)*0.1;

        this.targetIdeal.y += this.lookAtElevation.y+this.frameVel*0.05;
        this.cameraIdeal.y = this.targetPos.y + this.elevation.y + distance + this.frameVel*0.25;
    };




    CameraFunctions.prototype.calcCameraOutOfBounds = function() {

        this.frameDist = this.distanceFactor * this.camLerpFactor;
        if (this.frameDist > this.lerpLimit) {
            this.frameDist = this.lerpLimit
        }

    };

    CameraFunctions.prototype.copyTargetPos = function(vec) {
        var target = this.checkTarget();

        if (target) {
            var pos = pieces[target].piece.spatial.pos;

            vec.x = pos.data[0];
            vec.y = pos.data[1];
            vec.z = pos.data[2];}

    };



    CameraFunctions.prototype.calcTargetIdealPosition = function() {

        var distance = this.headingMin+this.calcDistanceGain();

        MATH.radialToVector(MATH.addAngles(this.targetDir.y-Math.PI*0.5, this.targetRotVel.y*0.1), distance, calcVec);

        this.calcVec2.x = calcVec.data[0];
        this.calcVec2.y = calcVec.data[1];
        this.calcVec2.z = calcVec.data[2];

        var target = this.checkTarget();

        if (target) {
            this.copyTargetPos(this.calcVec);
            this.calcVec2.lerp(this.calcVec, 0.5);
            targetDistance = this.headingMin + this.calcVec2.length()*0.2;
        } else {
            targetDistance = this.headingMin;
        }

        this.targetIdeal.addVectors(this.targetPos, this.calcVec2);
    };

    CameraFunctions.prototype.calcCameraIdealPosition = function() {

        var target = this.checkTarget();

        if (target) {
            this.copyTargetPos(this.calcVec);
            var distance = 4 + this.followMin+this.calcDistanceGain();
        } else {
            this.calcVec.copy(this.targetPos);
            var distance = this.followMin+this.calcDistanceGain();
        }

        MATH.radialToVector(MATH.addAngles(this.targetDir.y+Math.PI*0.5, this.targetRotVel.y*0.5), targetDistance, calcVec);

        this.camLerpFactor += this.targetRotVel.y*0.5;

        this.calcVec.normalize();

        this.calcVec2.x = calcVec.data[0];
        this.calcVec2.y = calcVec.data[1];
        this.calcVec2.z = calcVec.data[2];

        this.calcVec2.normalize();
        this.calcVec2.subVectors(this.calcVec2, this.calcVec);

        this.calcVec2.multiplyScalar(distance);
        this.cameraIdeal.addVectors(this.targetPos, this.calcVec2);

    };


    CameraFunctions.prototype.mooch = function(ideal, final, lerpfac) {

        ideal.subVectors(ideal, this.targetPos);
        final.subVectors(final, this.targetPos);

        final.lerp(ideal, lerpfac);
        final.addVectors(this.targetPos, final);

        return;

        this.moochVec.subVectors(ideal, final);

        var dist = this.moochVec.length();
       //   this.moochVec.multiplyScalar(lerpfac);

        final.lerp(ideal, lerpfac);


    };


    CameraFunctions.prototype.moochIt = function() {
        this.mooch(this.targetIdeal, this.frameTPos, this.posLerpFactor);
        this.mooch(this.cameraIdeal, this.frameCPos, this.camLerpFactor);
    };

    CameraFunctions.prototype.updateCamera = function() {

        var targetPos = this.targetPiece.spatial.pos;
        this.targetPiece.spatial.getHeading(headingVec);
        var targetVel = this.targetPiece.spatial.vel;
        var targetRotVel = this.targetPiece.spatial.rotVel;
        var targetRot = this.targetPiece.spatial.rot;

        this.targetPos.x = targetPos.data[0];
        this.targetPos.y = targetPos.data[1];
        this.targetPos.z = targetPos.data[2];
        this.targetVel.x = targetVel.data[0];
        this.targetVel.y = targetVel.data[1];
        this.targetVel.z = targetVel.data[2];

        this.targetDir.x = Math.sin(headingVec.data[0]);
        this.targetDir.y = targetRot.data[1];
        this.targetDir.z = Math.sin(headingVec.data[2]);


        this.targetRotVel.y = targetRotVel.data[1];

        this.rotVel = this.targetRotVel.length();
        this.frameVel = this.targetVel.length();


        this.calcTargetIdealPosition();
        this.calcCameraIdealPosition();

        this.calcVec.subVectors(this.finalTPos, this.finalCPos);
        this.distanceFactor = this.calcVec.length();

        if (this.distanceFactor > this.maxDist) {
            this.posLerpFactor = 0.04;
            this.camLerpFactor = 0.01;
            //    this.targetIdeal.x = this.targetPos.x;
            //    this.targetIdeal.y = this.targetPos.y;
            //    this.targetIdeal.z = this.targetPos.z;
        } else {
            this.posLerpFactor = this.masterPosLerp;
            this.camLerpFactor = this.masterCamLerp;
        }


        if (this.distanceFactor > this.distanceLimit) {
            this.distanceFactor = this.distanceLimit;
            //    this.setToIdealFrame();
        }

        this.calcIdealElevations();

        this.moochIt();

        this.finalTPos.x =  this.frameTPos.x;
        this.finalTPos.y =  this.frameTPos.y;
        this.finalTPos.z =  this.frameTPos.z;
        this.finalCPos.x =  this.frameCPos.x;
        this.finalCPos.y =  this.frameCPos.y;
        this.finalCPos.z =  this.frameCPos.z;


        ThreeAPI.setCameraPos(

            this.finalCPos.x,
            this.finalCPos.y,
            this.finalCPos.z

        );

        ThreeAPI.cameraLookAt(
            this.finalTPos.x,
            this.finalTPos.y,
            this.finalTPos.z
        )
    };


    return CameraFunctions

});