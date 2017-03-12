"use strict";

define([
        'PipelineObject'
    ],
    function(
        PipelineObject
    ) {


        var txUrl ="./client/assets/images/textures/tiles/";
        var materialList = {};

        var uniforms = {};

        var uniforms = THREE.UniformsUtils.merge( [
            THREE.UniformsLib.common,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.lights
        ] );


        var TerrainMaterial = function() {

        };

        TerrainMaterial.prototype.addTerrainMaterial = function(id, textures, shader) {

            uniforms[id] = {};
            
            loadShader(id, shader);
            this.setupMaterial(id);

            updateUniforms(id, THREE.UniformsLib['fog']);
            
            this.attachTextures(id, textures);

        };

        TerrainMaterial.prototype.setupMaterial = function(id) {

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

            var applyTexture = function(src, data) {
                data.repeat.x = texConf.repeat[0];
                data.repeat.y = texConf.repeat[1];
                uniforms[trId][texConf.uniform].value = data;
                uniforms[trId][texConf.uniform].type = 't';

                updateUniforms(trId, uniforms[trId]);

                data.needsUpdate = true;
            };

            new PipelineObject("THREE_TEXTURE", "terrain_"+txConf.file+"_"+txUrl+txConf.file+".png", applyTexture);
        };

        TerrainMaterial.prototype.attachTextures = function(id, textures) {
            for (var i = 0; i < textures.length; i++) {
                addTexture(id, textures[i])
            }
        };

        TerrainMaterial.prototype.getMaterialById = function(id) {
            return materialList[id];
        };

        return TerrainMaterial;

    });