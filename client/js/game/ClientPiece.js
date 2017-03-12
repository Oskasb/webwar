"use strict";


define([
	'Events',
	'ThreeAPI',
	'game/ThreePiece',
	'io/InputSegmentRadial',
    'PipelineObject',
	'PipelineAPI',
    'game/ClientModule',
	'game/AttachmentPoint'
],
	function(
		evt,
		ThreeAPI,
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
		
		
		var ClientPiece = function(serverState, removeCallback, pieceReady) {

            var _this = this;

            this.clientModules = [];
            this.attachmentPoints = [];

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.type, serverState.playerId);
	//		piece.serverState = serverState;
			this.piece = piece;
			this.playerId = serverState.playerId;
            this.name = this.playerId;



			
		//	this.gooPiece = new GooPiece(this.piece);
			
			this.removeCallback = removeCallback;
			this.setServerState(serverState);
            this.piece.updateNetworkState(serverState);

			var hierarchyReady = function() {
				_this.notifyServerState(serverState);
				pieceReady(_this);
			};

            var applyPieceData = function(src, data) {
       //         console.log("Attach pieceData", src, data)

                _this.pieceData = data;
				_this.threePiece = new ThreePiece(_this.piece, _this);
                _this.addAttachmentPoints(data.attachment_points, data.default_modules, hierarchyReady);
                //       _this.attachModules(data.modules);

            };

            
            this.pipelineObject = new PipelineObject('PIECE_DATA', piece.type, applyPieceData);

			
		};

		ClientPiece.prototype.getScreenPosition = function(store) {

			ThreeAPI.toScreenPosition(this.piece.spatial.posX(), this.piece.spatial.posY(), this.piece.spatial.posZ(), store);
		//	camera.getFrustumCoordinates(this.gooPiece.entity.transformComponent.transform.translation, store);
		//	store.scale(1/camera.near);
		};

		ClientPiece.prototype.getCameraInsideBounds = function() {

			ThreeAPI.toScreenPosition(this.piece.spatial.posX(), this.piece.spatial.posY(), this.piece.spatial.posZ(), store);
			//	camera.getFrustumCoordinates(this.gooPiece.entity.transformComponent.transform.translation, store);
			//	store.scale(1/camera.near);
		};

		ClientPiece.prototype.monitorModules = function(bool) {
			for (var i = 0; i < this.clientModules.length; i++) {
				this.clientModules[i].monitorClientModule(bool);
			}
		};


		ClientPiece.prototype.addAttachmentPoints = function(attachmentPoints, defaultModules, hierarchyReady) {

            for (var i = 0; i < this.attachmentPoints.length; i++) {
				this.attachmentPoints[i].detatchAttachmentPoint();
            }

			this.attachmentPoints.length = 0;

			for (var i = 0; i < attachmentPoints.length; i++) {
				var ap = new AttachmentPoint(attachmentPoints[i], defaultModules[i]);
				this.attachmentPoints.push(ap)
			}

			this.attachModules(hierarchyReady);
        };

		ClientPiece.prototype.getAttachmentPoint = function(point_id) {
			for (var i = 0; i < this.attachmentPoints.length; i++) {
				if (this.attachmentPoints[i].point_id == point_id) {
					return this.attachmentPoints[i];
				}
			}
		};

		ClientPiece.prototype.attachModules = function(hierarchyReady) {

			var readyPoints = 0;
			var startedPoints = 0;

			var apReady = function() {
				readyPoints++;
				if (readyPoints == startedPoints) {
					hierarchyReady();
				}
			};

			this.detachModules();
			var serverState = this.piece.serverState;
			for (var i = 0; i < this.attachmentPoints.length; i++) {
				startedPoints++;
				this.attachmentPoints[i].attachClientModule(new ClientModule(this, this.attachmentPoints[i], serverState.modules[this.attachmentPoints[i].data.module]), apReady);
			}

			this.buildHierarchy(hierarchyReady);
		};

		ClientPiece.prototype.buildHierarchy = function() {

			for (var i = 0; i < this.attachmentPoints.length; i++) {

				this.attachmentPoints[i].attachModuleModels();
				if (this.attachmentPoints[i].parent) {
					this.attachmentPoints[i].attachToParent(this.getAttachmentPoint(this.attachmentPoints[i].parent).object3D);
				} else {
					this.attachmentPoints[i].attachToParent(this.threePiece.getParentObject3d());
				}
			}
		};

        ClientPiece.prototype.registerModule = function(module) {
			if (this.clientModules.indexOf(module) == -1) {
				this.clientModules.push(module);
			}
        };


		ClientPiece.prototype.detachModules = function() {
			for (var i = 0; i < this.clientModules.length; i++) {
				this.clientModules[i].removeClientModule();
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

			this.threePiece.updateThreePiece();

			if (this.threePiece.render) {
				this.sampleClientModules(this.piece.serverState.modules);
			}

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
			if (!this.pipelineObject) {
				console.log("Broken Piece: ", this);
				return;
			}
            this.pipelineObject.removePipelineObject();

			this.detachModules();
		//	this.gooPiece.removeGooPiece();
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
		//		evt.fire(evt.list().GAME_EFFECT, {effect:"shockwave", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
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
			//	this.gooPiece.updateGooPiece();
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

			//	this.gooPiece.updateGooPiece();
				return;
			}
			
			
			if (serverState.state == GAME.ENUMS.PieceStates.SPAWN) {
				//	this.piece.notifyTrigger(true);

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getZ()+5;

		//		evt.fire(evt.list().PARTICLE_TEXT, {text:'POP', textStyle:textStyle});

			//	this.gooPiece.updateGooPiece();
				if (this.pieceData.default_modules) {
					if (this.pieceData.default_modules.indexOf('bullet_shell') != -1) {
						evt.fire(evt.list().GAME_EFFECT, {
							effect: "test_effect",
							pos: this.piece.spatial.pos,
							vel: this.piece.spatial.vel
						});
					}
				}
			}
		};


		return ClientPiece;
	});