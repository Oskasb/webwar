"use strict";


define([
        'io/InputSegmentRadial',
        'game/ClientPiece',
        'Events',
        'PipelineAPI',
        'PipelineObject'
    ],
    function(
        InputSegmentRadial,
        ClientPiece,
        evt,
        PipelineAPI,
        PipelineObject
    ) {


        var GameMain = function() {

            this.inputSegmentRadial = new InputSegmentRadial();

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
            this.addCommanderListener();
        };


        GameMain.prototype.attachFirstControlledPiece = function(clientPiece) {

            if (clientPiece.playerId === PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')) {
                this.contolOwnPlayer(this.pieces[clientPiece.playerId]);
            } else {
                evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:'Present: '+clientPiece.playerId });
            }

        };

        GameMain.prototype.addCommanderListener= function() {
            var processCommanderChange = function(e) {

                if (evt.args(e).commanderId === PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')) {

                    console.log("Switch controlled piece: ", evt.args(e).piece.playerId);

                    if (this.ownPlayer) {
                        this.ownPlayer.detachRadialControl();
                    } else {
                        this.attachFirstControlledPiece(evt.args(e).piece);
                    }

                    this.setControlledPiece(evt.args(e).piece)
                } else {
                    console.log("Other piece command change: ", evt.args(e).piece.playerId);
                }

            }.bind(this);

            evt.on(evt.list().PIECE_COMMANDER_CHANGE, processCommanderChange);

        };

        GameMain.prototype.registerPlayer = function(clientPiece) {

        };

        GameMain.prototype.createPlayer = function(data) {

            var pieces = this.pieces;
            var _this = this;


            var removeCallback = function(playerId) {
                //    setTimeout(function() {
                delete pieces[playerId];
                //    }, 20);
            };

            var pieceReady = function(clientPiece) {
                pieces[clientPiece.playerId] = clientPiece;
                //		console.log("GameMain pieceReady", clientPiece.playerId, clientPiece);
                _this.registerPlayer(clientPiece);
            };

            //	console.log("GameMain createPlayer", data);

            new ClientPiece(data, removeCallback, pieceReady);
        };


        GameMain.prototype.playerUpdate = function(data) {

            if (this.pieces[data.playerId]) {

                this.pieces[data.playerId].setServerState(data);
                this.pieces[data.playerId].notifyServerState(data);
            } else {
                //	console.log("Register New Player from update", data.playerId, this.pieces);
                this.createPlayer(data)

            }
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

        GameMain.prototype.setControlledPiece = function(clientPiece) {
            clientPiece.setIsOwnPlayer(true, this.inputSegmentRadial);
            this.ownPlayer = clientPiece;
        };

        GameMain.prototype.contolOwnPlayer = function(clientPiece) {

            var getControlPieceId = function() {
                return this.ownPlayer.getPieceId();
            }.bind(this);

            this.setControlledPiece(clientPiece);

            var lineEvt = {};
            var fireEvt = {};

            var handleCursorLine = function(e) {
                lineEvt.vector = evt.args(e).data;
                lineEvt.playerId = getControlPieceId();
                evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ModuleStateRequest', data:lineEvt});
            };

            var handleFastClick = function(e) {
                fireEvt.fire = true;
                fireEvt.playerId = getControlPieceId();
                evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ModuleStateRequest', data:fireEvt});
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