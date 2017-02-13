"use strict";


define([
		'Events',
		'PipelineAPI'
],
	function(
		evt,
		PipelineAPI
		) {

		var ClientRegistry = function() {
			this.playerName = "Default Name";
            this.data = {}
		};

		ClientRegistry.prototype.RegisterClient = function(data) {
			data.clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID');
		};

		ClientRegistry.prototype.setName = function(name) {
			this.playerName = name;
		};

		ClientRegistry.prototype.getName = function(name) {
			return this.playerName;
		};

		ClientRegistry.prototype.updateGameData = function(data) {
	//		console.log("Game Data update: ", data);

			PipelineAPI.storeDataKey(data, "gameData");


		//	PipelineAPI.setCategoryData('REGISTRY', this.data)
		};

		ClientRegistry.prototype.clientConnected = function(data) {
    //        console.log("Connected Data: ", data);
            this.data.CLIENT_ID = data.clientId;
		//	PipelineAPI.setCategoryData('PIECE_DATA', data.pieceData);
			PipelineAPI.setCategoryData('REGISTRY', this.data);


			setTimeout(function() {
			//	handleResize();
			}, 100);
			
		};

		return ClientRegistry;

	});