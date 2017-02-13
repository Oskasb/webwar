ServerCollisionDetection = function() {

    this.calcVec = new MATH.Vec3(0, 0, 0);
    this.calcVec2 = new MATH.Vec3(0, 0, 0);
    this.calcVec3 = new MATH.Vec3(0, 0, 0);
    this.calcVec4 = new MATH.Vec3(0, 0, 0);
    this.calcVec5 = new MATH.Vec3(0, 0, 0);
    this.calcVec6 = new MATH.Vec3(0, 0, 0);
    
    this.shapeStore1 = {size:0};
    this.shapeStore2 = {size:0};
    
    
};

ServerCollisionDetection.prototype.checkIntersection = function(pieceA, pieceB, storePos, storeNorm) {

    if (pieceA.spatial.vel.getLengthSquared() < pieceB.spatial.vel.getLengthSquared()) {
        return this.fastPieceAgainstSlowPiece(pieceB, pieceA, storePos, storeNorm);
    } else {
        return this.fastPieceAgainstSlowPiece(pieceA, pieceB, storePos, storeNorm);
    }
};


ServerCollisionDetection.prototype.fastPieceAgainstSlowPiece = function(fastPiece, slowPiece,  storePos, storeNorm) {

    if (fastPiece.spatial.getVelVec().getLengthSquared() < 0.01) {
        return false;
    }

    this.calcVec.setVec(fastPiece.spatial.getVelVec());



    this.calcVec2.setVec(fastPiece.spatial.getPosVec());
    this.calcVec3.setVec(slowPiece.spatial.getPosVec());

    this.calcVec.scale(fastPiece.temporal.stepTime);

    slowPiece.getCollisionShape(this.shapeStore1);
    fastPiece.getCollisionShape(this.shapeStore2);

    var r = this.shapeStore1.size;
    var r2 = this.shapeStore2.size;
    
    if (this.calcVec2.getDistance(this.calcVec3) > this.calcVec.getLength()*2 + 2*r + 2*r2) {
        // too far apart to intersect this frame;
        return;
    }


    var steps = Math.ceil(this.calcVec.getLength() / (r+r2))*20;
    this.calcVec.scale(1/steps);

    var dist = 0;
    var lastDist = Number.MAX_VALUE;

    for (var i = 0; i < steps*2; i++) {

        this.calcVec2.addVec(this.calcVec);

        dist = this.calcVec2.getDistance(this.calcVec3);

        if (lastDist < dist) {
            return false;
        }

        if (dist < (r+r2)) {
            storePos.setVec(this.calcVec2);
            storeNorm.setVec(this.calcVec3);
            storeNorm.subVec(storePos);
            storeNorm.scale(1/(storeNorm.getDistance(storePos)));
            return true;
        }

        lastDist = dist;
    }

};

