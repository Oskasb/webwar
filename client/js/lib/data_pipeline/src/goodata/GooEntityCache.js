define([
		'data_pipeline/goodata/GooEntityCombiner'
],
	function(
		GooEntityListCombiner
		) {
		"use strict";

		var EntityUtils = goo.EntityUtils;

		var gooWorld;
		var renderer;

		var GooEntityCache = function() {
			this.clonableEntities = {};
		    this.cachedEntities = {};
			this.cachedEnvironments = {};
			this.gooEntityListCombiner = new GooEntityListCombiner();
		};

		GooEntityCache.prototype.preloadEntityData = function(entity, callback) {

			var world = gooWorld;
			var transformSystem = world.getSystem('TransformSystem');
			var cameraSystem = world.getSystem('CameraSystem');
			var boundingSystem = world.getSystem('BoundingUpdateSystem');
			var animationSystem = world.getSystem('AnimationSystem');
			var renderSystem = world.getSystem('RenderSystem');

			var processCount = 0;
			var doneCount = 0;

			var handleTraversed = function(child) {
				  if (!child.id) {
					  console.error("No id on Child: ", child)
				  }
				if (child.meshRendererComponent) {



					processCount++;
					var precompedShader = function() {
						return renderer.preloadMaterials([child]).then(preloadedMats);
					};

					var preloadedMats = function() {
						world.processEntityChanges();
						processCount--;
						if (processCount == 0) {
							doneCount++;
							callback();

						}
					};

					world.processEntityChanges();
					transformSystem._process();
					cameraSystem._process();
					boundingSystem._process();
					animationSystem._process();
					renderer.precompileShaders([child], renderSystem.lights).then(precompedShader);
				}

			};

			if (typeof(entity.traverse) == 'function') {
				entity.traverse(handleTraversed);

				if (doneCount == 0 && processCount == 0) {
					console.error("Traversed entity and found zero mesh renderer comps..", entity);
					callback();
				}
			} else {
				callback();
			}
		};


		GooEntityCache.prototype.clone = function(obj) {
			var copy;

			// Handle the 3 simple types, and null or undefined
			if (null == obj || "object" != typeof obj) return obj;

			// Handle Date
			if (obj instanceof Date) {
				copy = new Date();
				copy.setTime(obj.getTime());
				return copy;
			}

			// Handle Array
			if (obj instanceof Array) {
				copy = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					copy[i] = this.clone(obj[i]);
				}
				return copy;
			}

			// Handle Object
			if (obj instanceof Object) {
				copy = {};
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
				}
				return copy;
			}

			throw new Error("Unable to copy obj! Its type isn't supported.");
		};

		GooEntityCache.prototype.processForClone = function(entity) {
			var settings = {
				skeletonMap:{
					originals: [],
					clones: []
				}
			};
			var addToSettings = function(pose) {
				console.log("Skel Pose: ", pose);
				settings.skeletonMap.originals.push(pose);
				settings.skeletonMap.clones.push(pose.clone())
			};

		/*
			var cloneAnimations = function(ent) {
				console.log("Clone ent anims: ", ent);

			//	ent.animationComponent._skeletonPose = cloneSkelPose(ent.animationComponent._skeletonPose)
			//	addToSettings(ent.animationComponent._skeletonPose);
			//	ent.setComponent(new AnimationComponent(cloneSkelPose(ent.animationComponent._skeletonPose)));
			};

			if (entity.animationComponent) {
				cloneAnimations(entity)
			}
        */
			var clone = function(obj) {
				return this.clone(obj);
			}.bind(this);

			var handleTraversed = function(child) {
				if (!child.id) {
					console.error("No id on Child: ", child)
				}

				if (child.animationComponent) {
					addToSettings(child.animationComponent._skeletonPose);
				}

				if (child.meshRendererComponent) {
				//	console.log("mesh child: ", child);
					if (child.hasTag('reflectable')) {
						console.log("has the reflectable tag: ", child);
						child.meshRendererComponent.isReflectable = true;
					} else {
						child.meshRendererComponent.isReflectable = false;
					}


				}

			}.bind(this);

			if (typeof(entity.traverse) == 'function') {
				entity.traverse(handleTraversed);
			}
			return entity;
		};

		GooEntityCache.prototype.preloadEntity = function(entity, bundleConf, sourceData, success, cloneIt) {

			var preloadDoneCallback = function(ent, gooConf, sourceConf) {
				success(ent.name, {conf:gooConf, sourceData:sourceConf, build:cloneIt})
			};

			var preProcessingDone = function() {
				this.clonableEntities[entity.name] = entity;
				preloadDoneCallback(entity, bundleConf, sourceData);
			}.bind(this);

			this.preloadEntityData(entity, preProcessingDone);
		};

		GooEntityCache.prototype.cloneEntity = function(entityName, callback) {
			if (!this.clonableEntities[entityName]) {
				console.error("No entity available with name: ", entityName, this.clonableEntities);
			}
			var processedClone = this.processForClone(EntityUtils.clone(gooWorld, this.clonableEntities[entityName]))
			callback(processedClone);
		};




		GooEntityCache.prototype.reloadEnvironment = function(entityName, callback) {
			if (!this.cachedEnvironments[entityName]) {
				console.error("No environment available with name: ", entityName, this.cachedEnvironments);
			}

			this.cachedEnvironments[entityName].loader.load(this.cachedEnvironments[entityName].conf.id).then(function(res) {
				callback(res)
			});
		};


		var cloneSettings = {
			shareTextures:true,
			shareUniforms:true,
			shareMeshData:true,
			shareMaterials:true
		};

		var cachedEntities;


		GooEntityCache.prototype.returnBuiltEntity = function(id, entity, loader, sourceData, success, fail) {
			cachedEntities = this.cachedEntities;
			console.log("Fetch Built Entity: ", id, entity, loader, sourceData)

			var processForClone = function(e) {
				return this.processForClone(e)
			}.bind(this);

			var cloneEntityName = function(conf, cb) {
				setTimeout(function() {

					var eClone = EntityUtils.clone(gooWorld, entity, cloneSettings);

					processForClone(eClone);
				//	console.log("Built Clone: ",eClone )
					cb(eClone);
				}, 0)
			};

			var cloneIt = function(entityName, callback) {
				cloneEntityName(this.cachedEntities[entityName], callback);
			}.bind(this);

			this.preloadEntity(entity, this.cachedEntities[entity.name], sourceData, success, cloneIt)

		};

		GooEntityCache.prototype.cacheLoadedEntities = function(gooRunner, bundleConf, loaderData, loader, success, fail, notifyLoaderProgress) {

			gooWorld = gooRunner.world;
			renderer = gooRunner.renderer;

			var progressUpdate = function(handled, refCount) {
				notifyLoaderProgress(handled, refCount);
			};

			for (var index in loaderData) {
				var entry = loaderData[index];

				if (bundleConf.environment) {
					if (bundleConf.environment.indexOf(entry.name) != -1) {

						this.cachedEnvironments[entry.name] = {conf:entry, loader:loader};
					//	loader.load(entry.id)

						console.log("Added env: ", entry.name, this.cachedEnvironments);
						var applyIt = function(name, cb) {
							console.log("Apply: ", this.cachedEnvironments[name]);
							cb(this.cachedEnvironments[name])
						}.bind(this);
					//	success(entry.name, {conf:entry, sourceData:bundleConf, build:applyIt})
					}
				}

				if (bundleConf.entities) {

					if (bundleConf.entities.indexOf(entry.name) != -1) {

						var entityBuilt = function(id, res, dynamicLoader) {
							this.returnBuiltEntity(id, res, dynamicLoader, bundleConf, success, fail);
						}.bind(this);

						this.cachedEntities[entry.name] = entry;

						loader.load(entry.id, {preloadBinaries:false, progressCallback:progressUpdate})
							.then(function(res) {

								if (!entry.id) {
									console.error("No ID on entry: ", entry)
									return;
								}
								entityBuilt(entry.id, res, loader);

							}).then(null, function (e) {
								// If something goes wrong, 'e' is the error message from the engine.
							console.log(e, entry, bundleConf)
								fail('Failed to load bundle: ', entry, bundleConf, e);
							})
					}
				}
			}
		};

		GooEntityCache.prototype.runCombinerOnList = function(entityList, combineDone) {
			this.gooEntityListCombiner.combineList(goo, entityList, combineDone);
		};


		return GooEntityCache;
	});
