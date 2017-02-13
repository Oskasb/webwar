"use strict";

define([],
	function(
		) {

		var EntityUtils = goo.EntityUtils;

		var MaterialBatch = function(key, meshRendererComponent) {
			this.key = key;
			this.meshRendererComponent = meshRendererComponent;
			this.meshDataTransforms = [];
		};

		MaterialBatch.prototype.addEntity = function(entity) {
			entity.transformComponent.updateTransform();
			EntityUtils.updateWorldTransform(entity.transformComponent);
			this.meshDataTransforms.push({meshData:entity.meshDataComponent.meshData, transform:entity.transformComponent.worldTransform});
		};

		return MaterialBatch;
	});