var THREE;


if (typeof(THREE) == 'undefined'){
	THREE = require('three');
}

if(typeof(MODEL) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MODEL = {};
}

(function(MODEL){
	
	var calcVec = new MATH.Vec3(0, 0, 0);

    MODEL.ReferenceTime = 1;
    MODEL.NetworkTime = 1;
    MODEL.SimulationTime = 1;
    MODEL.NetworkFPS = 1;
    MODEL.SimulationFPS = 1;


	var THREEVec1 = new THREE.Vector3();
	var THREEVec2 = new THREE.Vector3();

//	var THREEmatrix = new THREE.Matrix();
	var THREEquat = new THREE.Quaternion();
	var THREEeuler = new THREE.Euler();
	var THREEobj = new THREE.Object3D();

    
	MODEL.Spatial = function() {
		this.sendData = {
			pos:[0, 0, 0],
			vel:[0, 0, 0],
			rot:[0, 0, 0],
			rotVel:[0, 0, 0],
			quat:[0, 1, 0, 1]
		};
		this.size = new MATH.Vec3(0, 0, 0);
		this.extents = new MATH.Vec3(0, 0, 0);
		this.pos = new MATH.Vec3(0, 0, 0);
		this.vel = new MATH.Vec3(0, 0, 0);
		this.rot = new MATH.Vec3(0, 0, 0);
		this.quat = [0, 1, 0, 1];
		this.rotVel = new MATH.Vec3(0, 0, 0);
		this.groundNormal = new MATH.Vec3(0, 1, 0);
	};

    MODEL.Spatial.prototype.comparePositional = function(spatial) {
        return Math.abs(this.pos.data[0] - spatial.pos.data[0]) +
            Math.abs(this.pos.data[1] - spatial.pos.data[1]) +
            Math.abs(this.pos.data[2] - spatial.pos.data[2]) +
            Math.abs(this.vel.data[0] - spatial.vel.data[0]) +
            Math.abs(this.vel.data[1] - spatial.vel.data[1]) +
            Math.abs(this.vel.data[2] - spatial.vel.data[2]) 
    };

    MODEL.Spatial.prototype.compareRotational = function(spatial) {
        return Math.abs(this.rot.data[0] - spatial.rot.data[0]) +
            Math.abs(this.rotVel.data[0] - spatial.rotVel.data[0])
    };

    MODEL.Spatial.prototype.interpolateFraction = function(start, target, fraction) {
        this.interpolatePositions( start, target, fraction);
        this.interpolateVelocity(  start, target, Math.min(fraction, 1));
        this.interpolateRotational(start, target, Math.min(fraction, 1));
        this.interpolateRotVel(start, target, Math.min(fraction, 1));
    };
    
	MODEL.Spatial.prototype.interpolateVelocity = function(start, target, fraction) {
		this.vel = this.vel.interpolateFromTo(start.vel, target.vel, fraction);
	};

    MODEL.Spatial.prototype.interpolateRotVel = function(start, target, fraction) {
		this.setPitchVel(MATH.radialLerp(start.pitchVel(), target.pitchVel(), fraction));
		this.setYawVel(MATH.radialLerp(start.yawVel(), target.yawVel(), fraction));
		this.setRollVel(MATH.radialLerp(start.rollVel(), target.rollVel(), fraction))
    };

    MODEL.Spatial.prototype.interpolatePositions = function(start, target, fraction) {
        this.pos = this.pos.interpolateFromTo(start.pos, target.pos, fraction);
    };

	MODEL.Spatial.prototype.interpolateRotational = function(start, target, fraction) {
		this.setPitch(MATH.radialLerp(start.pitch(), target.pitch(), fraction));
		this.setYaw(MATH.radialLerp(start.yaw(), target.yaw(), fraction));
		this.setRoll(MATH.radialLerp(start.roll(), target.roll(), fraction))
	};
	
	MODEL.Spatial.prototype.setSendData = function(sendData) {
        this.pos.setArray(sendData.pos);
        this.vel.setArray(sendData.vel);
		this.rot.setArray(sendData.rot);
        this.rotVel.setArray(sendData.rotVel);
		this.quat[0] = sendData.quat[0];
		this.quat[1] = sendData.quat[1];
		this.quat[2] = sendData.quat[2];
		this.quat[3] = sendData.quat[3];
		THREEquat.x = this.quat[0];
		THREEquat.y = this.quat[1];
		THREEquat.z = this.quat[2];
		THREEquat.w = this.quat[3];
		THREEeuler.setFromQuaternion(THREEquat);
		//			this.rot.setXYZ(THREEeuler.x, THREEeuler.y,THREEeuler.z);

    };

    MODEL.Spatial.prototype.getSendSpatial = function() {
        this.pos.getArray(this.sendData.pos);
        this.vel.getArray(this.sendData.vel);
		this.rot.getArray(this.sendData.rot);
		this.rotVel.getArray(this.sendData.rotVel);

		this.sendData.quat[0] = this.quat[0];
		this.sendData.quat[1] = this.quat[1];
		this.sendData.quat[2] = this.quat[2];
		this.sendData.quat[3] = this.quat[3];

        return this.sendData;
    };

	MODEL.Spatial.prototype.setSpatial = function(spatial) {
		this.pos.setVec(spatial.pos);
		this.vel.setVec(spatial.vel);
		this.rot.setVec(spatial.rot);
		this.rotVel.setVec(spatial.rotVel);
        this.size.setVec(spatial.size);
		this.quat[0] = spatial.quat[0];
		this.quat[1] = spatial.quat[1];
		this.quat[2] = spatial.quat[2];
		this.quat[3] = spatial.quat[3];
	};

	MODEL.Spatial.prototype.addSpatial = function(spatial) {
		this.pos.addVec(spatial.pos);
		this.vel.addVec(spatial.vel);
	};
	
	MODEL.Spatial.prototype.stop = function() {
		this.vel.scale(0);
		this.rotVel.scale(0);
	};


	MODEL.Spatial.prototype.calcSteeringYawAngle = function(angle, dt,  rotVelClamp, radialLerp) {
		return MATH.radialClamp(angle, angle+rotVelClamp, angle-rotVelClamp);
	};

	MODEL.Spatial.prototype.applySteeringVector = function(steerVec, dt,  rotVelClamp, radialLerp) {
		this.yawTowards(MATH.addAngles(steerVec.data[1], this.yaw()), dt*radialLerp);
	};

	MODEL.Spatial.prototype.getHeading = function(vec3) {
		vec3.setXYZ(Math.cos(this.yaw() -Math.PI*0.5), 0, Math.sin(this.yaw() -Math.PI*0.5));
	};


	MODEL.Spatial.prototype.getForwardVector = function(vec3) {


		THREEVec1.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

		//get the heading to figure out where it ends up in x/z
		this.getHeading(calcVec);



		vec3.setVec(calcVec)
		return vec3;//;
		// var normAng = calcVec.dotVev(this.groundNormal);

		THREEobj.rotation.set(this.pitch(), this.yaw(), this.roll());

	//	THREEquat.setFromEuler(THREEobj.rotation);

		THREEVec1.set()

	//	THREEobj.rotation.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

		THREEobj.position.set(0, 0, 0);

		// THREEobj.up.set(0, 0, 1);

		THREEobj.up.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

		// THREEeuler.fronAs();
		THREEobj.translateZ(1);

		vec3.setXYZ(THREEobj.position.x, THREEobj.position.y, -THREEobj.position.z );

        return vec3;
	};
//
	MODEL.Spatial.prototype.getUpVector = function(vec3) {
		vec3.setXYZ( 0, Math.cos(this.pitch() -Math.PI*0.5), Math.sin(this.pitch() -Math.PI*0.5));
		return vec3;
	};

	MODEL.Spatial.prototype.getBankVector = function(vec3) {
		vec3.setXYZ(Math.cos(this.roll() -Math.PI*0.5), Math.sin(this.roll() -Math.PI*0.5), 0);
		return vec3;
	};
	
    MODEL.Spatial.prototype.getOffsetVector = function(vec3, store) {
        vec3.setXYZ(Math.cos(this.rot.data[0] -Math.PI*0.5), 0, Math.sin(this.rot.data[0] -Math.PI*0.5));
        return store;
    };

	MODEL.Spatial.prototype.stop = function() {
		this.vel.setXYZ(0, 0, 0);
		this.rotVel.setXYZ(0, 0, 0);
	};

	MODEL.Spatial.prototype.setPosVec3 = function(vec3) {
		this.pos.setVec(vec3);
	};

	MODEL.Spatial.prototype.addPosXYZ = function(x, y, z) {
		this.pos.addXYZ(z, y, z);
	};
	
	MODEL.Spatial.prototype.setPosXYZ = function(x, y, z) {
		this.pos.setXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.getPosArray = function(array) {
		this.pos.getArray(array);
	};

	MODEL.Spatial.prototype.posX = function() {
		return this.pos.getX();
	};

    MODEL.Spatial.prototype.posY = function() {
        return this.pos.getY();
    };

    MODEL.Spatial.prototype.posZ = function() {
        return this.pos.getZ();
    };
    
	MODEL.Spatial.prototype.pitch = function() {
		return this.rot.getX();
	};

	MODEL.Spatial.prototype.yaw = function() {
		return this.rot.getY();
	};

	MODEL.Spatial.prototype.roll = function() {
		return this.rot.getZ();
	};


	MODEL.Spatial.prototype.pitchVel = function() {
		return this.rotVel.getX();
	};

	MODEL.Spatial.prototype.yawVel = function() {
		return this.rotVel.getY();
	};

	MODEL.Spatial.prototype.rollVel = function() {
		return this.rotVel.getZ();
	};

	MODEL.Spatial.prototype.setPitchVel = function(angleVelocity) {
		this.rotVel.setX(angleVelocity);
	};

	MODEL.Spatial.prototype.setYawVel = function(angleVelocity) {
		this.rotVel.setY(angleVelocity);
	};

	MODEL.Spatial.prototype.setRollVel = function(angleVelocity) {
		this.rotVel.setZ(angleVelocity);
	};

	MODEL.Spatial.prototype.setRotVelAngles = function(x, y, z) {
		this.rotVel.setX(x);
		this.rotVel.setY(y);
		this.rotVel.setZ(z);
	};

	MODEL.Spatial.prototype.setVelocity = function(x, y, z) {
		this.vel.setX(x);
		this.vel.setY(y);
		this.vel.setZ(z);
	};
	
	MODEL.Spatial.prototype.setPitch = function(angle) {
		this.rot.setX(angle);
	};

	MODEL.Spatial.prototype.setYaw = function(angle) {
		this.rot.setY(angle);
	};

	MODEL.Spatial.prototype.setRoll = function(angle) {
		this.rot.setZ(angle);
	};
	
	MODEL.Spatial.prototype.applyPitch = function(angle) {
		this.rot.rotateX(angle);
	};

	MODEL.Spatial.prototype.applyYaw = function(angle) {
		this.rot.rotateY(angle);
	};

	MODEL.Spatial.prototype.applyRoll = function(angle) {
		this.rot.rotateZ(angle);
	};
	
	MODEL.Spatial.prototype.fromAngles = function(x, y, z) {
		this.setPitch(x);
		this.setYaw(y);
		this.setRoll(z);
	};



	MODEL.Spatial.prototype.setQuatXYZW = function(x, y, z, w) {
		this.quat[0] = x;
		this.quat[1] = y;
		this.quat[2] = z;
		this.quat[3] = w;
	};



	MODEL.Spatial.prototype.alignToGroundNormal = function(normal) {
	//	console.log(normal.data[0], normal.data[1], normal.data[2]);
		this.groundNormal.setVec(normal);
	};


	MODEL.Spatial.prototype.alignPitchToNormal = function(normal) {
		this.getUpVector(calcVec);
				
		if (normal) {
			MATH.applyNormalVectorToPitch(normal, calcVec);
		}
3
		this.setPitchVel(calcVec.getX()*0.1);
	//	this.setRollVel(calcVec.getZ()*0.001);

	};



	MODEL.Spatial.prototype.addPitch = function(angle) {
		this.setPitch(MATH.angleInsideCircle(this.pitch() + angle));
	};

	MODEL.Spatial.prototype.addYaw = function(angle) {
		this.setYaw(MATH.angleInsideCircle(this.yaw() + angle));
	};

	MODEL.Spatial.prototype.addRoll = function(angle) {
		this.setRoll(MATH.angleInsideCircle(this.roll() + angle));
	};

	MODEL.Spatial.prototype.yawTowards = function(yawAngle, lerpFactor) {
        this.setYawVel(MATH.subAngles(yawAngle+Math.PI, this.yaw(),  lerpFactor));
	};

	MODEL.Spatial.prototype.rollTowards = function(normalVec, lerpFactor) {
	calcVec.setVec(normalVec);
	calcVec.subVec(this.pos);
		this.addRoll(MATH.subAngles( MATH.vectorXYToAngleAxisZ(calcVec), this.roll(),lerpFactor)*0.1);
		// this.applyYaw(this.yaw());
	};

	MODEL.Spatial.prototype.pitchTowards = function(normalVec, lerpFactor) {
		calcVec.setVec(normalVec);
		calcVec.subVec(this.pos);
		//	this.addPitch(MATH.subAngles(MATH.vectorYZToAngleAxisX(calcVec) ,this.pitch())*1);

		this.addPitch(MATH.subAngles(MATH.vectorYZToAngleAxisX(calcVec),this.pitch(),  lerpFactor));
		// this.applyYaw(this.yaw());
	};
	
	MODEL.Spatial.prototype.getVelVec = function() {
		return this.vel;
	};

    MODEL.Spatial.prototype.glueToGround = function() {
        return this.pos.setY(0);
    };
    
    MODEL.Spatial.prototype.getPosVec = function() {
        return this.pos;
    };
    
	MODEL.Spatial.prototype.addVelVec = function(velVec) {
		this.vel.addVec(velVec);
	};

	MODEL.Spatial.prototype.addVelXYZ = function(x, y, z) {
		this.vel.addXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.setSizeXYZ = function(x, y, z) {
		this.size.addXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.getSizeVec = function() {
		return this.size;
	};

	MODEL.Spatial.prototype.getExtents = function() {
		this.extents.setVec(this.size);
		this.extents.rotateX(this.pitch());
		this.extents.rotateY(this.yaw());
		this.extents.rotateZ(this.roll());
		return this.extents;
	};

	MODEL.Spatial.prototype.updateRotation = function(tpf) {
		this.addPitch(this.pitchVel() 	* tpf);
		this.addYaw(  this.yawVel() 	* tpf);
		this.addRoll( this.rollVel() 	* tpf);
	};

	MODEL.Spatial.prototype.updateGroundContact = function() {

		return;
		this.pitchTowards(this.groundNormal, 1);
		this.rollTowards(this.groundNormal, 1);


		this.getForwardVector(calcVec);
		THREEobj.position.set(0, 0, 0);

		THREEobj.rotation.set(this.pitch(), this.roll(), this.pitchVel());

		THREEVec2.set(calcVec.data[0], calcVec.data[1], calcVec.data[2]);

		THREEVec1.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

	THREEobj.up.set(0, 0, 1);
		//		THREEobj.up.set(THREEVec1);


		//	THREEobj.rotation.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);


	//	THREEobj.up.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);
		THREEobj.lookAt(THREEVec1);

	//	THREEVec2.set(this.pitch(), this.roll(), this.pitchVel());

	//	THREEquat.setFromAxisAngle(THREEVec2, THREEVec1);

	//		THREEobj.rotation.makeRotationFromQuaternion(THREEquat);

	//

	//	THREEobj.up.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

	//	THREEobj.up.set(this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2]);

	//

	//	THREEobj.updateMatrix();

		// THREEeuler.fronAs();
	//	THREEobj.translateZ(1);

		calcVec.setXYZ(THREEobj.rotation.x, THREEobj.rotation.y, THREEobj.rotation.z );

	//	console.log(THREEobj.rotation.x, THREEobj.rotation.y, -THREEobj.rotation.z)

		this.setPitch(calcVec.getX());
		this.setRoll(calcVec.getZ());

	//	this.setPitchVel(MATH.subAngles(calcVec.getX() , this.pitch()));
	//	this.setRollVel(MATH.subAngles(calcVec.getZ(),  this.roll()))

		if (Math.random()< 0.1){
			console.log(THREEobj.rotation.x,THREEobj.rotation.y, THREEobj.rotation.z) ;
			console.log("rotations spatial:",this.pitch(), this.roll(), this.pitchVel(), this.rollVel() )
			console.log("normal spatial:",this.groundNormal.data[0], this.groundNormal.data[1], this.groundNormal.data[2] )
		}



	};

	MODEL.Spatial.prototype.updateSpatial = function(tpf) {
        calcVec.setVec(this.vel);
        calcVec.scale(tpf);
		this.pos.addVec(calcVec);
		this.updateRotation(tpf);
	};

	MODEL.Spatial.prototype.isWithin = function(xMin, xMax, yMin, yMax) {
		return this.pos.getX() < xMin || this.pos.getX() > xMax || this.pos.getY() < yMin || this.pos.getY() > yMax;
	};

	MODEL.Temporal = function(creationTime, lifeTime) {

        this.sendData = {
            lifeTime:0,
            creationTime:0,
            currentTime:0,
            lastUpdate:0,
            stepTime:MODEL.SimulationTime,
            networkTime:MODEL.NetworkTime
        };
        
        this.stepTime = MODEL.SimulationTime;
        this.networkTime = MODEL.NetworkTime;
		this.lifeTime = lifeTime || Number.MAX_VALUE;
        this.currentTime = creationTime;
		this.creationTime = creationTime;
        this.lastUpdate = creationTime;
        this.packetAge = 0;
		this.timeDelta = 1;
		this.fraction = 1;
        this.tickDelta = 0;
	};

    MODEL.Temporal.prototype.setSendTemporal = function(sendData) {
        this.lifeTime =       sendData.lifeTime;
        this.creationTime =   sendData.creationTime;
        this.currentTime =    sendData.currentTime;
        this.lastUpdate =     sendData.lastUpdate;
        this.stepTime =       sendData.stepTime;
        this.networkTime =    sendData.networkTime;
        this.packetAge = 0;
    };

    MODEL.Temporal.prototype.getSendTemporal = function() {
        
        this.sendData.lifeTime = this.lifeTime;
        this.sendData.creationTime = this.creationTime;
        this.sendData.currentTime = this.currentTime;
        this.sendData.lastUpdate = this.lastUpdate;
        this.sendData.stepTime = this.stepTime;
        this.sendData.networkTime = this.networkTime;
        
        return this.sendData;
    };

    
    MODEL.Temporal.prototype.incrementTpf = function(tpf) {
        this.packetAge += tpf;
        this.tickDelta = tpf;
        this.currentTime += tpf;
    };
    
	MODEL.Temporal.prototype.getAge = function() {
        return this.currentTime - this.creationTime;
	};

    MODEL.Temporal.prototype.getPacketAge = function() {
        return this.packetAge;
    };

    MODEL.Temporal.prototype.getIdealTimeSlice = function() {
        return 1 / Math.min(this.networkTime, this.lifeTime)
    };

    MODEL.Temporal.prototype.getPacketTimeFraction = function() {
        return this.getPacketAge() * this.getIdealTimeSlice()
    };

    MODEL.Temporal.prototype.getOverdue = function() {
        return Math.floor(this.packetAge / this.networkTime)
    };

	MODEL.Temporal.prototype.predictUpdate = function(time) {
		this.timeDelta = time - this.lastUpdate;
        this.lastUpdate = this.currentTime;
		this.currentTime = time;

	};


	MODEL.InputState = function() {
        this.currentState = [0, 0]; // radial and distance sectors
		this.steering = new MATH.Vec3(0, 0, 0); //pitch, yaw, roll
		this.targetting = 0;
        this.yawTowards = 1;
		this.throttle = 0;
		this.trigger = false;
		this.triggerShield = false;
		this.playerName = "init";
		this.selectedTarget = "init";
	};


	MODEL.InputState.prototype.setTrigger = function(trigger) {
		this.trigger = trigger;
	};

	MODEL.InputState.prototype.getTrigger = function() {
		return this.trigger;
	};

	MODEL.InputState.prototype.setThrottle = function(throttle) {
		this.throttle = throttle;
	};

	MODEL.InputState.prototype.getThrottle = function() {
		return this.throttle;
	};

	MODEL.InputState.prototype.setSteeringX = function(x) {
		this.steering.setX(x);
	};

	MODEL.InputState.prototype.addSteeringY = function(y) {
		this.setSteeringY(MATH.angleInsideCircle(y + this.getSteeringY()));
	};
	

	MODEL.InputState.prototype.setSteeringY = function(y) {
		this.steering.setY(y);
		this.yawTowards = MATH.angleInsideCircle(y + this.yawTowards);
	};

	MODEL.InputState.prototype.getSteeringY = function() {
		return this.steering.getY();
	};

	MODEL.InputState.prototype.setSteeringZ = function(z) {
		this.steering.setZ(z);
	};
    

	MODEL.InputState.prototype.getSteering = function(vec) {
		vec.setVec(this.steering);
	};


})(MODEL);
