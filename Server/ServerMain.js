
ServerMain = function() {

	console.log("Construct Server Main");


	this.configLoader;
	this.serverConnection = new ServerConnection();
    this.sectorGrid = new SectorGrid();
    
    this.serverWorld = new ServerWorld(this.sectorGrid);
	this.connectedClients = new ActiveClients();
	this.serverGameMain = new ServerGameMain(this.connectedClients, this.serverWorld);

	

	var _this = this;
	function serverSetup(config) {
		_this.serverGameMain.applySetupConfig(config);
	}

	function configFiles(config) {
		_this.configLoader.applyFileConfigs(config);
	}



	function gameData(config) {
//		console.log("---- >Data Handler moduleData", config.dataType);
		_this.dataHub.setConfig(config)
		_this.serverGameMain.applyGameConfigs(_this.dataHub.getConfigs());
	}

	function worldData(config) {
		console.log("---- >Data Handler worldData", config.dataType);
		_this.dataHub.setConfig(config)
		_this.sectorGrid.applyWorldConfig(_this.dataHub.getConfigs(), config.dataType);
	}

	this.dataHandlers = {
		server_setup:serverSetup,
		config_files:configFiles,
        PIECE_DATA:gameData,
        MODULE_DATA:gameData,
		WORLD_GRID:worldData,
		GRID_SECTORS:worldData
	};


	var DataSource = function(id, system) {
		this.id = id;
		this.system = system
	};

	DataSource.prototype.fetch = function(method, args, data, clientId) {
		if (this.system[method]) {
			return JSON.stringify({id:this.id, data:this.system[method](data, clientId)});
		} else {
			return JSON.stringify({id:this.id, data:"No Data to fetch for "+this.id});
		}
	};

	var Ping = function() {

	};

	Ping.prototype.ping = function() {
		return 'ping';
	};

	this.game = {
		'ping':  new DataSource('ping', new Ping()),
		'ServerWorld' : new DataSource('ServerWorld', this.serverWorld),
		'ModuleStateRequest' : new DataSource('ModuleStateRequest', this.serverGameMain),
		'ServerGameMain' : new DataSource('RegisterPlayer', this.serverGameMain),
		'Clients' : new DataSource('RegisterClient', this.connectedClients)
	};

};

ServerMain.prototype.initServerConnection = function(wss) {
	var serverGameMain = this.serverGameMain;

	var removePlayerCallback = function(clientId) {
		return serverGameMain.playerDiconected(clientId);
	};

	this.serverConnection.setupSocket(wss, this.dataHub, this.connectedClients, removePlayerCallback);
	this.serverGameMain.initGame();
};

ServerMain.prototype.initServerMain = function(dataHub) {
	this.dataHub = dataHub;

	for (var key in this.game) {
		this.dataHub.setSource(key, this.game[key]);
	}
};

ServerMain.prototype.shutdownServerMain = function() {
	this.serverConnection.shutdownSocket();
	this.serverGameMain.endServerGame();
};

ServerMain.prototype.applyConfigData = function(updatedData) {

	if (this.dataHandlers[updatedData.dataType]) {
		this.dataHandlers[updatedData.dataType](updatedData)
	} else {
		console.log("No handler fo config key: ", updatedData.dataType)
	}
};


ServerMain.prototype.initConfigs = function(configLoader, sourceUrl, devMode) {
	this.configLoader = configLoader;
	this.configLoader.registerConfigUrl(sourceUrl, devMode);
};

