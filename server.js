
var fs = require('fs');
var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");

var path = './';
var servers = [];

var app = express();
var port = process.env.PORT || 5000;


var devMode = true;
if (process.env.PORT) {
    devMode = false;
    console.log(process.env.PORT)
}

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);

var wss = new WebSocketServer({server: server});

var SetupServer = function() {

    console.log("http server listening on %d", port) ;

    console.log("websocket server created");

	function start() {
		servers.push(initServerMain(devMode));
	}

	var files = [
		'Transport/MATH',
		'Transport/GAME',
		'Transport/MODEL',
		'Transport/ACTIONS',
		'Transport/io/SocketMessages',
		'Server/io/ServerConnection',
		'Transport/io/Message',
		'Server/io/ConnectedClient',
		'Server/io/ActiveClients',
		'Server/DataHub',
		'Server/Game/terrain/ServerTerrain',
		'Server/Game/terrain/TerrainFunctions',
		'Server/Game/ServerAttachmentPoint',
		'Server/Game/ServerModule',
		'Server/Game/GridSector',
		'Server/Game/PieceSpawner',
		'Server/Game/SectorGrid',
		'Server/Game/ServerWorld',
		'Server/Game/ServerGameMain',
        'Server/Game/ServerPieceProcessor',
		'Server/Game/ServerCollisionDetection',
		'Server/Game/modules/ServerModuleHandler',
		'Server/Game/modules/ServerModuleFunctions',
		'Server/Game/modules/ServerModuleCallbacks',
		'Server/ServerMain',
		'Server/Game/ServerPlayer',
		'Server/io/ConfigLoader'
	];


    var attachFile = function(file) {
        require(path+file);
    };

	for (var i = 0; i < files.length; i++) {
        attachFile(files[i]);
	}

	start();


};


var initServerMain = function(devMode) {

    var serverMain = new ServerMain();
	var configLoader = new ConfigLoader('./Server/json/');

	dataUpdated = function(configData) {
		serverMain.applyConfigData(configData, devMode);
	};

	configLoader.setUpdateCallback(dataUpdated);
	serverMain.initServerMain(new DataHub());
	serverMain.initServerConnection(wss);
	serverMain.initConfigs(configLoader, 'server_setup', devMode);
	return serverMain;
};


SetupServer();

