"use strict";

define([

    ],
    function(
    ) {

        var EffectPlayer = function() {

        };


        EffectPlayer.triggerEmitter = function(group, pos, vel) {

            group.triggerPoolEmitter(1, pos)
        //    emitter.position.value.copy(pos);
        //    emitter.velocity.value.copy(vel);
        //    emitter.enable();
         //   emitter.tick(0.2);
        //    emitter.disable();
            
        };


        EffectPlayer.requestParticleEffect = function() {

        };


        return EffectPlayer;

    });