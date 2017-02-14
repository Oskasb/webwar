"use strict";


define([
	'game/ClientPiece',
	'Events',
	'PipelineAPI',
    'PipelineObject'
],
	function(
		ClientPiece,
		evt,
		PipelineAPI,
        PipelineObject
		) {


		var GameMain = function() {
			this.pieces = {};
			this.lastPieceCount = 0;
			this.pieceCount = 0;
			this.ownPlayer;

			var gameData = {
				PIECES:this.pieces
			};
			
			PipelineAPI.setCategoryData('GAME_DATA', gameData);
			
			var pieces = this.pieces;
			var removeAllPieces = function() {
				for (var key in pieces) {
                    pieces[key].playerRemove();
				}
			};

			evt.on(evt.list().CONNECTION_CLOSED, removeAllPieces);
            
		};

		GameMain.prototype.registerPlayer = function(data) {

			var _this = this;

			var removeCallback = function(playerId) {
                setTimeout(function() {
                    delete _this.pieces[playerId];
                }, 20)
        	};

			this.pieces[data.playerId] = new ClientPiece(data, removeCallback);

            if (data.type != 'player_ship') {
                return this.pieces[data.playerId];
            }

			if (!this.ownPlayer) {
				if (data.playerId == PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')) {
                    this.contolOwnPlayer(this.pieces[data.playerId]);

				} else {
                    evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:'Present: '+data.playerId });
                }
			} else {
                evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:'Appear: '+data.playerId });
            }

			return this.pieces[data.playerId];
		};

		GameMain.prototype.InputVector = function(msg) {
			this.pieces[msg.data.playerId].setServerState(msg.data);
		};

		GameMain.prototype.sectorUpdate = function(data) {
			if (this.pieces[data.playerId]) {

				console.log("Sector Update", data);
			} else {
				//	console.log("Register New Player from update", data.playerId, this.pieces);
			}
		};

		GameMain.prototype.playerUpdate = function(data) {
			if (this.pieces[data.playerId]) {

				this.pieces[data.playerId].setServerState(data);
				this.pieces[data.playerId].notifyServerState(data);
			} else {
			//	console.log("Register New Player from update", data.playerId, this.pieces);
				this.registerPlayer(data);
			}
		};

		GameMain.prototype.contolOwnPlayer = function(clientPiece) {

                clientPiece.setIsOwnPlayer(true);

				this.ownPlayer = clientPiece;

				var handleCursorLine = function(e) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ModuleStateRequest', data:{vector:evt.args(e).data, playerId:clientPiece.getPieceId()}});
				};

				var handleFastClick = function(e) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ModuleStateRequest', data:{fire:true, playerId:clientPiece.getPieceId()}});
				};

				evt.on(evt.list().CURSOR_RELEASE_FAST, handleFastClick);
				
				evt.on(evt.list().INPUT_PLAYER_CONTROL, handleCursorLine);

				var disconnect = function(e) {
					evt.removeListener(evt.list().INPUT_PLAYER_CONTROL, handleCursorLine);
					evt.removeListener(evt.list().CURSOR_RELEASE_FAST, handleFastClick);
					this.ownPlayer = null;
				}.bind(this);

				evt.once(evt.list().CONNECTION_CLOSED, disconnect);
		};

		GameMain.prototype.playerDisconnected = function() {

		};

		GameMain.prototype.trackClientPieces = function(count) {
			if (this.lastPieceCount != count) {
				this.lastPieceCount = count;
				evt.fire(evt.list().MONITOR_STATUS, {CLIENT_PIECES:this.pieceCount});
			}
		};

		GameMain.prototype.updatePieces = function(tpf) {
			this.pieceCount = 0;
			for (var key in this.pieces) {
				this.pieces[key].updatePlayer(tpf);
				this.pieceCount += 1;
			}
		};
		
		GameMain.prototype.tickClientGame = function(tpf) {
			this.updatePieces(tpf);
			this.trackClientPieces(this.pieceCount);
			evt.getFiredCount();
		};

		return GameMain;
	});