"use strict";


define([
		'3d/GooEntityFactory',
		'game/modules/GooModule',
		'Events'
	],
	function(
		GooEntityFactory,
		GooModule,
		evt
	) {

		var GooPiece = function(piece) {

			this.id = piece.id;
			this.piece = piece;
			this.entity = GooEntityFactory.buildRootEntity();

		};

		GooPiece.prototype.attachModule = function(module, attachmentPoint) {
			return new GooModule(module, this.piece, this.entity, attachmentPoint);
		};


		GooPiece.prototype.removeGooPiece = function() {
			this.entity.removeFromWorld();
		};

		GooPiece.prototype.getFrustumCoordinates = function(store) {
			this.entity.getScreenCoordinates(store);
		};
		
		

		GooPiece.prototype.sampleSpatial = function(spatial) {

		//	spatial.getVelArray(this.vel);
		//	spatial.getPosArray(this.pos);
		//	spatial.getRotArray(this.rot);
		//	spatial.getRotVelArray(this.rotVel);


			//	spatial.getPosArray(this.entity.transformComponent.transform.translation.data);

			this.entity.transformComponent.transform.translation.x = spatial.pos.getX();
			this.entity.transformComponent.transform.translation.y = spatial.pos.getY();
			this.entity.transformComponent.transform.translation.z = spatial.pos.getZ();

		//	spatial.getRotArray(this.rot);
			this.entity.transformComponent.transform.rotation.fromAngles(0, -spatial.yaw(), 0);
		};


		GooPiece.prototype.updateGooPiece = function() {

			this.sampleSpatial(this.piece.spatial);

			//	this.domRoot.translateCnvXYZ(GameScreen.percentToX(this.pos[0]), GameScreen.percentToY(this.pos[1]), 0);
			//	this.domHull.rotateXYZ(0, 0, 1, this.rot[0]);
			if (this.piece.ownPlayer) {
				console.log(this.entity.transformComponent.transform.translation.x)
			}

			this.entity.transformComponent.setUpdated();

		};


		return GooPiece;

	});


