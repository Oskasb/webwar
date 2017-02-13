define([
	'Events',
		'particle_system/ParticlesAPI',
		'particle_system/defaults/DefaultRendererConfigs',
		'particle_system/defaults/DefaultSpriteAtlas',
		'particle_system/defaults/DefaultSimulators',
		'particle_system/defaults/FontRendererConfigs',
		'particle_system/defaults/FontSimulators',
		'3d/effects/CheapParticles',
	'PipelineAPI'
	],
	function(
		evt,
		ParticlesAPI,
		DefaultRendererConfigs,
		DefaultSpriteAtlas,
		DefaultSimulators,
		FontRendererConfigs,
		FontSimulators,
		CheapParticles,
		PipelineAPI
	) {


		var particlesAPI;
		var cheapParticles;

		function SimpleParticles(g00) {
			this.goo = g00;
			this.particlesAPI = new ParticlesAPI(g00);
			this.cheapParticles = new CheapParticles(g00);
			cheapParticles = this.cheapParticles;
			particlesAPI = this.particlesAPI;
			this.ready = false;
		}

		SimpleParticles.prototype.createSystems = function(readyCallback) {

			var atlases = {};

			for (var i = 0; i < DefaultSpriteAtlas.atlases.length; i++) {
				atlases[DefaultSpriteAtlas.atlases[i].id] = DefaultSpriteAtlas.atlases[i];
			}

			var fontsRdy = false;
			var spritesRdy = false;

			var checkReady = function() {
				if (fontsRdy && spritesRdy) {
					this.ready = true;
					readyCallback();
				}
			}.bind(this);

			var fontTxLoaded = function(fontTexture) {
		//		console.log("Font TX Loaded", fontTexture)
				this.particlesAPI.createParticleSystems(FontSimulators, FontRendererConfigs, DefaultSpriteAtlas.atlases[1], fontTexture);
				fontsRdy = true;
				checkReady();
			}.bind(this);

			var txLoaded = function(texture) {
		//		console.log("TX Loaded", texture)
				this.particlesAPI.createParticleSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);
				spritesRdy = true;
				checkReady();
			}.bind(this);

		//	var textureCreator = new goo.TextureCreator();

			var pipelineError = function(src, err) {
				console.log("FX texture error", src, err);
			};

			var pipedSprites = function(src, data) {
		//		console.log("pipedSprites", src, data);
				new goo.TextureCreator().loadTexture2D(src, {
					minFilter:"NearestNeighborNoMipMaps",
					wrapS: 'EdgeClamp',
					wrapT: 'EdgeClamp'
				}).then(function(texture) {
					txLoaded(texture);
				});
			};

			var pipedFontTx = function(src, data) {
		//		console.log("pipedFontTx", src, data);
				new goo.TextureCreator().loadTexture2D(src, {
					minFilter:"NearestNeighborNoMipMaps",
					wrapS: 'EdgeClamp',
					wrapT: 'EdgeClamp'
				}).then(function(fontTexture) {
					fontTxLoaded(fontTexture);
				});
			};

			PipelineAPI.cacheImageFromUrl(atlases[DefaultSpriteAtlas.atlases[0].id].textureUrl.value, pipedSprites, pipelineError);
			PipelineAPI.cacheImageFromUrl(atlases[DefaultSpriteAtlas.atlases[1].id].textureUrl.value, pipedFontTx, pipelineError);

		};


		SimpleParticles.prototype.applyCheapParticleConfigs = function(cheapParticleConfigs, allLoaded) {

            var loadIds = [];

            var loadCount = 0;
            var startCount = 0;

            var readyCB = function(id) {
                loadIds.splice(loadIds.indexOf(id), 1);

                loadCount++;
            //    console.log("Load cheap", startCount, loadCount, id, loadIds);
                if (loadIds.length == 0) {
                    allLoaded(loadCount);
                }
            };


			for (var key in cheapParticleConfigs) {
                loadIds.push(key);
                startCount ++;
				this.cheapParticles.createSystem(key, cheapParticleConfigs[key], readyCB);
			}
		};

		SimpleParticles.prototype.spawn = function(simulatorId, position, normal, effectData, callbacks) {
			if (!this.ready) return;
				this.particlesAPI.spawnParticles(simulatorId, position, normal, effectData, callbacks);
		};

		SimpleParticles.prototype.spawnCheap = function(simulatorId, position, normal, effectData) {

			if (isNaN(normal.y)) {
				console.log("Non normal", simulatorId)
			}

			this.cheapParticles.spawn(simulatorId, position, normal, effectData)
		};


        var lastFancyParticles = 0;
        var lastfancySims = 0;
        var lastCheapParticles = 0;
        var lastCheapSims = 0;
        var lastMatCount= 0;


		var monitorParticleStatus = function() {

            var count = particlesAPI.getParticleCount();

            if (count != lastFancyParticles) {
                lastFancyParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_PARTICLES:lastFancyParticles});
            }

            count = particlesAPI.getParticleSimCount();

            if (count != lastfancySims) {
                lastfancySims = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_SIMULATIONS:lastfancySims});
            }

            count = cheapParticles.getCheapParticleCount();

            if (count != lastCheapParticles) {
                lastCheapParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_PARTICLES:lastCheapParticles});
            }

            count = cheapParticles.getCheapParticleSimCount();

            if (count != lastCheapSims) {
                lastCheapSims = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_SIMULATORS:lastCheapSims});
            }

            var matCount = particlesAPI.getParticleMaterialCount();
            matCount += cheapParticles.getCheapMaterialCount();

            if (matCount != lastMatCount) {
                lastMatCount = matCount;
                evt.fire(evt.list().MONITOR_STATUS, {MATERIALS:lastMatCount});
            }

		};

        SimpleParticles.prototype.monitorParticleStatus = function() {
            monitorParticleStatus();
        };

		SimpleParticles.prototype.update = function(tpf) {
			particlesAPI.requestFrameUpdate(tpf);
			cheapParticles.update(tpf);
            monitorParticleStatus();
		};

		return SimpleParticles;
	});