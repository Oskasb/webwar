

"use strict";

define([],
    function() {

        var calcVec = new THREE.Vector3();

        var ParticleParamParser = function() {

        };

        function createCurveParam(curveId, amplitude, min, max) {
            return new MATH.CurveState(MATH.curves[curveId], amplitude+MATH.randomBetween(amplitude*min, amplitude*max));
        }

        ParticleParamParser.applyParamToParticle = function(particle, init_params) {
            if (init_params.value) {
                particle.params[init_params.param] = {};
                particle.params[init_params.param].value = MATH.randomBetween(init_params.value.min, init_params.value.max);
            }
            if (init_params.vec2) {
                if (!particle.params[init_params.param]) {
                    particle.params[init_params.param] = new THREE.Vector2();
                }
                particle.params[init_params.param].x = init_params.vec2.x;
                particle.params[init_params.param].y = init_params.vec2.y;
            }

            if (init_params.vec3) {
                if (!particle.params[init_params.param]) {
                    particle.params[init_params.param] = new THREE.Vector3();
                } else {
                    particle.params[init_params.param].x = 0;
                    particle.params[init_params.param].y = 0;
                    particle.params[init_params.param].z = 0;
                }
                particle.params[init_params.param].x = init_params.vec3.x + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
                particle.params[init_params.param].y = init_params.vec3.y + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
                particle.params[init_params.param].z = init_params.vec3.z + MATH.randomBetween(init_params.vec3.spread.min, init_params.vec3.spread.max);
            //    particle.params[init_params.param].addVectors(particle.params[init_params.param], calcVec);
            }

            if (init_params.quat) {
                if (!particle.params[init_params.param]) {
                    particle.params[init_params.param] = new THREE.Quaternion();
                }
                particle.params[init_params.param].x =MATH.randomBetween(init_params.quat.spread.min, init_params.quat.spread.max);
                particle.params[init_params.param].y =MATH.randomBetween(init_params.quat.spread.min, init_params.quat.spread.max);
                particle.params[init_params.param].z =MATH.randomBetween(init_params.quat.spread.min, init_params.quat.spread.max);
                particle.params[init_params.param].w =MATH.randomBetween(init_params.quat.spread.min, init_params.quat.spread.max);
                particle.params[init_params.param].normalize();
            }

            if (init_params.curve3D) {
                particle.params[init_params.param] = [];

                for (var i = 0; i < init_params.curve3D.length; i++) {
                    particle.params[init_params.param][i] = createCurveParam(
                        init_params.curve3D[i],
                        init_params.amplitudes[i],
                        init_params.spread.min,
                        init_params.spread.max
                    )
                }
            }

            if (init_params.curve1D) {
                particle.params[init_params.param] = createCurveParam(init_params.curve1D,
                    init_params.amplitude,
                    init_params.spread.min,
                    init_params.spread.max)
            }

        };


        ParticleParamParser.applyEffectParams = function(particle, effectParams) {
            for (var i = 0;i < effectParams.length; i++) {
                ParticleParamParser.applyParamToParticle(particle, effectParams[i])
            }
        };

        ParticleParamParser.applyEffectSprite = function(particle, sprite) {

            if (!particle.params.tiles) {
                console.log("No tiles param for sprite", particle, sprite)
            }

            var idx = Math.floor(Math.random()*sprite.tiles.length);
            particle.params.tiles.x = sprite.tiles[idx][0];
            particle.params.tiles.y = sprite.tiles[idx][1];
        };

        
        return ParticleParamParser;
    });