

"use strict";

define([],
    function() {

        var calcVec = new THREE.Vector3();

        function addVectorsTpf(source, target, tpf) {
            calcVec.x = source.x;
            calcVec.y = source.y;
            calcVec.z = source.z;
            calcVec.multiplyScalar(tpf);
            target.addVectors(target, calcVec);
        };

        function applyCurve3DFractionToVec3(source, target, fraction) {
            target.x = source[0].amplitudeFromFraction(fraction);
            target.y = source[1].amplitudeFromFraction(fraction);
            target.z = source[2].amplitudeFromFraction(fraction);
        };

        function applyCurve1DFractionToValue(source, target, fraction) {
            target.value = source.amplitudeFromFraction(fraction);
        };

        var EffectSimulators = function() {

        };

        EffectSimulators.age = function(particle, tpf, source, target) {
            particle.params[target].value = particle.params[source].value + tpf;
        };

        EffectSimulators.lifeTime = function(particle, tpf, source, target) {
            particle.progress = MATH.calcFraction(0, particle.params[target].value, particle.params[source].value);
            if (particle.progress > 1) {
                particle.dead = true;
            }
        };

        EffectSimulators.tile = function(particle, tpf, source, target) {

        };

        EffectSimulators.gravity = function(particle, tpf, source, target) {

        };

        EffectSimulators.addVelocity = function(particle, tpf, source, target) {
            addVectorsTpf(particle.params[source], particle.params[target], tpf);
        };

        EffectSimulators.diffusion = function(particle, tpf, source, target) {

        };

        EffectSimulators.growth = function(particle, tpf, source, target) {

        };

        EffectSimulators.color = function(particle, tpf, source, target) {

        };

        EffectSimulators.dead = function(particle, tpf) {
        //    particle.setAttribute3D('position', 5, Math.random()*tpf*100, 5);
        };

        EffectSimulators.valueToQuat = function(particle, tpf, source, target) {
        //    particle.params[target].x -= particle.params[source]*tpf;
        //    particle.params[target].y += 0.001*Math.sin(particle.params[source]*tpf);
        //    particle.params[target].z = Math.sin(particle.params[source]*tpf);
            particle.params[target].normalize();
        };
        
        EffectSimulators.vec3toCurve3D = function(particle, tpf, source, target) {
            
        };

        EffectSimulators.curve3DtoVec3 = function(particle, tpf, source, target) {
            applyCurve3DFractionToVec3(particle.params[source], particle.params[target], particle.progress)
        };

        EffectSimulators.curve1DtoValue = function(particle, tpf, source, target) {
            applyCurve1DFractionToValue(particle.params[source], particle.params[target], particle.progress)
        };

        EffectSimulators.attrib4D = function(particle, tpf, source, target) {
            particle.setAttribute4D(target,
                particle.params[source].x,
                particle.params[source].y,
                particle.params[source].z,
                particle.params[source].w
            )
        };

        EffectSimulators.attrib3D = function(particle, tpf, source, target) {
            particle.setAttribute3D(target,
                particle.params[source].x,
                particle.params[source].y,
                particle.params[source].z)
        };

        EffectSimulators.attrib2D = function(particle, tpf, source, target) {
            particle.setAttribute3D(target,
                particle.params[source].x,
                particle.params[source].y)
        };

        EffectSimulators.attrib1D = function(particle, tpf, source, target) {
            particle.setAttribute1D(target, particle.params[source].value)
        };


        return EffectSimulators;

    });