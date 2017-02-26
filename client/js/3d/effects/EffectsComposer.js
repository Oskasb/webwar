"use strict";

define([
    'ThreeAPI'
],
    function(
        ThreeAPI,
        ShaderBuilder
    ) {


        var emitters = {};
        var groups = [];

        var EffectsComposer = function() {

        };




        EffectsComposer.attachEmitterCount = function(group, count) {

            var emitter = EffectsComposer.buildEmitter();
            group.addPool( count, emitter, true);

            ThreeAPI.addToScene(group.mesh);
            groups.push(group);
        };


        EffectsComposer.buildEmitter = function(group, count) {

            var emitterOptions = {
                type: SPE.distributions.SPHERE,
                position: {
                    spread: new THREE.Vector3(2),
                    radius: 1
                },
                velocity: {
                    value: new THREE.Vector3( 2 )
                },
                size: {
                    value: [ 3, 30 ]
                },
                opacity: {
                    value: [1, 1]
                },
                color: {
                    value: [new THREE.Color('yellow'), new THREE.Color('red')]
                },
                particleCount: 25,
                alive: true,
                duration: 0.3,
                maxAge: {
                    value: 0.2
                }
            };

            return emitterOptions;
        };


        EffectsComposer.buildEmitterGroup = function(group, count) {

            var group = new SPE.Group( {
                // Possible API for animated textures...
                texture: {
                    value: THREE.TextureLoader( './client/assets/images/effects/particle_atlas.png' ),
                    frames: new THREE.Vector2( 12, 12 ),
                    frameCount: 1,
                    loop: 0
                },

                maxParticleCount:550,
                depthTest: false,
                scale: window.innerHeight / 2.0
            } );

            return group;
        };


        EffectsComposer.initEffects = function() {
                        
            var group = EffectsComposer.buildEmitterGroup();
            EffectsComposer.attachEmitterCount(group, 100);

        };

        EffectsComposer.fetchEmitter = function(effectData) {
            return groups[0];
        };


        EffectsComposer.tickGroups = function(tpf) {

            for (var i = 0; i < groups.length; i++) {
                groups[i].tick(tpf);
            }

        };

        return EffectsComposer;

    });