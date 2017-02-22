var CANNON = require('./cannon.js');

var THREE = require('three');

var threeEuler;
var threeEuler2;

PhysicsFunctions = function() {
    threeQuat = new THREE.Quaternion();
    threeEuler = new THREE.Euler(0, 0, 0, 'XZY');
    threeEuler2 = new THREE.Euler();
};

var lastTime;
var sphereBody;
var currentTime;

var groundMaterial;
var wheelMaterial;
var wheelGroundContactMaterial;

var threeQuat;


var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;
// Global settings
var settings = {
    stepFrequency: 60,
    quatNormalizeSkip: 2,
    quatNormalizeFast: true,
    gx: 0,
    gy: 0,
    gz: 0,
    iterations: 3,
    tolerance: 0.0001,
    k: 1e6,
    d: 3,
    scene: 0,
    paused: false,
    rendermode: "solid",
    constraints: false,
    contacts: false,  // Contact points
    cm2contact: false, // center of mass to contact points
    normals: false, // contact normals
    axes: false, // "local" frame axes
    particleSize: 0.1,
    shadows: false,
    aabbs: false,
    profiling: false,
    maxSubSteps:3
};


PhysicsFunctions.prototype.createCannonWorld = function() {



    this.calcVec = new CANNON.Vec3();
    
    var world = new CANNON.World();

     world.broadphase = new CANNON.SAPBroadphase(world);

    //  world.broadphase = new CANNON.NaiveBroadphase();

    world.defaultContactMaterial.friction = 0;

    groundMaterial = new CANNON.Material("groundMaterial");
    wheelMaterial = new CANNON.Material("wheelMaterial");
    wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000
    });

    // We must add the contact materials to the world
    world.addContactMaterial(wheelGroundContactMaterial);


    world.gravity.set(0,  0, -9.82); // m/s²
    world = world;
// Create a sphere
    var radius = 1; // m
    sphereBody = new CANNON.Body({
        mass: 5, // kg
        position: new CANNON.Vec3(10, 10, 2), // m
        shape: new CANNON.Sphere(radius)
    });
    world.addBody(sphereBody);

// Create a plane
    var groundBody = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        allowSleep:false
    });

    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
//    world.addBody(groundBody);

//    groundBody.quaternion.setFromEuler(1, 1, 0, 'XYZ');

    fixedTimeStep = 1.0 / 60.0; // seconds
    maxSubSteps = 3;




    function makeSureNotZero(vec){
        if(vec.x===0.0){
            vec.x = 1e-6;
        }
        if(vec.y===0.0){
            vec.y = 1e-6;
        }
        if(vec.z===0.0){
            vec.z = 1e-6;
        }
    }

    // Start the simulation loop

    return world;
};


PhysicsFunctions.prototype.applyBodyToSpatial = function(piece) {

    
    
    var body = piece.physics.body;
    
    if (!body) {
        console.log("No body on", piece.id);
        return;

    } else {
    //    console.log(body.position.x, body.position.z, body.position.y)
    }

    body.quaternion.toEuler(this.calcVec);



    threeEuler.x = this.calcVec.x;
    threeEuler.y = this.calcVec.y;
    threeEuler.z = this.calcVec.z;


    threeQuat.setFromEuler(threeEuler);

 //   threeQuat.x = body.quaternion.x;
 //   threeQuat.y = body.quaternion.y;
 //   threeQuat.z = body.quaternion.z;
 //   threeQuat.w = body.quaternion.w;

    threeEuler2.setFromQuaternion(threeQuat, 'XYZ');
 //   threeEuler.reorder('XZY');
    
    /*
    piece.spatial.setPosXYZ(body.position.x,                body.position.y,               body.position.z);
    piece.spatial.fromAngles(this.calcVec.x,                this.calcVec.y,                 this.calcVec.z );
    piece.spatial.setVelocity(body.velocity.x,              body.velocity.y,               body.velocity.z);
    piece.spatial.setRotVelAngles(body.angularVelocity.x,   body.angularVelocity.y, body.angularVelocity.z);
     */

    console.log(threeEuler2.x ,          threeEuler2.z, threeEuler2.y);

    piece.spatial.setPosXYZ(body.position.x,                 body.position.z, body.position.y);

    piece.spatial.fromAngles(threeEuler2.x,          threeEuler2.z -Math.PI*0.5, threeEuler2.y );

    //    piece.spatial.fromAngles(this.calcVec.x,                this.calcVec.z-Math.PI*0.5,                 this.calcVec.y );

    piece.spatial.setVelocity(body.velocity.x,              body.velocity.z, body.velocity.y);

 //   piece.spatial.setRotVelAngles(body.angularVelocity.x,   body.angularVelocity.z, body.angularVelocity.y);

};

