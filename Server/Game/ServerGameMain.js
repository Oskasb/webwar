
var SIMULATION_LOOP;
var NETWORK_LOOP;

ServerGameMain = function(clients, serverWorld) {
	
    this.pieceSpawner = new PieceSpawner(serverWorld);
    this.serverModuleHandler = new ServerModuleHandler(new ServerModuleFunctions(this, serverWorld, this.pieceSpawner));
	
	this.serverWorld = serverWorld;
    this.serverWorld.setPieceSpawner(this.pieceSpawner);
    this.pieceSpawner.setServerModuleCallbacks(new ServerModuleCallbacks(this, serverWorld, this.pieceSpawner));
	this.startTime = process.hrtime();
	this.processTime = process.hrtime();
	this.currentTime = 0;
    this.tickComputeTime = 0;
    this.headroom = 0;
	this.simulationTime = 0;
	this.timeDelta = 0;
	this.connectedClients = clients;
	this.gameConfigs = {};
	this.healthData = [];
};


ServerGameMain.prototype.applyGameConfigs = function(gameConfigs) {
	this.gameConfigs = gameConfigs;
	this.pieceSpawner.notifyConfigsUpdated(this.gameConfigs, this.serverWorld.players);
};


ServerGameMain.prototype.applySetupConfig = function(config) {
	console.log("Setup Loop: ", JSON.stringify(config));
	clearInterval(SIMULATION_LOOP);
    clearInterval(NETWORK_LOOP);
	this.setupLoop(config.setup.system);
};

ServerGameMain.prototype.setupLoop = function(systemParams) {
	var _this = this;
	
    MODEL.SimulationTime = systemParams.tickSimulationTime * 0.001;
    MODEL.NetworkTime = systemParams.tickNetworkTime * 0.001;
	MODEL.SpatialTolerance = systemParams.spatialTolerance;
	MODEL.TemporalTolerance = systemParams.temporalTolerance;
	MODEL.PhysicsStepTime = systemParams.physicsStepTime;
	MODEL.PhysicsMaxSubSteps = systemParams.physicsMaxSubSteps;
	MODEL.AngularVelocityTolerance = systemParams.angularVelocityTolerance;
    MODEL.NetworkFPS = 1 / MODEL.NetworkTime;
    MODEL.SimulationFPS = 1 / MODEL.SimulationTime;
    
	console.log("Setup Loop: ", MODEL.SimulationTime, MODEL.NetworkTime);
    

    _this.tickGameSimulation();


    NETWORK_LOOP = setInterval(function() {
        _this.tickGameNetwork();
    }, MODEL.NetworkTime * 1000);
};

ServerGameMain.prototype.endServerGame = function() {
	console.log("End Server Game:");
	clearInterval(SERVER_LOOP);
    this.removeAllPlayers()
};

ServerGameMain.prototype.clearServerGameState = function() {
//    console.log("Clear Server Game:");

    for (var i in this.serverWorld.pieces) {
        this.serverWorld.removePiece(this.serverWorld.pieces[i]);
    }


    this.removeAllPlayers()
};



ServerGameMain.prototype.removeAllPlayers = function() {
    for (var key in this.connectedClients.connectedClients) {
       this.playerDiconected(key);
    }

};

ServerGameMain.prototype.initGame = function() {

    this.serverModuleHandler.initModuleControls(this);

	this.actionHandlers = this.serverModuleHandler;
	
	this.serverWorld.initWorld(this.connectedClients);
};


ServerGameMain.prototype.playerDiconected = function(clientId) {
	var player = this.serverWorld.getPlayer(clientId);
	if (!player) return;

	player.piece.setState(GAME.ENUMS.PieceStates.REMOVED);
	var packet = player.makePacket();
	this.serverWorld.removePlayer(player.id);
	return packet;
};


ServerGameMain.prototype.playerModuleRequest = function(data, clientId) {

	var player = this.serverWorld.getPlayer(clientId);
    if (!player) {
        console.log("No such player!", clientId);
        return;
    }

    this.serverModuleHandler.handleModuleControlAction(player.piece, data);
};

ServerGameMain.prototype.registerPlayer = function(data) {

	var client = this.connectedClients.getClientById(data.clientId);
    if (!client) {
        console.log("Somethingm broken, no client...");
        return;
    }
    var player = this.pieceSpawner.spawnPlayerPiece(client, data, this.connectedClients, this.simulationTime, this.gameConfigs);

    this.serverWorld.addPlayer(player);
	console.log("registerPlayer Add: ", data.clientId);
    client.broadcastToVisible(player.makePacket());

};

ServerGameMain.prototype.getNow = function() {
	this.processTime = process.hrtime(this.startTime);
	return ((this.processTime[0]*1000) + (this.processTime[1]/1000000))*0.001;
};



ServerGameMain.prototype.tickGameSimulation = function() {

	this.currentTime = this.getNow();

    var tpf =  this.currentTime - this.lastFrameTime;



    this.serverWorld.tickSimulationWorld(this.currentTime, tpf);

    this.tickComputeTime = this.getNow() - this.currentTime;

    this.headroom = tpf - this.tickComputeTime;

    if (this.headroom / this.tickComputeTime < 1) console.log("High Load: Headroom, ComputeTime: ", this.headroom, this.tickComputeTime);

	var bodies = this.serverWorld.cannonAPI.fetchCannonStatus().bodyCount;
    var contacts = this.serverWorld.cannonAPI.fetchCannonStatus().contactCount;

	var memUse = process.memoryUsage();


    var _this = this;

    var tickTime = MODEL.SimulationTime*1000;
    if (tpf > MODEL.SimulationTime) {
        tickTime = 0;
    }

    SIMULATION_LOOP = setTimeout(function() {
        _this.tickGameSimulation();
    }, tickTime );

    this.lastFrameTime = this.currentTime;

    if (this.serverWorld.playerCount == 0) {
        this.clearServerGameState();
        return;
    }

    this.healthData.push({
        time:this.currentTime,
        idle:this.headroom,
        busy:this.tickComputeTime,
        pieces:this.serverWorld.pieces.length,
        terrains:this.serverWorld.terrains.length,
        players:this.serverWorld.playerCount,
        bodies:bodies,
        contacts:contacts,
        memoryUsage:memUse
    });



};

ServerGameMain.prototype.tickGameNetwork = function() {
//    this.currentTime = this.getNow();
    this.serverWorld.tickNetworkWorld(this.currentTime);

	var sendData = [];

	for (var i = 0; i < this.healthData.length; i++) {
		sendData.push(this.healthData[i]);
	}

	this.connectedClients.broadcastToAllClients({id:"server_status", data:sendData});
	this.healthData = [];
};
