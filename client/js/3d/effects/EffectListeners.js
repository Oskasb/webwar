"use strict";

define([
        'EffectsAPI',
        'Events'

    ],
    function(
        EffectsAPI,
        evt
    ) {
        
        var posVec;
        var velVec;

        var EffectsListeners = function() {
            
        };

        var setupEffect = function(args) {
        //    console.log("Setup FX:", args);
            posVec.x = args.pos.data[0];
            posVec.y = args.pos.data[1];
            posVec.z = args.pos.data[2];
            velVec.x = args.vel.data[0];
            velVec.y = args.vel.data[1];
            velVec.z = args.vel.data[2];
        };

        EffectsListeners.setupListeners = function() {

            posVec = new THREE.Vector3();
            velVec = new THREE.Vector3();

            var playGameEffect = function(e) {
                setupEffect(evt.args(e));

                EffectsAPI.requestParticleEffect('', posVec, velVec);
            };
            
            var tickEffectPlayer = function(e) {
                EffectsAPI.tickEffectSimulation(evt.args(e).tpf);
            };
            
            evt.on(evt.list().GAME_EFFECT, playGameEffect);
            evt.on(evt.list().CLIENT_TICK, tickEffectPlayer);
        };

        
 
        return EffectsListeners;

    });