PhysicsFunctions.prototype.updateCannonWorld = function(world, currentTime) {


    if(lastTime !== undefined){
        var dt = (currentTime - lastTime);
        world.step(fixedTimeStep, dt, maxSubSteps);
    }
 //   console.log("Sphere xyz position: "+ sphereBody.position.x +' _ '+ sphereBody.position.y+' _ '+ sphereBody.position.z);
    lastTime = currentTime;

};



PhysicsFunctions.prototype.createCannonTerrain = function(world, data, totalSize, posx, posz,minHeight, maxHeight) {

    console.log("POS:",  posx, posz, totalSize, minHeight)
    var matrix = data;

    var hfShape = new CANNON.Heightfield(matrix, {
        elementSize: totalSize / data.length
    });
    var hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.position.set(posx, posz, minHeight);

    world.addBody(hfBody);

};


PhysicsFunctions.prototype.buildCannonBody = function(world, spatial, bodyParams) {
    
    console.log("ELEVATION FOR BODY:", spatial.pos.data, bodyParams.size);

    if (bodyParams.shape == 'Vehicle') {
        var rigidBody = createVehicle(world, spatial, bodyParams);
        return rigidBody;



    } else {

        var shape = new CANNON[bodyParams.shape](bodyParams.size);
        var body = {
            mass: bodyParams.mass, // kg
            position: new CANNON.Vec3(spatial.posX(), spatial.posZ(), spatial.posY()+bodyParams.size), // m
            shape: shape
        };

        var ridigBody = new CANNON.Body(body);
    //    world.addBody(ridigBody);
        ridigBody.calcVec = new CANNON.Vec3();
        ridigBody.calcVec2 = new CANNON.Vec3();
        world.addBody(ridigBody);
        return ridigBody;
    }

};


var createVehicle = function(world, spatial, bodyParams) {

    var mass = 550;
    var vehicle;

 //   var groundMaterial = new CANNON.Material("groundMaterial");
 //   var wheelMaterial = new CANNON.Material("wheelMaterial");

    var width = 2;
    var length = 3;
    var clearance = 0.5;

    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(length*2, width*2, 0.7));
    var chassisBody = new CANNON.Body({ mass: mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(spatial.posX(), spatial.posZ(), spatial.posY()+bodyParams.size);
    chassisBody.angularVelocity.set(0, 0, 0.2);




    var options = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, -1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(length, length, 0),
        maxSuspensionTravel: 0.5,
        customSlidingRotationalSpeed: -20,
        useCustomSlidingRotationalSpeed: true
    };

    // Create the vehicle
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,//
    });

    chassisBody.vehicle = vehicle;

    options.chassisConnectionPointLocal.set(-width, -length, -clearance);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-width, length, -clearance);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(width, -length, -clearance);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(width, length, -clearance);
    vehicle.addWheel(options);

    vehicle.addToWorld(world);

    var wheelBodies = [];
    for(var i=0; i<vehicle.wheelInfos.length; i++){
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
        var wheelBody = new CANNON.Body({ mass: 1 });
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
    }

    // Update wheels
    world.addEventListener('postStep', function(){
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            var t = vehicle.wheelInfos[i].worldTransform;
            wheelBodies[i].position.copy(t.position);
            wheelBodies[i].quaternion.copy(t.quaternion);
        }
    });

    var matrix = [];
    var sizeX = 64,
        sizeY = 64;

    for (var i = 0; i < sizeX; i++) {
        matrix.push([]);
        for (var j = 0; j < sizeY; j++) {
            var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
            if(i===0 || i === sizeX-1 || j===0 || j === sizeY-1)
                height = 3;
            matrix[i].push(height);
        }
    }
    
    var maxSteerVal = 0.5;
    var maxForce = 1000;
    var brakeForce = 1000000;
    
    return chassisBody;
    
};





    