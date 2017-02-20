
require('./PhysicsFunctions.js');

CannonAPI = function() {
    this.physicsFunctions = new PhysicsFunctions();

};

CannonAPI.prototype.initServerPhysics = function() {
    this.world =  this.physicsFunctions.createCannonWorld()
};


CannonAPI.prototype.buildPhysicalTerrain = function(data, size, pos, min_height, max_height) {
    this.physicsFunctions.createCannonTerrain(this.world, data, size, pos, min_height, max_height)
};

CannonAPI.prototype.attachPiecePhysics = function(piece) {
    
    if (piece.physics.rigid_body) {
        console.log("PiecePhysics", piece.id, piece.physics.ridig_body)
        var rb = body = this.buildRigidBody(piece.spatial.pos, piece.physics.rigid_body);

        piece.physics.body = rb;
    } else {
        console.log("No body on this!")
    }



};


CannonAPI.prototype.buildRigidBody = function(pos, bodyParams) {
    body =  this.physicsFunctions.buildCannonBody(this.world, pos, bodyParams)
    this.world.addBody(body);
    return body;
};




CannonAPI.prototype.updatePhysicalPiece = function(piece) {
    this.physicsFunctions.applyBodyToSpatial(piece);

};


CannonAPI.prototype.updatePhysicsSimulation = function() {
    this.physicsFunctions.updateCannonWorld(this.world)
};