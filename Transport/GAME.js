if(typeof(GAME) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	GAME = {};
}

(function(GAME){

	GAME.ENUMS = {};

	GAME.ENUMS.ClientStates = {
		INITIALIZING:'INITIALIZING',
		DISCONNECTED:'DISCONNECTED',
		CONNECTING:'CONNECTING',
		CONNECTED:'CONNECTED',
		LOADING:'LOADING',
		READY:'READY',
		PLAYING:'PLAYING',
		CLIENT_REQUESTED:'CLIENT_REQUESTED',
		CLIENT_REGISTERED:'CLIENT_REGISTERED',
		PLAYER_REQUESTED:'PLAYER_REQUESTED'
	};

	GAME.ENUMS.PieceStates = {
		TIME_OUT:'TIME_OUT',
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		SPAWN:'SPAWN',
		KILLED:'KILLED',
		BURST:'BURST',
		EXPLODE:'EXPLODE',
		REMOVED:'REMOVED',
        APPEAR:'APPEAR',
        HIDE:'HIDE'
	};


	GAME.PieceControls = function() {
		this.inputState = new MODEL.InputState();
		this.inputState.setSteeringY(0);
		this.actions = {};

		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.constants = {
			radialDrag:0.9,
			velocityDrag:0.99,
			deceleration:0.6,
			radialVelocityClamp:0.2,
			radialLerpFactor:0.1,
			throttleLimit: 1,
			throttleAmplitude: 3
		};

		this.currentDrag = 1;
		this.currentRadialDrag = 1;
	};
	

	GAME.PieceControls.prototype.applyControlConfig = function(configs) {
		for (var key in configs.constants) {
			this.constants[key] = configs.constants[key];
		}
		for (key in configs.actions) {
			this.actions[key] = configs.actions[key];
		}
	};

	GAME.PieceControls.prototype.applyInputVector = function(state) {
        this.inputState.currentState[0] = state[0];
        this.inputState.currentState[1] = state[1];

		this.inputState.targetting += state[0];
		
	//	this.inputState.setSteeringX(Math.clamp((toX - fromX), -1, 1));
	//	this.inputState.setSteeringY(Math.clamp((toY - fromY), -1, 1));

		var inputAngle = Math.PI*0.5 + MATH.TWO_PI * state[0] / this.constants.radialSegments




		//	this.inputState.setThrottle(Math.min(MATH.lineDistance(fromX, fromY, toX, toY), this.constants.throttleLimit) * this.constants.throttleAmplitude);
	//	this.inputState.setSteeringY( Math.PI*-0.5 + MATH.TWO_PI * -state[0] / this.constants.radialSegments);
		var throttleState = (state[1] / this.constants.throttleSegments);

		var turnPenalty = throttleState // -Math.cos(inputAngle)*0.3;

		throttleState = throttleState;


		var amplifiedThrottle = turnPenalty * this.constants.throttleAmplitude;

		this.inputState.setThrottle(amplifiedThrottle);


	//	var currentSteering = this.inputState.getSteeringY();

		this.inputState.setSteeringY(Math.sin(inputAngle));

		if (this.inputState.getThrottle() != 0) {
			this.currentDrag = 1;
		} else {
			this.currentDrag = this.constants.velocityDrag;
		}

		

	};

	GAME.PieceControls.prototype.getTimeFactor = function(timeSinceInput) {
		return Math.min(1, (1 / timeSinceInput*this.constants.deceleration));
	};

	GAME.PieceControls.prototype.getSteering = function(store) {
		this.inputState.getSteering(store, this.constants.radialVelocityClamp);
	};

	GAME.PieceControls.prototype.getTriggerState = function() {
		return this.inputState.getTrigger();
	};

	GAME.PieceControls.prototype.setTriggerState = function(bool) {
		this.inputState.setTrigger(bool);
	};




	GAME.Piece = function(type, id, creationTime, lifeTime, broadcast) {
        this.networkDirty = true;
		this.id = id;
		this.type = type;
		this.broadcast = broadcast;
		this.pieceControls = new GAME.PieceControls();
		this.temporal = new MODEL.Temporal(creationTime, lifeTime);
        this.sendTime = 0;
		this.calcVec = new MATH.Vec3(0, 0, 0);

		this.spatial = new MODEL.Spatial();

        this.frameCurrentSpatial = new MODEL.Spatial();
        this.frameNextSpatial = new MODEL.Spatial();
        this.serverSpatial = new MODEL.Spatial();

		this.modules = [];

		this.attachmentPoints = [];
		this.serverState = {};
		this.config = null;
        this.terrainFunctions = null;
	};


	GAME.Piece.prototype.registerParentPiece = function(piece) {
		this.parentPiece = piece;
	};

    GAME.Piece.prototype.setTerrainFunctions = function(terrainFunctions) {
        this.terrainFunctions = terrainFunctions;
    };

	
	GAME.Piece.prototype.applyConfig = function(pieceConfigs) {
    //    console.log("Piece configs", pieceConfigs)
		this.config = pieceConfigs;
		this.pieceControls.applyControlConfig(pieceConfigs.controls);
        //	if (pieceConfigs.modules) this.attachModules(pieceConfigs.modules);
	};

	GAME.Piece.prototype.getTimeoutEvent = function() {
		if (!this.config.controls) return;
		if (this.config.controls.actions) {
			if (this.config.controls.actions.timeoutEvent) {
				return this.config.controls.actions.timeoutEvent;
			}			
		}
	};
	
	GAME.Piece.prototype.setState = function(state) {
		this.state = state;
	};


    GAME.Piece.prototype.setModuleState = function(moduleId, value) {
        if (this.getModuleById(moduleId)) {
        //    console.log("Set Mod State: ", moduleId, value)
            this.getModuleById(moduleId).setModuleState(value);
        } else {
            console.log("No module gotten ", moduleId, this.modules)
        }
    };

	GAME.Piece.prototype.setName = function(name) {
		this.pieceControls.inputState.playerName = name;
        this.setModuleState('nameplate', name);
	};
		
	GAME.Piece.prototype.readServerModuleState = function(moduleId) {
		return this.serverState.modules[moduleId];
	};

    GAME.Piece.prototype.getModuleById = function(moduleId) {

        for (var i = 0; i < this.modules.length; i++) {
            if (this.modules[i].id == moduleId) {
                return this.modules[i];
            }
        }

        console.log("No module by Id ", moduleId);
    };

	GAME.Piece.prototype.getModuleByIndex = function(index) {
		return this.modules[index];
	};
	
    GAME.Piece.prototype.getCollisionShape = function(store) {
        store.size = 1;

        for (var i = 0; i < this.modules.length; i++) {
            if (this.modules[i].data.size > store.size) {
                store.size = this.modules[i].data.size;
            }
        }
    };

    GAME.Piece.prototype.getModuleStates = function() {

        var moduleStates = {};

        for (var i = 0; i < this.modules.length; i++) {
            moduleStates[this.modules[i].id] = this.modules[i].getModuleState();
        }

        return moduleStates;
	};

	GAME.Piece.prototype.getState = function() {
		return this.state;
	};

	GAME.Piece.prototype.makePacket = function() {

		this.serverSpatial.setSpatial(this.spatial);

		var data = {
            playerId:this.id,
            type:this.type,
            spatial:this.spatial.getSendSpatial(),
            modules:this.getModuleStates(),
            trigger:this.pieceControls.getTriggerState(),
            temporal:this.temporal.getSendTemporal(),
            state:this.getState()
        };

        this.sendTime = this.temporal.currentTime;

/*
		var sendData = {
            playerId:this.id
        };

        for (var key in data) {
        //    if (data[key] != this.sentState[key]) {
                sendData[key] = data[key];
                this.sentState[key] = data[key];
        //    }
        }
*/
		var packet = {
			id:"playerUpdate",
			data:data
		};

		return packet;
	};

	// CLient Side Modules
	GAME.Piece.prototype.processModules = function(moduleStates) {
		for (var i = 0; i < this.modules.length; i++) {
			if (moduleStates[this.modules[i].id]) {
				this.modules[i].processModuleState(moduleStates[this.modules[i].id][0])
			}
		}
	};



	GAME.Piece.prototype.setInputTrigger = function(bool, actionCallback) {
		this.pieceControls.setTriggerState(bool);
		for (var i = 0; i < this.modules.length; i++) {
			this.modules[i].processInputState(this.pieceControls, actionCallback);
		}
	};

	GAME.Piece.prototype.setInputVector = function(state) {
		this.pieceControls.applyInputVector(state);
	};

	GAME.Piece.prototype.teleportRandom = function() {
		console.log("Piece teleport", this.id);

		this.setState(GAME.ENUMS.PieceStates.TELEPORT);
		this.spatial.stop();
		this.spatial.setPosXYZ(5+Math.random()*25, 4, 5+Math.random()*25);

        this.spatial.pos.setY(this.terrainFunctions.getHeightForPlayer(this) + 5);

		if (this.physics) {
			this.physics.body.position.x = this.spatial.posX();
			this.physics.body.position.z = this.spatial.posY();
			this.physics.body.position.y = this.spatial.posZ();

			this.physics.body.quaternion.x = 0;
			this.physics.body.quaternion.y = 0;
			this.physics.body.quaternion.z = 0;
			this.physics.body.quaternion.w = 1;

			this.physics.body.angularVelocity.x = 0;
			this.physics.body.angularVelocity.z = 10;
			this.physics.body.angularVelocity.y = 0;
			this.physics.body.velocity.x = 0;
			this.physics.body.velocity.z = 0;
			this.physics.body.velocity.y = 0;
		}
	};

	GAME.Piece.prototype.applyForwardControl = function(timeFactor) {
		this.spatial.getForwardVector(this.calcVec);
		this.calcVec.scale(this.pieceControls.actions.applyForward * timeFactor );
		this.spatial.addVelVec(this.calcVec);
	};

	GAME.Piece.prototype.applyPhysicsVehicleControls = function(timeFactor) {

	//	if (typeof(this.pieceControls.actions.applySteering) != undefined) {
		this.pieceControls.getSteering(this.calcVec);

		var throttleState = this.pieceControls.inputState.getThrottle();

		var yawState = this.pieceControls.inputState.getSteeringY()*1;

		this.pieceControls.inputState.setSteeringY(yawState*0.99);

		yawState = yawState*Math.abs(yawState) * 0.5;

		vehicle = this.physics.body.vehicle;

		this.spatial.getForwardVector(this.calcVec);

		var brakeForce = 1;

		if (this.spatial.vel.dotVec(this.calcVec)*throttleState < 0) {
		//	throttleState *= 0.6;
		//	this.pieceControls.inputState.currentState[1] *= 0.96;

			this.pieceControls.inputState.setThrottle(this.spatial.vel.dotVec(this.calcVec) * -1);

			if (this.spatial.vel.getLengthSquared() < 1) {
				this.pieceControls.inputState.currentState[1] = 0;
				this.pieceControls.inputState.setThrottle(this.pieceControls.inputState.currentState[1]);
			}

			brakeForce = 25 * (Math.sqrt(this.spatial.vel.getLength())+1);
		}


		if (Math.abs(throttleState) < 0.15) {
	//		brakeForce = 20;
			if (Math.abs(yawState) < 0.05) {
				throttleState = 0;
			//	brakeForce = 5 * (this.spatial.vel.getLength()+1);
				yawState = 0;
			}
			brakeForce = 6 + 25 / (Math.sqrt(this.spatial.vel.getLength())+0.01);
		}



		var speed = this.spatial.vel.getLengthSquared()+1;
		var speedFactor = Math.sqrt(800000 / (speed*0.5)) + 1500 / (1+speed*0.1);

	//	var maxSteerVal = 0.5;//	var maxForce = 1000;
		var trackForce = (throttleState + Math.abs(yawState*0.1)) * speedFactor ;

        yawState *=  (1 / Math.sqrt(speed*0.5) + Math.abs(yawState*0.9)) * MATH.clamp(throttleState*10, -1, 1);

		var trackYawL = - yawState*12.3*speedFactor;
		var trackYawR = + yawState*12.3*speedFactor;
	//	console.log(throttleState, brakeForce, yawState);
		vehicle.applyEngineForce(trackForce+ trackYawL, 0);
		vehicle.applyEngineForce(trackForce+ trackYawR, 1);
		vehicle.applyEngineForce(trackForce + trackYawL, 2);
		vehicle.applyEngineForce(trackForce + trackYawR, 3);
		vehicle.applyEngineForce(trackForce + trackYawL, 4);
		vehicle.applyEngineForce(trackForce + trackYawR, 5);
		vehicle.applyEngineForce(trackForce+ trackYawL, 6);
		vehicle.applyEngineForce(trackForce+ trackYawR, 7);

		vehicle.setBrake(brakeForce * 0.2, 0);
		vehicle.setBrake(brakeForce * 0.2, 1);
		vehicle.setBrake(brakeForce , 2);
		vehicle.setBrake(brakeForce , 3);
		vehicle.setBrake(brakeForce , 4);
		vehicle.setBrake(brakeForce , 5);
		vehicle.setBrake(brakeForce*0.2 , 6);
		vehicle.setBrake(brakeForce*0.2 , 7);

		var forward = MATH.clamp(trackForce+1, -1, 1);

	//	yawState = 0;
		vehicle.setSteeringValue(yawState*forward, 0);//
		vehicle.setSteeringValue(yawState*forward, 1);
		vehicle.setSteeringValue(yawState*forward*0.3, 2);
		vehicle.setSteeringValue(yawState*forward*0.3, 3);


		vehicle.setSteeringValue(-yawState*forward*0.3, 4);
		vehicle.setSteeringValue(-yawState*forward*0.3, 5);
		vehicle.setSteeringValue(-yawState*forward, 6);
		vehicle.setSteeringValue(-yawState*forward, 7);
	};


	GAME.Piece.prototype.applyControlStates = function(tickDelta) {


		if (this.physics) {
			if (this.physics.body.vehicle) {
				this.applyPhysicsVehicleControls(tickDelta);
			} else {
				console.log("No vehicle on control physics")
			}
			return;
		}

		if (typeof(this.pieceControls.actions.applyThrottle) != undefined) {

		}

		if (typeof(this.pieceControls.actions.applySteering) != undefined) {
			this.pieceControls.getSteering(this.calcVec);
			var throttleState = (this.pieceControls.inputState.currentState[1] / this.pieceControls.constants.throttleSegments);
			this.spatial.yawTowards(this.calcVec.data[1], (0.5+throttleState+0.5)*this.pieceControls.constants.radialLerpFactor);
		}

		if (typeof(this.pieceControls.actions.applyForward) != undefined) {
			this.applyForwardControl(tickDelta);
		}
	};

	GAME.Piece.prototype.updateServerSpatial = function(tickDelta, terrainFunctions) {
	//	var timeFactor = this.pieceControls.getTimeFactor(this.timeSinceInput);


		
		
	//	if (this.pieceControls.inputState.throttle == 0) {
			this.spatial.vel.scale(1 - (this.pieceControls.constants.velocityDrag*tickDelta));
			this.spatial.rotVel.scale(1 - (this.pieceControls.constants.radialDrag*tickDelta));
	//	}

		this.spatial.updateSpatial(tickDelta);
		if (typeof(terrainFunctions) == 'function') {
			this.predictFutureElevation(terrainFunctions);
		}
	};


	GAME.Piece.prototype.predictFutureElevation = function(terrainFunctions) {
		
		var currentElevation = this.spatial.pos.getY();
		var nextFrameElevation = terrainFunctions.getHeightForPlayer(this);
		this.spatial.vel.setY((nextFrameElevation - currentElevation));
		
		
	};
	
	GAME.Piece.prototype.processTemporalState = function(currentTime) {
		this.temporal.predictUpdate(currentTime);

		if (this.temporal.lifeTime < this.temporal.getAge()) {
			this.setState(GAME.ENUMS.PieceStates.TIME_OUT);
		}
	};

	GAME.Piece.prototype.processModuleStates = function() {
		for (var i = 0; i < this.modules.length; i++) {
			this.modules[i].processServerModuleState(this.temporal.timeDelta);
			this.modules[i].processInputState(this.pieceControls);
		}
	};

	
	GAME.Piece.prototype.processSpatialState = function(tickDelta, terrainFunctions) {

		this.updateServerSpatial(tickDelta, terrainFunctions);
		this.spatial.updateGroundContact();
		this.setState(GAME.ENUMS.PieceStates.MOVING);

	};

	GAME.Piece.prototype.processPhysicsServerSpatialState = function(tickDelta) {

	//	this.updateServerSpatial(tickDelta, terrainFunctions);
        this.spatial.updateSpatial(tickDelta);
		this.setState(GAME.ENUMS.PieceStates.MOVING);

	};




	GAME.Piece.prototype.requestTeleport = function() {

        console.log("Piece: requestTeleport", this.id);

        this.teleportRandom();
        this.broadcast(this.makePacket());
	//	this.networkDirty = true;
    };
    
    
	GAME.Piece.prototype.processServerState = function(currentTime, terrainFunctions) {
		this.temporal.stepTime = MODEL.SimulationTime;
		this.temporal.networkTime = MODEL.NetworkTime;
		this.processTemporalState(currentTime, MODEL.SimulationTime);
		this.processModuleStates();

        this.applyControlStates(MODEL.SimulationTime);

		if (this.physics) {
	//		this.physics.body.applyLocalForce(this.physics.body.calcVec, this.physics.body.calcVec);
			this.processPhysicsServerSpatialState(MODEL.SimulationTime);
		} else {
			this.processSpatialState(MODEL.SimulationTime, terrainFunctions);
		}

		if (Math.abs(MATH.nearestAngle(this.spatial.rot.getX())) > 1.3 || Math.abs(MATH.nearestAngle(this.spatial.rot.getZ())) > 1.3) {
			console.log(this.spatial.rot.getX())
			this.teleportRandom();
		};
        



     var velDiff = this.spatial.compareVelocity(this.serverSpatial);
     var angVelDiff = this.spatial.compareAngularVelocity(this.serverSpatial);

		if (velDiff > MODEL.SpatialTolerance || angVelDiff > MODEL.AngularVelocityTolerance) {

            if (this.temporal.currentTime - this.sendTime > MODEL.TemporalTolerance) {
            //    console.log("DIFFS: ",velDiff , angVelDiff, this.temporal.currentTime - this.sendTime );
                this.networkDirty = true;
            }
		}


		if (this.networkDirty) {

			this.broadcast(this.makePacket());
			this.networkDirty = false;
		}
	};

    GAME.Piece.prototype.applyNetworkState = function(networkState) {
		this.serverState = networkState;
        this.networkDirty = true;
    };

    GAME.Piece.prototype.applyNetworkFrame = function(networkState) {

        this.frameCurrentSpatial.setSpatial(this.spatial);
        this.serverSpatial.setSendData(networkState.spatial);

    };

    GAME.Piece.prototype.predictNextNetworkFrame = function(networkState, timeAhead) {

        this.frameNextSpatial.setSendData(networkState.spatial);
        this.frameNextSpatial.updateSpatial(timeAhead);
    };

    GAME.Piece.prototype.updateNetworkState = function(networkState) {

        this.networkDirty = false;
        this.temporal.setSendTemporal(networkState.temporal);

	//	console.log(this.spatial.pitch());

        if (networkState.state == GAME.ENUMS.PieceStates.TELEPORT || networkState.state == GAME.ENUMS.PieceStates.SPAWN || networkState.state == GAME.ENUMS.PieceStates.APPEAR) {
            this.spatial.setSendData(networkState.spatial);
            this.serverSpatial.setSendData(networkState.spatial);
            this.frameCurrentSpatial.setSendData(networkState.spatial);
        }

        this.applyNetworkFrame(networkState);
        this.predictNextNetworkFrame(networkState, Math.min(this.temporal.networkTime, this.temporal.lifeTime));
    };
    
    
	GAME.Piece.prototype.updatePieceFrame = function(tpf) {

        if (this.networkDirty) {
            this.updateNetworkState(this.serverState);
        }

        this.temporal.incrementTpf(tpf);

		if (this.temporal.lifeTime < this.temporal.getAge()) {
	//		console.log("Client Timeout", this.temporal.lifeTime , this.temporal.getAge());
			this.setState(GAME.ENUMS.PieceStates.TIME_OUT);
		}
    };

    GAME.Piece.prototype.setRemoved = function() {

    };
    
    
})(GAME);
