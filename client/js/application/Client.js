"use strict";


define([
		'Events',
		'application/ClientRegistry',
        'application/debug/SetupDebug',
		'io/Connection',
		'application/TimeTracker',
		'main/ClientWorld',
		'main/GameMain',
        'ui/GuiSetup',
		'ui/UiMessenger',
		'PipelineAPI'
    ],
	function(
        evt,
        ClientRegistry,
        SetupDebug,
        Connection,
        TimeTracker,
        ClientWorld,
        GameMain,
        GuiSetup,
        UiMessenger,
        PipelineAPI
    ) {


		var frame = 0;

        var ClientState = '';
        var sendMessage = function() {};

        var Client = function(pointerCursor) {
            ClientState = GAME.ENUMS.ClientStates.INITIALIZING;

            new SetupDebug();

			this.pointerCursor = pointerCursor;
			this.timeTracker = new TimeTracker();
			this.gameMain = new GameMain();
			this.guiSetup = new GuiSetup();
            new UiMessenger();
            this.connection = new Connection();

            this.handlers = {};

            this.handlers.clientRegistry = new ClientRegistry();
            this.handlers.gameMain = this.gameMain;
            this.handlers.timeTracker = this.timeTracker;
            this.handlers.clientWorld = new ClientWorld();
            PipelineAPI.setCategoryData('POINTER_STATE', this.pointerCursor.inputState);

		};

        var messageCount = 0;

        Client.prototype.handleServerMessage = function(res) {
            messageCount++
            PipelineAPI.setCategoryKeyValue('STATUS', 'MESSAGE_STACK',messageCount);
            evt.fire(evt.list().SERVER_MESSAGE, res);
            var message = this.socketMessages.getMessageById(res.id);
            if (message) {
                this.handlers[message.target][res.id](res.data);
            } else {
                if (res.id == 'server_status') {

                } else {
                    evt.fire(evt.list().MESSAGE_UI, {channel:'receive_error', message:'Unhandled message '+res.id});
                    console.log("unhandled message response:", res);
                }
            }
        };


        Client.prototype.setClientState = function(state) {
            ClientState = state;
            console.log("SetCLientState: ", state);
            evt.fire(evt.list().MESSAGE_UI, {channel:'client_state', message:' - '+state});
        };


        Client.prototype.connectSocket = function(socketMessages, connection) {
            this.setClientState(GAME.ENUMS.ClientStates.CONNECTING);

            var disconnectedCallback = function() {
                console.log("Socket Disconnected");
                this.setClientState(GAME.ENUMS.ClientStates.DISCONNECTED);
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_error', message:'Connection Lost'});
                evt.fire(evt.list().CONNECTION_CLOSED, {data:'closed'});
                evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
                setTimeout(function() {
                    connect();
                }, 200)
            }.bind(this);

            var handleSendRequest = function(e) {
                var msg = socketMessages.getMessageById(evt.args(e).id);
                var args = evt.args(e);
                sendMessage(msg, args);
            };

            var errorCallback = function(error) {
                console.log("Socket Error", error);
            };

            var connectedCallback = function() {
                this.setClientState(GAME.ENUMS.ClientStates.CONNECTED);
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_status', message:'Connection Open'});
                evt.fire(evt.list().CONNECTION_OPEN, {});
                evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
            }.bind(this);

            var connect = function() {
                sendMessage = connection.setupSocket(connectedCallback, errorCallback, disconnectedCallback);
            };

            connect();

        };


        Client.prototype.initiateClient = function(socketMessages, connectionReady) {

            this.guiSetup.initMainGui();
            var connection = this.connection;

            this.socketMessages = socketMessages;

			var count = 0;

			var requestPlayer = function(e) {
				console.log("Request Player", e);
                
                if (!name) name = 'NoName';
                
                evt.fire(evt.list().MESSAGE_UI, {channel:'own_player_name', message:name});
				PipelineAPI.setCategoryData('REGISTRY', {PLAYER_NAME:name});

				if (ClientState == GAME.ENUMS.ClientStates.CLIENT_REQUESTED) {
					var clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID');
					console.log("RequestPlaye with ClientId:", clientId);
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterPlayer', data:{clientId:clientId, name:name}});
					this.setClientState(GAME.ENUMS.ClientStates.PLAYER_REQUESTED);
				}

			}.bind(this);

            var requestClient = function() {

                //    if (ClientState == GAME.ENUMS.ClientStates.READY) {

                count++;

                var clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID');

                console.log("Request ClientID",clientId);

                if (clientId == 'CLIENT_ID') {
                    evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:'Request ID'});
                    clientReady();
                    return;
                }



                evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterClient', data:{clientId:clientId}});

                evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:'ID: '+PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')});
                this.setClientState(GAME.ENUMS.ClientStates.CLIENT_REQUESTED);

                connectionReady();
                
            }.bind(this);


			var clientReady = function() {
    //            console.log("Client Ready!")
			//	this.setClientState(GAME.ENUMS.ClientStates.READY);
				setTimeout(function() {
					requestClient();
				}, 10);

                
			//	evt.removeListener(evt.list().CONNECTION_OPEN, clientReady)
			}.bind(this);

            //  sendMessage = this.setupSocketCallbacks(connection, connectedCallback, errorCallback, disconnectedCallback);

            evt.on(evt.list().CONNECTION_OPEN, clientReady);
            evt.on(evt.list().PLAYER_READY, requestPlayer);



            this.connectSocket(socketMessages, connection);

		};

        var aggDiff = 0;

        var tickEvent = {frame:0, tpf:1};


        Client.prototype.setupSimulation = function(sceneController, ready) {
            var _this = this;

            var clientTick = function(tpf) {
                _this.tick(tpf)
            };

            sceneController.setup3dScene(clientTick, ready);

            var setupEffects = function() {
                sceneController.setupEffectPlayers();
            };

            evt.once(evt.list().PLAYER_READY, setupEffects);

        };

        Client.prototype.processResponseStack = function(responseStack) {

            if (responseStack.length > 4) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }
            
            if (responseStack.length > 2) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }

            if (responseStack.length) {
                this.handleServerMessage(responseStack.shift());
            }

            if (responseStack.length) {
                this.handleServerMessage(responseStack.shift());
            }


            if (responseStack.length > 5) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }

            if (responseStack.length > 5) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }
            if (responseStack.length > 5) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }
            if (responseStack.length > 5) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }

        };

        var start;
        
        Client.prototype.tick = function(tpf) {
            
            start = performance.now();
            messageCount = 0;
			frame++;


            
            
            var responseStack = this.connection.processTick();


            
            this.processResponseStack(responseStack);

			var exactTpf = this.timeTracker.trackFrameTime(frame);

            if (exactTpf < 0.002) {
        //        console.log("superTiny TPF");
                return;
            }

		//	console.log(tpf - exactTpf, tpf, this.timeTracker.tpf);

            aggDiff += tpf-exactTpf;

            if (Math.abs(tpf-exactTpf) < 0.002) {
        //        tpf = exactTpf;

            } else {
       //         console.log("Big DT", tpf, exactTpf, aggDiff);
            }
            tickEvent.frame = frame;
            tickEvent.tpf = tpf;

            PipelineAPI.setCategoryKeyValue('STATUS', 'TPF', tpf);
            evt.fire(evt.list().CLIENT_TICK, tickEvent);
            this.gameMain.tickClientGame(tpf);
            
            evt.fire(evt.list().CAMERA_TICK, {frame:frame, tpf:tpf});
            PipelineAPI.setCategoryKeyValue('STATUS', 'TIME_GAME_TICK', performance.now() - start);
            PipelineAPI.setCategoryKeyValue('STATUS', 'MESSAGE_STACK',messageCount);
		};

		return Client;

	});