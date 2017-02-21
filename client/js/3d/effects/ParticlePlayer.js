define([
    'Events',
        'particle_system/defaults/ExampleEffects',
    '3d/effects/SimpleParticles',
    'ui/particle/ParticleText',
    'PipelineAPI',
        'PipelineObject'
    ],
    function(
        evt,
        ExampleEffects,
        SimpleParticles,
        ParticleText,
        PipelineAPI,
        PipelineObject
    ) {

        
        var Vector3 = THREE.Vector3;
        
        var particleData =	{
            pos:new Vector3(0, 0, 0),
            vel:new Vector3(0, 0, 0)
        };




        var particleConfigs = {};
        var effectConfigs = {};
        var cheapParticleConfigs = {};
        
        function ParticlePlayer(goo) {

            var _this = this;

            function playParticle(e) {
                _this.playParticleEffect(evt.args(e));
            }
            
            function playGameEffect(e) {
                _this.playGameEffect(evt.args(e));
            }

            var allRdy = false;
            var sysRdy = false;
            var confRdy = false;
            var cheapRdy = false;
            var fxRdy = false;

            function checkReady() {
                if (allRdy) return;

                if (sysRdy && confRdy && cheapRdy && fxRdy) {
                    console.log("particles ready", sysRdy, confRdy, cheapRdy, fxRdy);
                    particlesReady();
                    allRdy = true;
                }
            }

            function cheapParticlesReady(count) {
         //       console.log("Cheap Ready", count);
                cheapRdy = true;
                checkReady()
            }

            function systemsReady() {
                sysRdy = true;
                checkReady()
            }

            this.simpleParticles = new SimpleParticles(goo);
            this.particleText = new ParticleText(this.simpleParticles);
            this.simpleParticles.createSystems(systemsReady);
            var simpleParticles = this.simpleParticles;


            function particlesReady() {
                evt.fire(evt.list().PARTICLES_READY, {});
                evt.on(evt.list().GAME_EFFECT, playGameEffect);
            }
            

            function applyParticleConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    particleConfigs[data[i].id] = data[i].effect_data;  
                }
                confRdy = true;
                checkReady()
            }
            
            new PipelineObject('effects', 'particles', applyParticleConfigs);

            function applyGameplayEffectConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    effectConfigs[data[i].id] = data[i].effect_data;
                }
                fxRdy = true;
                checkReady()
            }

            new PipelineObject('effects', 'gameplay', applyGameplayEffectConfigs);


            function applyCheapParticleConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    cheapParticleConfigs[data[i].id] = data[i].effect_data;
                }
                simpleParticles.applyCheapParticleConfigs(cheapParticleConfigs, cheapParticlesReady);
            }

            new PipelineObject('effects', 'cheap_particles', applyCheapParticleConfigs);
            
        }

        ParticlePlayer.prototype.getCheapEffectData = function(key) {
            return cheapParticleConfigs[key];
        };

        ParticlePlayer.prototype.getEffectData = function(key, idx) {
            return effectConfigs[key][idx];
        };

        ParticlePlayer.prototype.getParticleData = function(key) {
            return particleConfigs[key];
        };

        ParticlePlayer.prototype.playParticleEffect = function(args) {
            console.log("Use Play particle...");

            particleData.pos.x = args.pos.data[0];
            particleData.pos.y = args.pos.data[1];
            particleData.pos.z = args.pos.data[2];
            particleData.vel.x = args.vel.data[0];
            particleData.vel.y = args.vel.data[1];
            particleData.vel.z = args.vel.data[2];

            this.simpleParticles.spawn(args.simulator, particleData.pos, particleData.vel, this.getParticleData(args.effect), args.callbacks, args.density);
            
        };

        ParticlePlayer.prototype.setupParticleData = function(idx, effect, params) {

            if (params) {
                for (var key in params) {
                    this.getParticleData(this.getEffectData(effect, idx).effect)[key] = params[key];
                }
            }

            return this.getParticleData(this.getEffectData(effect, idx).effect);
        };


        var calledParams = {};

        ParticlePlayer.prototype.playGameEffect = function(args) {

            /*
            for (var key in args.params) {
                calledParams[key] = args.params[key]
            }

            if (Math.random() < 0.01) console.log("Called params: ", calledParams);
*/

            particleData.pos.x = args.pos.data[0];
            particleData.pos.y = args.pos.data[1];
            particleData.pos.z = args.pos.data[2];
            particleData.vel.x = args.vel.data[0];
            particleData.vel.y = args.vel.data[1];
            particleData.vel.z = args.vel.data[2];

            for (var i = 0; i < effectConfigs[args.effect].length; i++) {

                if (effectConfigs[args.effect][i].simulator == "CheapParticles") {
                    this.simpleParticles.spawnCheap(
                        effectConfigs[args.effect][i].effect,
                        particleData.pos,
                        particleData.vel,
                        args.params);
                } else {
                    this.simpleParticles.spawn(
                        this.getEffectData(args.effect, i).simulator,
                        particleData.pos,
                        particleData.vel,
                        this.setupParticleData(i, args.effect, args.params),
                        args.callbacks
                    );
                }
            }
        };


        ParticlePlayer.prototype.spawnGameEffects = function(effectData, particleData, customEffectData, callbacks, density) {
            this.simpleParticles.spawn(effectData.simulator, particleData.pos, particleData.vel, customEffectData, callbacks, density);
        };


        ParticlePlayer.prototype.update = function(tpf) {
            this.simpleParticles.update(tpf);
        };

        return ParticlePlayer;
    });