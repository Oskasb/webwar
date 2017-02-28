

"use strict";

define([],
    function() {

        var EffectSimulators = function() {

        };

        EffectSimulators.age = function(particle, tpf) {
            particle.params.age += tpf;
        };

        EffectSimulators.lifeTime = function(particle, tpf) {

            if (particle.params.age > particle.params.lifeTime) {
                particle.dead = true;
            }

            particle.params.age += tpf;
        };

        EffectSimulators.tile = function(particle, tpf) {

        };

        EffectSimulators.gravity = function(particle, tpf) {

        };

        EffectSimulators.velocity = function(particle, tpf) {

        };

        EffectSimulators.diffusion = function(particle, tpf) {

        };

        EffectSimulators.growth = function(particle, tpf) {

        };

        EffectSimulators.color = function(particle, tpf) {

        };

        EffectSimulators.dead = function(particle, tpf) {
            particle.setAttribute3D('translate', 5, Math.random()*tpf*100, 5);
        };

        EffectSimulators.big_spin = function(particle, tpf) {
            var i = particle.particleIndex;

            var time = particle.params.age;

            particle.setAttribute3D('translate',
                100 * ( 1 + Math.sin( 0.1 * i + time )),
                100 * ( 1 + Math.cos( 0.1 * i + time )),
                20 * ( 1 + Math.cos( 0.1 * i + time*0.7 )));

            particle.setAttribute1D('size',  1 + Math.sin( 0.01 * i + time )*100 );

            particle.setAttribute3D('customColor',
                Math.cos(time*0.01 + i*0.2) * ( 0.5 + Math.sin(i + 0.01 * i + time*0.01 )),
                Math.sin(time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + time*0.01 )),
                Math.sin(time*0.01 + i*0.2) * ( 0.5 + Math.cos(i + 0.01 * i + time*0.022 ))
            );
        };

        return EffectSimulators;

    });