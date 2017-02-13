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

	//	this.inputState.setThrottle(Math.min(MATH.lineDistance(fromX, fromY, toX, toY), this.constants.throttleLimit) * this.constants.throttleAmplitude);

		this.inputState.setThrottle((state[1] / this.constants.throttleSegments) * this.constants.throttleAmplitude);

		if (this.inputState.getThrottle() != 0) {
			this.currentDrag = 1;
		} else {
			this.currentDrag = this.constants.velocityDrag;
		}

		this.inputState.setSteeringY( Math.PI*-0.5 + MATH.TWO_PI * -state[0] / this.constants.radialSegments);

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
		this.calcVec = new MATH.Vec3(0, 0, 0);

		this.spatial = new MODEL.Spatial();

        this.frameCurrentSpatial = new MODEL.Spatial();
        this.frameNextSpatial = new MODEL.Spatial();
        this.serverSpatial = new MODEL.Spatial();

		this.modules = [];

		this.attachmentPoints = [];
		this.serverState = {};
		this.config = null;

	};


	GAME.Piece.prototype.registerParentPiece = function(piece) {
		this.parentPiece = piece;
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

		var data = {
            playerId:this.id,
            type:this.type,
            spatial:this.spatial.getSendSpatial(),
            modules:this.getModuleStates(),
            trigger:this.pieceControls.getTriggerState(),
            temporal:this.temporal.getSendTemporal(),
            state:this.getState()
        };
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
		this.setState(GAME.ENUMS.PieceStates.TELEPORT);
		this.spatial.stop();
		this.spatial.setPosXYZ(Math.random()*100, 0, Math.random()*100);
	};

	GAME.Piece.prototype.applyForwardControl = function(timeFactor) {
		this.spatial.getForwardVector(this.calcVec);
		this.calcVec.scale(this.pieceControls.actions.applyForward * timeFactor);
		this.spatial.addVelVec(this.calcVec);
	};

	GAME.Piece.prototype.applyControlStates = function(tickDelta) {
		if (typeof(this.pieceControls.actions.applyThrottle) != undefined) {
		//	if ((Math.round((this.pieceControls.inputState.getThrottle() - this.pieceControls.inputState.getThrottle() * timeFactor)*0.3) != 0)) {
		//		this.networkDirty = true;
		//	}
	//		this.pieceControls.inputState.setThrottle(this.pieceControls.inputState.getThrottle()); //  * timeFactor);

		}

		if (typeof(this.pieceControls.actions.applySteering) != undefined) {
			this.pieceControls.getSteering(this.calcVec);
			this.spatial.applySteeringVector(this.calcVec, tickDelta, this.pieceControls.constants.radialVelocityClamp, this.pieceControls.constants.radialLerpFactor);
		}

		if (typeof(this.pieceControls.actions.applyForward) != undefined) {
			this.applyForwardControl(tickDelta);
		}
	};

	GAME.Piece.prototype.updateServerSpatial = function(tickDelta) {
	//	var timeFactor = this.pieceControls.getTimeFactor(this.timeSinceInput);
		this.applyControlStates(tickDelta);

	//	if (this.pieceControls.inputState.throttle == 0) {
			this.spatial.vel.scale(1 - (this.pieceControls.constants.velocityDrag*tickDelta));
			this.spatial.rotVel.scale(1 - (this.pieceControls.constants.radialDrag*tickDelta));
	//	}

		this.spatial.updateSpatial(tickDelta);
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

	
	GAME.Piece.prototype.processSpatialState = function(tickDelta) {

		this.updateServerSpatial(tickDelta);
		this.setState(GAME.ENUMS.PieceStates.MOVING);

	};

    GAME.Piece.prototype.requestTeleport = function() {

        this.teleportRandom();
        this.broadcast(this.makePacket());
		this.networkDirty = true;
    };
    
    
	GAME.Piece.prototype.processServerState = function(currentTime) {
		this.temporal.stepTime = MODEL.SimulationTime;
		this.temporal.networkTime = MODEL.NetworkTime;
		this.processTemporalState(currentTime, MODEL.SimulationTime);
		this.processModuleStates();
		this.processSpatialState(MODEL.SimulationTime);

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
        this.removed = true
    };
    
    
})(GAME);
