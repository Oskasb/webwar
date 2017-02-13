"use strict";


define(['PipelineAPI',], function(PipelineAPI) {
    
    var Vector3 = goo.Vector3;
    var playerPiece;
    var forVec;
    var calcVec = new Vector3();
    var calcVec2 = new Vector3();
    var pieces;

    var CameraFunctions = function() {
        lastPos = new MATH.Vec3(0, 0, 0);
        forVec = new MATH.Vec3(0, 0, 0);
        pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
    };
    
    var lastPos;
    var lookAtPoint = new goo.Vector3();
    var camPos = new goo.Vector3();
    var lastLerpPos = new goo.Vector3();
    var targetPos = new goo.Vector3();
    var lastLookAtPoint = new goo.Vector3();

    var elevFromVel = function(velVec, factor) {
        return -velVec.getZ() * Math.sqrt(Math.abs(velVec.getZ() * factor));
    };


    var lookAtPointFromVel = function(velVec, factor) {
        return -velVec.getZ() * Math.sqrt(Math.abs(velVec.getZ() * factor));
    };


    var lookAtPos = function(pos, store) {


        store.x = pos.getX();
        store.y = pos.getY();
        store.z = pos.getZ();

        return store;
    };

    var checkTarget = function() {

        var id = PipelineAPI.readCachedConfigKey("CONTROL_STATE","TOGGLE_TARGET_SELECTED");
        if (id) {
            if (pieces[id]) return id;
        }
        return false;
    };

    var getCurrentTarget = function(id) {

        return pieces[id].piece;
    };


    CameraFunctions.prototype.updateCamera = function(tpf, cameraEntity, ownPiece) {
        playerPiece = ownPiece.piece;
        playerPiece.spatial.getForwardVector(forVec);
        var speedFactor = Math.min(playerPiece.spatial.vel.getLengthSquared(), 20);

        var distanceFactor = 0;

        forVec.scale(0.5);
        // forVec.addVec(playerPiece.spatial.vel);
        // forVec.scale(0.4);

        cameraEntity.transformComponent.transform.translation.setVector(lastLerpPos);

        lookAtPoint.lerp(lookAtPos(playerPiece.spatial.pos, calcVec), 0.1);

        calcVec.setDirect(forVec.getX()*0.2 + forVec.getX()*speedFactor*0.05, forVec.getY(), forVec.getZ()*0.5 + Math.min(forVec.getZ()*0.2 + forVec.getZ()*speedFactor*0.01, 0.5));
        calcVec.scale(0.7 + speedFactor*0.03);

        lookAtPoint.add(calcVec);
        lookAtPoint.y = MATH.clamp(elevFromVel(playerPiece.spatial.vel, 1)*0.2, 1, 3) + 2;

        cameraEntity.lookAtPoint = lookAtPoint;

        var selectedTarget = checkTarget();
        if (selectedTarget) {
            var currentTarget = getCurrentTarget(selectedTarget);
            targetPos.setDirect(currentTarget.spatial.posX(), currentTarget.spatial.posY(), currentTarget.spatial.posZ());
            lookAtPos(playerPiece.spatial.pos, calcVec);
            distanceFactor = targetPos.distance(calcVec)*0.1;
            targetPos.sub(calcVec);
            targetPos.scale(0.1);
        } else {
            targetPos.set(0, 0, 0);
            distanceFactor = 0;
        }


        calcVec.set(lookAtPoint);

        calcVec.y = lookAtPoint.y + MATH.clamp(elevFromVel(playerPiece.spatial.vel, 2)*0.3 + 1, 1, 10) + 0.2 * speedFactor;

        calcVec.addDirect(
            -forVec.getX()*speedFactor-forVec.getX() - targetPos.x / Math.abs(targetPos.z+1),
            -forVec.getY(), -Math.max(Math.sin(forVec.getZ())*-80, 0)
            -forVec.getZ()*speedFactor-forVec.getZ()
        );

        //   camPos.z -= 12+playerPiece.spatial.vel.getZ();

        calcVec.z -= MATH.clamp(-12 - playerPiece.spatial.vel.getZ()*4, 2, 40);

        calcVec.z -= calcVec.y+ distanceFactor*0.01;

        calcVec.z -= speedFactor*0.01 + distanceFactor*0.01 +Math.clamp(targetPos.z / Math.abs(targetPos.x +1)*5, -100, 2);

        lastLerpPos.lerp(calcVec, 0.01);




        calcVec.set(cameraEntity.lookAtPoint);
        calcVec.lerp(lookAtPoint, 0.001);
        cameraEntity.lookAtPoint = calcVec;


        calcVec2.set(calcVec);
        lastLookAtPoint.lerp(targetPos, 0.01);
        calcVec2.add(lastLookAtPoint);


        cameraEntity.transformComponent.transform.translation.lerp(lastLerpPos, 0.1);
        cameraEntity.transformComponent.transform.lookAt(calcVec2, Vector3.UNIT_Y);
    };
    

    return CameraFunctions

});