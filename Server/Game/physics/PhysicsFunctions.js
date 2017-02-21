var CANNON = require('./cannon.js');

PhysicsFunctions = function() {

};

var lastTime;
var sphereBody;
var currentTime;

var groundMaterial;
var wheelMaterial;
var wheelGroundContactMaterial;


PhysicsFunctions.prototype.createCannonWorld = function() {

    this.calcVec = new CANNON.Vec3();
    
    var world = new CANNON.World();

    world.broadphase = new CANNON.SAPBroadphase(world);
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


    world.gravity.set(0, -9.82, 0); // m/s²
    world = world;
// Create a sphere
    var radius = 1; // m
    sphereBody = new CANNON.Body({
        mass: 5, // kg
        position: new CANNON.Vec3(0, 0, 510), // m
        shape: new CANNON.Sphere(radius)
    });
    world.addBody(sphereBody);

// Create a plane
    var groundBody = new CANNON.Body({
        mass: 0 // mass == 0 makes the body static
    });

    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

    fixedTimeStep = 1.0 / 60.0; // seconds
    maxSubSteps = 3;


    // Global settings
    var settings = this.settings = {
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
    }
    body.quaternion.toEuler(this.calcVec);
    piece.spatial.setPosXYZ(body.position.x, body.position.y, body.position.z);
    piece.spatial.fromAngles(this.calcVec.x, this.calcVec.y, this.calcVec.z);
    piece.spatial.setVelocity(body.velocity.x, body.velocity.y, body.velocity.z);
    piece.spatial.setRotVelAngles(body.angularVelocity.x, body.velocity.y, body.velocity.z);

};

PhysicsFunctions.prototype.updateCannonWorld = function(world) {


    if(lastTime !== undefined){
        var dt = (currentTime - lastTime) / 1000;
        world.step(fixedTimeStep, dt, maxSubSteps);
    }
    console.log("Sphere z position: " + sphereBody.position.z);
    lastTime = currentTime;

};



PhysicsFunctions.prototype.createCannonTerrain = function(world, data, totalSize, pos, minHeight, maxHeight) {


    var size = totalSize / data.length;

    console.log(size)
    // Create the heightfield shape

    var heightfieldShape = new CANNON.Heightfield(data, {elementSize: size }); // Distance between the data points in X and Y directions});
    var heightfieldBody = new CANNON.Body();
    heightfieldBody.addShape(heightfieldShape);
    heightfieldBody.position.set(pos[0],  minHeight, pos[2]);
    world.addBody(heightfieldBody);
 //   console.log(size , Math.sqrt(data.length));
};


PhysicsFunctions.prototype.buildCannonBody = function(world, pos, bodyParams) {

    if (bodyParams.shape == 'Vehicle') {
     return createVehicle(world, pos)

    } else {
        var shape = new CANNON[bodyParams.shape](bodyParams.size);
        var body = {
            mass: 5, // kg
            position: new CANNON.Vec3(pos[0], pos[1], pos[2]), // m
            shape: shape
        };

        var ridigBody = new CANNON.Body(body);
    //    world.addBody(ridigBody);
        ridigBody.calcVec = new CANNON.Vec3();
        ridigBody.calcVec2 = new CANNON.Vec3();
        return ridigBody;
    }

};


var createVehicle = function(world, pos) {

    var mass = 150;
    var vehicle;

    var groundMaterial = new CANNON.Material("groundMaterial");
    var wheelMaterial = new CANNON.Material("wheelMaterial");
    

    var chassisShape;
    chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
    var chassisBody = new CANNON.Body({ mass: mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(pos[0], pos[1]+3, pos[2]);
    chassisBody.angularVelocity.set(0, 0, 0.5);


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
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };

    // Create the vehicle
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
    });

    options.chassisConnectionPointLocal.set(1, 1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(1, -1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, 1, 0);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, -1, 0);
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

    switch('controls'){

        case 38: // forward
            vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
            vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
            break;

        case 40: // backward
            vehicle.applyEngineForce(up ? 0 : maxForce, 2);
            vehicle.applyEngineForce(up ? 0 : maxForce, 3);
            break;

        case 66: // b
            vehicle.setBrake(brakeForce, 0);
            vehicle.setBrake(brakeForce, 1);
            vehicle.setBrake(brakeForce, 2);
            vehicle.setBrake(brakeForce, 3);
            break;

        case 39: // right
            vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
            vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
            break;

        case 37: // left
            vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
            vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
            break;

    }
    return vehicle;
    
};





    