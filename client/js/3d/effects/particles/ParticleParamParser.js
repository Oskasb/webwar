

"use strict";

define([],
    function() {

        function createCurveParam(curveId, amplitude, min, max) {
            return new MATH.CurveState(MATH.curves[curveId], amplitude+MATH.randomBetween(amplitude*min, amplitude*max));
        }

        function applyValue(pParams, param, value) {
            pParams[param] = {};
            pParams[param].value = MATH.randomBetween(value.min, value.max);
        }

        function spreadParamValue(value, min, max) {
            if (min === max) {
                return value + value*min;
            }
            return value + MATH.randomBetween(value*min, value*max);
        }

        function applyVec2(pParams, param, vec) {
            if (!pParams[param]) {
                pParams[param] = new THREE.Vector2();
            }
            var min = vec.spread.min;
            var max = vec.spread.max;
            pParams[param].x = spreadParamValue(vec.x, min, max);
            pParams[param].y = spreadParamValue(vec.y, min, max);
        }

        function applyVec3(pParams, param, vec) {
            if (!pParams[param]) {
                pParams[param] = new THREE.Vector3();
            }
            var min = vec.spread.min;
            var max = vec.spread.max;
            pParams[param].x = spreadParamValue(vec.x, min, max);
            pParams[param].y = spreadParamValue(vec.y, min, max);
            pParams[param].z = spreadParamValue(vec.z, min, max);
        }

        function applyVec4(pParams, param, vec) {
            if (!pParams[param]) {
                pParams[param] = new THREE.Vector4();
            }
            var min = vec.spread.min;
            var max = vec.spread.max;
            pParams[param].x = spreadParamValue(vec.x, min, max);
            pParams[param].y = spreadParamValue(vec.y, min, max);
            pParams[param].z = spreadParamValue(vec.z, min, max);
            pParams[param].w = spreadParamValue(vec.w, min, max);
        }

        function applyQuat(pParams, param, quat) {
            if (!pParams[param]) {
                pParams[param] = new THREE.Quaternion();
            }
            pParams[param].x = quat.x;
            pParams[param].y = quat.y;
            pParams[param].z = quat.z;
            pParams[param].w = quat.w;
            pParams[param].normalize()
        }

        function applyCurve1D(pParams, params, curve) {
            pParams[params.param] = createCurveParam(curve,
                params.amplitude,
                params.spread.min,
                params.spread.max
            )
        }

        function applyCurveXD(pParams, params, curves) {
            pParams[params.param] = [];
            for (var i = 0; i < curves.length; i++) {
                pParams[params.param][i] = createCurveParam(curves[i],
                    params.amplitudes[i],
                    params.spread.min,
                    params.spread.max
                )
            }
        }


        var ParticleParamParser = function() {

        };


        ParticleParamParser.applyParamToParticle = function(particle, init_params) {
            if (init_params.value) {
                applyValue(particle.params, init_params.param, init_params.value);
            }

            if (init_params.vec2) {
                applyVec2(particle.params, init_params.param, init_params.vec2);
            }

            if (init_params.vec3) {
                applyVec3(particle.params, init_params.param, init_params.vec3);
            }

            if (init_params.vec4) {
                applyVec4(particle.params, init_params.param, init_params.vec4);
            }

            if (init_params.quat) {
                applyQuat(particle.params, init_params.param, init_params.quat);
            }

            if (init_params.curve1D) {
                applyCurve1D(particle.params, init_params, init_params.curve1D);
            }

            if (init_params.curve3D) {
                applyCurveXD(particle.params, init_params, init_params.curve3D);
            }

            if (init_params.curve4D) {
                applyCurveXD(particle.params, init_params, init_params.curve4D);
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