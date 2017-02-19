var CANNON = require('./cannon.js');

CannonAPI = function() {

};


CannonAPI.prototype.initServerPhysics = function() {



        var world = new CANNON.World();
        world.gravity.set(0, 0, -9.82); // m/s²
        this.world = world;
// Create a sphere
        var radius = 1; // m
        var sphereBody = new CANNON.Body({
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

        this.fixedTimeStep = 1.0 / 60.0; // seconds
        this.maxSubSteps = 3;


    this.sphereBody = sphereBody;


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
        this.lastTime;
    };


CannonAPI.prototype.updatePhysicsSimulation = function(currentTime) {


        if(this.lastTime !== undefined){
            var dt = (currentTime - this.lastTime) / 1000;
            this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
        }
    //    console.log("Sphere z position: " + this.sphereBody.position.z);
        this.lastTime = currentTime;

};