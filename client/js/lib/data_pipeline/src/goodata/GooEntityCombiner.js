"use strict";

define([
	'data_pipeline/goodata/MaterialBatch',
],
	function(
		MaterialBatch
		) {

		var MeshBuilder = goo.MeshBuilder;

		var GooEntityListCombiner = function() {
			this.meshBuilder = new MeshBuilder();
		};


		GooEntityListCombiner.prototype.buildMaterialBatches = function(list) {
			var batches = {};

			var generateMaterialKey = function(meshRendererComponent) {
				var key = "";
				for (var i = 0; i < meshRendererComponent.materials.length; i ++) {
					key += meshRendererComponent.materials[i].name;
				}

				return key;
			};

			var collectMaterialEntity = function(entity) {
				var key = generateMaterialKey(entity.meshRendererComponent);
				if (!batches[key]) {
					batches[key] = new MaterialBatch(key, entity.meshRendererComponent);
				}
				batches[key].addEntity(entity);
			};

			for (var i = 0; i < list.length; i++) {
				list[i].traverse(function (entity) {
					if (entity.meshRendererComponent) {
						collectMaterialEntity(entity);
					}
				});
			}

			return batches;
		};

		GooEntityListCombiner.prototype.combineBatch = function(goo, batch) {
			this.meshBuilder.reset();

			for (var i = 0; i < batch.meshDataTransforms.length; i++) {
				this.meshBuilder.addMeshData(batch.meshDataTransforms[i].meshData, batch.meshDataTransforms[i].transform);
			}

			var combinedMeshData = this.meshBuilder.build();
			var newEntity = goo.world.createEntity(combinedMeshData[0]);
			newEntity.setComponent(batch.meshRendererComponent)
			return newEntity;
		};


		GooEntityListCombiner.prototype.combineList = function(goo, list, callback) {

			var materialBatches = this.buildMaterialBatches(list);
			var combinedEntities = [];

			for (var key in materialBatches) {
				var combinedEntity = this.combineBatch(goo, materialBatches[key]);
				combinedEntities.push(combinedEntity);
			}

			callback(combinedEntities);
		};

		return GooEntityListCombiner;

	});