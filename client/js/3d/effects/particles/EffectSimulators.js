

"use strict";

define([],
    function() {

        var calcVec = new THREE.Vector3();

        var simProcs = {
            age:"age",
            lifeTime:"lifeTime",
            systemTime:"systemTime",
            lifeTime:"lifeTime",
            duration:"duration",

            attrib1D:"attrib1D",
            attrib2D:"attrib2D",
            attrib3D:"attrib3D",
            attrib4D:"attrib4D"
        }


        function addVectorsTpf(source, target, tpf) {
            calcVec.x = source.x;
            calcVec.y = source.y;
            calcVec.z = source.z;
            calcVec.multiplyScalar(tpf);
            target.addVectors(target, calcVec);
        };

        function applyCurve4DFractionToVec4(source, target, fraction) {
            target.x = source[0].amplitudeFromFraction(fraction);
            target.y = source[1].amplitudeFromFraction(fraction);
            target.z = source[2].amplitudeFromFraction(fraction);
            target.w = source[3].amplitudeFromFraction(fraction);
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

        EffectSimulators.simulators = {

            age:            {process:"age",           source:"age"              ,target:"age"          },
            lifeTime:       {process:"lifeTime",      source:"age"              ,target:"lifeTime"     },
            startTime:      {process:"attrib1D",      source:"systemTime"       ,target:"startTime"    },
            duration:       {process:"attrib1D",      source:"lifeTime"         ,target:"duration"     },
            tiles:          {process:"attrib2D",      source:"tiles"            ,target:"tileindex"    },
            position:       {process:"attrib4D",      source:"position"         ,target:"offsetSize"   },
            texelRowSelect: {process:"attrib4D",      source:"texelRowSelect"   ,target:"texelRowSelect"},
            diffusors:      {process:"attrib4D",      source:"diffusors"        ,target:"diffusors"    },
            acceleration:   {process:"attrib4D",      source:"acceleration"     ,target:"acceleration" },
            velocity:       {process:"attrib4D",      source:"velocity"         ,target:"velocity"     }

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

            if (particle.params.size) {
                particle.setAttribute1D('size', 0)
            } else if (particle.params.position.w) {
                particle.setAttribute4D('offsetSize', 0, 0, 0, 0)
            } else {
                console.log("Unknown death model for particle")
            }
        };

        EffectSimulators.valueToQuat = function(particle, tpf, source, target) {
            particle.params[target].x -= particle.params[source].value*tpf*4;
            particle.params[target].y += Math.sin(particle.params[source].value*tpf);
            particle.params[target].z = Math.sin(particle.params[source].value*tpf*5);
            particle.params[target].normalize();
        };
        
        EffectSimulators.vec3toCurve3D = function(particle, tpf, source, target) {
            
        };

        EffectSimulators.curve3DtoVec3 = function(particle, tpf, source, target) {
            applyCurve3DFractionToVec3(particle.params[source], particle.params[target], particle.progress)
        };

        EffectSimulators.curve4DtoVec4 = function(particle, tpf, source, target) {
            applyCurve4DFractionToVec4(particle.params[source], particle.params[target], particle.progress)
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