var CANNON = require('./cannon.js');

var THREE = require('three');

var threeVec;
var threeEuler;
var threeEuler2;
var threeObj;
var threeObj2;

var MATHVec3;

PhysicsFunctions = function() {
    MATHVec3 = new MATH.Vec3();
    threeVec = new THREE.Vector3();
    threeObj = new THREE.Object3D();
    threeObj2 = new THREE.Object3D();
    threeQuat = new THREE.Quaternion();
    threeEuler = new THREE.Euler(0, 0, 0, 'XZY');
    threeEuler2 = new THREE.Euler();
    this.calcVec = new CANNON.Vec3();
    this.calcVec2 = new CANNON.Vec3();
};

var lastTime;
var sphereBody;
var currentTime;

var groundMaterial;
var wheelMaterial;
var wheelGroundContactMaterial;

var threeQuat;


var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 5;
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

    fixedTimeStep = 1.0 / 120.0; // seconds
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

var orders = [
    'XYZ',
    'YXZ',
    'ZXY',
    'ZYX',
    'YZX',
    'XZY'
];

PhysicsFunctions.prototype.applyBodyToSpatial = function(piece) {
    
    
    var body = piece.physics.body;
    
    if (!body) {
        console.log("No body on", piece.id);
        return;

    } else {
    //    console.log(body.position.x, body.position.z, body.position.y)
    }


    threeObj.setRotationFromQuaternion(body.quaternion);
 //   threeObj.rotateY(Math.PI*0.5);

    threeObj.rotation.setFromQuaternion(
        body.quaternion,
        orders[0]
    );


    var angY = -MATH.addAngles(threeObj.rotation.z, -Math.PI*0.5);
    var angX = -threeObj.rotation.x * Math.cos(angY) +threeObj.rotation.y * Math.sin(angY); // -MATH.addAngles(threeObj.rotation.x*Math.sin(threeObj.rotation.z), 0);// ) * Math.cos(threeObj.rotation.y) - (Math.sin(threeObj.rotation.z) * Math.cos(threeObj.rotation.y*Math.PI));
    var angZ = -threeObj.rotation.y // + threeObj.rotation.x * Math.sin(angY) ;


    piece.spatial.setPosXYZ(body.position.x,                 body.position.z, body.position.y);

    piece.spatial.fromAngles(angX,angY, angZ);

    piece.spatial.setVelocity(body.velocity.x,              body.velocity.z, body.velocity.y);

    piece.spatial.setRotVelAngles(body.angularVelocity.x,   -body.angularVelocity.z, -body.angularVelocity.y);

};

var remaining = 0;

var doStep = function(world, fixed, dt, maxSteps) {
    world.step(world, fixed, dt, maxSteps)
};


PhysicsFunctions.prototype.updateCannonWorld = function(world, currentTime) {


    if(lastTime !== undefined){
        var dt = (currentTime - lastTime);

        remaining = dt + remaining;

            while (remaining > MODEL.PhysicsStepTime*MODEL.PhysicsMaxSubSteps) {

        world.step(MODEL.PhysicsStepTime, dt, MODEL.PhysicsMaxSubSteps);

         //   doStep(world, fixedTimeStep, dt, maxSubSteps) ;

            remaining -= MODEL.PhysicsStepTime*MODEL.PhysicsMaxSubSteps;
       }

    }
 //   console.log("Sphere xyz position: "+ sphereBody.position.x +' _ '+ sphereBody.position.y+' _ '+ sphereBody.position.z);
    lastTime = currentTime;

};



PhysicsFunctions.prototype.createCannonTerrain = function(world, data, totalSize, posx, posz,minHeight, maxHeight) {

 //   console.log("POS:",  posx, posz, totalSize, minHeight)
    var matrix = data;

    var hfShape = new CANNON.Heightfield(matrix, {
        elementSize: ((totalSize) / (data.length-1))
    });
    var hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.position.set(posx, posz, minHeight);
    return hfBody;
};


