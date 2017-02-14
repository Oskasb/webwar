"use strict";


define([
	'Events',
	'ui/GooPiece',
	'game/ThreePiece',
	'io/InputSegmentRadial',
    'PipelineObject',
	'PipelineAPI',
    'game/ClientModule',
        'game/AttachmentPoint'
],
	function(
		evt,
		GooPiece,
		ThreePiece,
		InputSegmentRadial,
        PipelineObject,
		PipelineAPI,
        ClientModule,
        AttachmentPoint
		) {

		var textStyle = {
			posx: 20,
			posy: 20,
			size: 0.5,
			particleConfig:'tpf_Letter',
			textConfig:'text_config'
		};

		var camera;
		
		var ClientPiece = function(serverState, removeCallback) {

            var _this = this;

            this.clientModules = [];
            this.attachmentPoints = [];

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.type, serverState.playerId);
	//		piece.serverState = serverState;
			this.piece = piece;
			this.playerId = serverState.playerId;
            this.name = this.playerId;


			this.threePiece = new ThreePiece(this.piece);
			
			this.gooPiece = new GooPiece(this.piece);
			
			this.removeCallback = removeCallback;
			this.setServerState(serverState);
            this.piece.updateNetworkState(serverState);

            var applyPieceData = function(src, data) {
       //         console.log("Attach pieceData", src, data)
                _this.pieceData = data;
                _this.addAttachmentPoints(data.attachment_points, data.default_modules);
                //       _this.attachModules(data.modules);
            };
            
            this.pipelineObject = new PipelineObject('PIECE_DATA', piece.type, applyPieceData);
            this.notifyServerState(serverState)
			camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA').cameraComponent.camera;
		};

		ClientPiece.prototype.getScreenPosition = function(store) {
			camera.getFrustumCoordinates(this.gooPiece.entity.transformComponent.transform.translation, store);
			store.scale(1/camera.near);
		};

		var testBound = new goo.BoundingSphere(new goo.Vector3(0, 0, 0), 20);

		ClientPiece.prototype.testFrustumVisible = function() {
			testBound.center.setDirect(this.piece.spatial.posX(), this.piece.spatial.posY(), this.piece.spatial.posZ());

			if (camera.contains(testBound) === goo.Camera.Outside) {
				return;
			}

			return true;

		};


		ClientPiece.prototype.addAttachmentPoints = function(attachmentPoints, defaultModules) {

            this.detachModules();
            this.attachmentPoints.length = 0;

            for (var i = 0; i < attachmentPoints.length; i++) {
                var ap = new AttachmentPoint(attachmentPoints[i], defaultModules[i]);
                if (ap.data.module) {
                    this.attachModule(ap);
                }
                this.attachmentPoints.push(ap)
            }
        };

        ClientPiece.prototype.registerModule = function(module) {
            this.clientModules.push(module);
        };

        ClientPiece.prototype.attachModule = function(attachmentPoint) {
            var serverState = this.piece.serverState;
            new ClientModule(this, attachmentPoint, serverState.modules[attachmentPoint.data.module]);
        };


		ClientPiece.prototype.detachModules = function() {
            
            for (var i= 0; i < this.clientModules.length; i++) {
                this.clientModules[i].removeClientModule()
            }
            this.clientModules.length = 0;
		};

		ClientPiece.prototype.getPieceId = function() {
			return this.piece.id;
		};

        ClientPiece.prototype.getPieceName = function() {
            if (this.piece.readServerModuleState('nameplate')) {
                var name = this.piece.readServerModuleState('nameplate')[0].value;
                if (this.name != name) {
                    if (this.isOwnPlayer) {
                        evt.fire(evt.list().MESSAGE_UI, {channel:"own_player_name", message:name});
                    }
                    if (name.length > 10) {
                        name = name.substring(0, 10);
                    }
                    this.name = name;
                }
                return name;
            }
        };
        
        ClientPiece.prototype.calculateClientPosition = function(piece) {
    //        piece.spatial.interpolateRotational(piece.spatial, piece.serverSpatial, piece.temporal.tpf);
            piece.spatial.interpolateFraction(piece.frameCurrentSpatial, piece.frameNextSpatial, piece.temporal.getPacketTimeFraction());
        };

		
		ClientPiece.prototype.updatePlayer = function(tpf) {
			
			this.piece.updatePieceFrame(tpf);

            this.calculateClientPosition(this.piece);
			
			if (this.piece.state == GAME.ENUMS.PieceStates.TIME_OUT) {
				this.playerRemove();
				return;
			} else {
			//	this.gooPiece.updateGooPiece();
			}

			if (this.isOwnPlayer) {

			}

            this.sampleClientModules(this.piece.serverState.modules);

			this.gooPiece.updateGooPiece();
			this.threePiece.updateThreePiece();
		};

		
		ClientPiece.prototype.setIsOwnPlayer = function(bool) {
			evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:'Player Ready'});
			this.isOwnPlayer = bool;
			this.attachRadialControl();
			PipelineAPI.setCategoryKeyValue('GAME_DATA', 'OWN_PLAYER', {ownPiece:this})
			evt.fire(evt.list().CONTROLLED_PIECE_UPDATED, this.piece)
		};

		ClientPiece.prototype.attachRadialControl = function() {
			var inputSegmentRadial = new InputSegmentRadial();
			inputSegmentRadial.registerControlledPiece(this.piece);

			var pieceModuleDataLoaded = function(src, data) {
				inputSegmentRadial.applyConfigs(data.controls.input);

			};
            this.inputSegmentRadial = inputSegmentRadial;
			new PipelineObject('PIECE_DATA', this.piece.type, pieceModuleDataLoaded);
			console.log("ClientPiece", this);
		};
		
		ClientPiece.prototype.playerRemove = function() {
            this.pipelineObject.removePipelineObject();
			this.detachModules();
			this.gooPiece.removeGooPiece();
			this.threePiece.removeThreePiece();
			this.removeCallback(this.piece.id);
		};

        ClientPiece.prototype.sampleClientModules = function(serverModules) {
            for (var i = 0; i < this.clientModules.length; i++) {
                this.clientModules[i].applyModuleServerState(serverModules);
                this.clientModules[i].sampleModuleFrame();
            } 
        };

		ClientPiece.prototype.setServerState = function(serverState) {

        //    this.piece.processModules(serverState.modules);

            this.piece.applyNetworkState(serverState);

            this.getPieceName();
        };




        ClientPiece.prototype.notifyServerState = function(serverState) {
			
			if (serverState.state == GAME.ENUMS.PieceStates.REMOVED) {
		//		this.domPlayer.renderStateText("Poof");

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'POOF', textStyle:textStyle});

                evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:this.piece.id+' has left the area' });

				this.playerRemove();
				return;
			}

			if (serverState.state == GAME.ENUMS.PieceStates.TIME_OUT) {
			//	evt.fire(evt.list().GAME_EFFECT, {effect:"despawn_pulse", pos:this.piece.spatial.pos, vel:{data:[0, 1, 0]}});
			//	this.domPlayer.renderEffect('effect_shockwave_light', 0.25, 1.4);
				this.playerRemove();
				return;
			}

            if (serverState.state == GAME.ENUMS.PieceStates.EXPLODE) {
            //    this.domPlayer.renderEffect('effect_explosion_bullet', 0.4, 1);
            //    this.domPlayer.renderEffect('effect_shockwave_heavy', 0.25, 1.4);

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'OUCH', textStyle:textStyle});


				evt.fire(evt.list().GAME_EFFECT, {effect:"explode", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
				evt.fire(evt.list().GAME_EFFECT, {effect:"shockwave", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
            }

            if (serverState.state == GAME.ENUMS.PieceStates.BURST) {
        //        this.domPlayer.renderEffect('effect_shockwave_light', 0.45, 0.6);

				evt.fire(evt.list().GAME_EFFECT, {effect:"collide", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
            }

			if (serverState.state == GAME.ENUMS.PieceStates.TELEPORT) {
				//	this.piece.notifyTrigger(true);
			//	this.domPlayer.renderStateText("Jump");
				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'TELEPORT', textStyle:textStyle});
				this.gooPiece.updateGooPiece();
				evt.fire(evt.list().GAME_EFFECT, {effect:"teleport", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;
				evt.fire(evt.list().PARTICLE_TEXT, {text:'TELEPORT', textStyle:textStyle});
                evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:this.piece.id+' - Teleport' });
			}


			if (serverState.state == GAME.ENUMS.PieceStates.HIDE) {
				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

		//		evt.fire(evt.list().PARTICLE_TEXT, {text:'HIDE', textStyle:textStyle});

				this.playerRemove();
				return;
			}

			if (serverState.state == GAME.ENUMS.PieceStates.APPEAR) {
				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

			//	evt.fire(evt.list().PARTICLE_TEXT, {text:'APPEAR', textStyle:textStyle});

				this.gooPiece.updateGooPiece();
				return;
			}
			
			
			if (serverState.state == GAME.ENUMS.PieceStates.SPAWN) {
				//	this.piece.notifyTrigger(true);

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

		//		evt.fire(evt.list().PARTICLE_TEXT, {text:'POP', textStyle:textStyle});

				this.gooPiece.updateGooPiece();
			//	evt.fire(evt.list().GAME_EFFECT, {effect:"spawn_pulse", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});

			}

		};


		return ClientPiece;
	});