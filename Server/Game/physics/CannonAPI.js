
require('./PhysicsFunctions.js');

CannonAPI = function() {
    this.physicsFunctions = new PhysicsFunctions();

};

CannonAPI.prototype.initServerPhysics = function() {
    this.world =  this.physicsFunctions.createCannonWorld()
};


CannonAPI.prototype.buildPhysicalTerrain = function(data, size, posx, posz, min_height, max_height) {
    this.physicsFunctions.createCannonTerrain(this.world, data, size, posx, posz, min_height, max_height)
};

CannonAPI.prototype.attachPiecePhysics = function(piece) {
    
    if (piece.physics.rigid_body) {
//        console.log("PiecePhysics", piece.id, piece.physics.rigid_body, piece.spatial)
        var rb = body = this.buildRigidBody(piece.spatial, piece.physics.rigid_body);

        piece.physics.body = rb;
    } else {
        console.log("No body on this!")
    }



};


CannonAPI.prototype.buildRigidBody = function(spatial, bodyParams) {
    body =  this.physicsFunctions.buildCannonBody(this.world, spatial, bodyParams)
    return body;
};


CannonAPI.prototype.removePhysicsPiece = function(piece) {
    console.log("REMOVE RIGID BODY:", piece.physics.rigid_body);
    this.world.removeBody(piece.physics.body);

};




CannonAPI.prototype.updatePhysicalPiece = function(piece) {
    this.physicsFunctions.applyBodyToSpatial(piece);

};


CannonAPI.prototype.updatePhysicsSimulation = function(currentTime) {
    this.physicsFunctions.updateCannonWorld(this.world, currentTime)
};