PhysicsFunctions.prototype.buildCannonBody = function(world, spatial, bodyParams) {
    
//    console.log("ELEVATION FOR BODY:", spatial.pos.data, bodyParams.size);

    if (bodyParams.shape == 'Vehicle') {
        var rigidBody = createVehicle(world, spatial, bodyParams);
        return rigidBody;



    } else {

        var size = bodyParams.size

        if (bodyParams.shape == "Box") {
            size = new CANNON.Vec3(size, size, size)
        } else {

        }

        var shape = new CANNON[bodyParams.shape](size);
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


    var vehicle;

 //   var groundMaterial = new CANNON.Material("groundMaterial");
 //   var wheelMaterial = new CANNON.Material("wheelMaterial");


    var width = bodyParams.width || 1.5;
    var length = bodyParams.length || 3.1;
    var height = bodyParams.height || 1.1;
    var clearance = bodyParams.clearance || 0.2;
    var mass = bodyParams.mass || 8550;

    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(length, width, height));
    var chassisBody = new CANNON.Body({ mass: mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(spatial.posX(), spatial.posZ(), spatial.posY()+bodyParams.height*2);
    chassisBody.angularVelocity.set(0, 0, 0.1);

    // Create the vehicle
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody
    });

    chassisBody.vehicle = vehicle;

    vehicle.brake  = bodyParams.brake  || 5;
    vehicle.torque = bodyParams.torque || 50;
    vehicle.enginePower = bodyParams.enginePower || 800000;

    vehicle.addToWorld(world);

    var wOpts = bodyParams.wheelOptions;

    var options = {
        radius: wOpts.radius || 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: wOpts.suspensionStiffness || 17,
        suspensionRestLength: wOpts.suspensionLength || 0.6,
        frictionSlip: wOpts.frictionSlip || 4.8,
        dampingRelaxation: wOpts.dampening / 2 || 1.81,
        dampingCompression: wOpts.dampening    || 2.5,
        maxSuspensionForce: wOpts.maxSuspensionForce || 148000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, -1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(width/2, length/1.7, height*0.05),
        maxSuspensionTravel: wOpts.suspensionLength || 0.6,
        customSlidingRotationalSpeed: -2,
        useCustomSlidingRotationalSpeed: true
    };



    length -= options.radius;

    var wheelsMat = [
        [-1,  0.9,    1],[1, 0.9,     1],
        [-1, -0.9,    1],[1,-0.9,     1]
    ];

    var steerMat = [
        1, 1,
        0, 0
    ];

    var brakeMat = [
        0.2,0.2,
        1  ,1
    ];

    var transmissionMat = [
        1,1,
        0,0
    ];

    var transmissionYawMat = [
        0,0,
        0,0
    ];

    var wheelMatrix = bodyParams.wheelMatrix || wheelsMat;

    var steerMatrix = bodyParams.steerMatrix || steerMat;
    var brakeMatrix = bodyParams.brakeMatrix || brakeMat;
    var transmissionMatrix = bodyParams.transmissionMatrix || transmissionMat;
    var transmissionYawMatrix = bodyParams.transmissionYawMatrix || transmissionYawMat;

    for (var i = 0; i < wheelMatrix.length; i++) {
        options.chassisConnectionPointLocal.set(length * wheelMatrix[i][1], width * wheelMatrix[i][0], -clearance*wheelMatrix[i][2]);
        vehicle.addWheel(options);
        vehicle.wheelInfos[i].steerFactor           = steerMatrix[i]            || 0;
        vehicle.wheelInfos[i].brakeFactor           = brakeMatrix[i]            || 1;
        vehicle.wheelInfos[i].transmissionFactor    = transmissionMatrix[i]     || 1;
        vehicle.wheelInfos[i].transmissionYawMatrix = transmissionYawMatrix[i]  || 1;
    }

    return chassisBody;
    
};





    