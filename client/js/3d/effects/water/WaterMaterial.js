"use strict";

define([
        'PipelineObject',
    'Events'
    ],
    function(
        PipelineObject,
        evt
    ) {

        var ThreeAPI;

        var txUrl = "./client/assets/images/textures/tiles/";
        var materialList = {};

        var uniforms = {};

        var systemTime = {value:0};

        var samplingUniforms = false;

        var applyUniformEnvironmentColor = function(uniform, worldProperty) {
            var color = ThreeAPI.readEnvironmentUniform(worldProperty, 'color');
            uniform.value.r = color.r;
            uniform.value.g = color.g;
            uniform.value.b = color.b;
        };

        var applyUniformEnvironmentRotation = function(uniform, worldProperty) {
            var rot = ThreeAPI.readEnvironmentUniform(worldProperty, 'rotation');
            uniform.value.x = rot.x;
            uniform.value.y = rot.y;
            uniform.value.z = rot.z;
        };


        var sampleEnvUniforms = function() {

            systemTime.value += 0.016;

            for (var key in materialList) {
                materialList[key].uniforms.systemTime.value = systemTime.value;
                applyUniformEnvironmentColor(materialList[key].uniforms.ambientLightColor, 'ambient');
                applyUniformEnvironmentColor(materialList[key].uniforms.sunLightColor, 'sun');
                applyUniformEnvironmentRotation(materialList[key].uniforms.sunLightDirection, 'sun');
            }

        };


        var WaterMaterial = function(tApi) {

            ThreeAPI = tApi;

        };

        WaterMaterial.prototype.addWaterMaterial = function(id, textures, shader) {

            uniforms[id] = {};


            loadShader(id, shader);
            this.setupMaterial(id);

            updateUniforms(id, THREE.UniformsLib['common']);
            updateUniforms(id, THREE.UniformsLib['fog']);



            var global_uniforms = {
                systemTime:systemTime,
                ambientLightColor: { value: {r:1, g:1, b:1}},
                sunLightColor: { value: {r:1, g:1, b:1}},
                sunLightDirection: { value: {x:0.7, y:-0.3, z:0.7}}
            };

            updateUniforms(id, global_uniforms);

            this.attachTextures(id, textures);

        };

        WaterMaterial.prototype.setupMaterial = function(id) {

            materialList[id] = new THREE.RawShaderMaterial({
                uniforms:uniforms[id],
                side: THREE.DoubleSide,
                depthTest: true,
                depthWrite: true,
                blending: THREE.NoBlending,
                transparent: false,
                fog: true,
                lights: false
            });
        };

        var loadShader = function(id, shader) {

            var applyShaders = function(src, data) {
                materialList[id].vertexShader = data.vertex;
                materialList[id].fragmentShader = data.fragment;
                materialList[id].needsUpdate = true;
            };

            new PipelineObject("SHADERS", shader, applyShaders);
        };

        var updateUniforms = function(id, newuniforms) {

            for (var key in newuniforms) {

                if (materialList[id].uniforms[key]) {
                    materialList[id].uniforms[key].value = newuniforms[key].value
                } else {
                    materialList[id].uniforms[key] = {};
                    materialList[id].uniforms[key].value = newuniforms[key].value
                }
            }

            materialList[id].needsUpdate = true;
        };

        var addTexture = function(id, txConf) {

            var trId = id;
            var texConf = txConf;

            uniforms[trId][texConf.uniform] = {};
            uniforms[trId][texConf.uniform+'repeat'] = {};

            var applyTexture = function(src, data) {
                data.repeat.x = texConf.repeat[0];
                data.repeat.y = texConf.repeat[1];
                uniforms[trId][texConf.uniform].value = data;
                uniforms[trId][texConf.uniform].type = 't';
                
                uniforms[trId][texConf.uniform+'repeat'].value = {x:texConf.repeat[0],y:texConf.repeat[1]};

                updateUniforms(trId, uniforms[trId]);

                data.needsUpdate = true;
            };

            new PipelineObject("THREE_TEXTURE", "ocean_"+txConf.file+"_"+txUrl+txConf.file+".png", applyTexture);
        };

        WaterMaterial.prototype.attachTextures = function(id, textures) {
            for (var i = 0; i < textures.length; i++) {
                addTexture(id, textures[i])
            }
        };

        WaterMaterial.prototype.getMaterialById = function(id) {

            if (!samplingUniforms) {
                evt.on(evt.list().CLIENT_TICK, sampleEnvUniforms);
                samplingUniforms = true;
            }

            return materialList[id];
        };

        return WaterMaterial;

    });