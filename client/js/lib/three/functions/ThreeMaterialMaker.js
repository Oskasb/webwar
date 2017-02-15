"use strict";

define([
        'PipelineAPI',
        'PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var materialList = {};
        var materials = {};
        
        
        var ThreeMaterialMaker = function() {

        };
        



        
        ThreeMaterialMaker.loadMaterialist = function() {
            
            var textureListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){


                    var createMaterial = function(id, data) {

                        var txCount = 0;


                        var addTexture = function(textureSettings, key, imageUrl, textureReady) {
                            var applyBufferTexture = function(src, data) {
                                console.log("Add Texture To Material List", src, data);
                                textureSettings[key] = data;
                                textureReady();
                            };

                            new PipelineObject("THREE_TEXTURE", imageUrl, applyBufferTexture)
                        };


                        var textureReady = function() {
                            txCount--;

                            if (txCount == 0) {
                                materials[id] = new THREE[data.shader](textureSettings);
                                PipelineAPI.setCategoryKeyValue('THREE_MATERIAL', id, materials[id]);
                            }
                            console.log("Adding more textures...", txCount, id, data);
                        };

                        var textureSettings = {};

                        for (var key in data.settings) {
                            textureSettings[key] = data.settings[key];
                        };

                    //    console.log("Texture Settings":)

                        for (var i = 0; i < data.textures.length; i++) {
                            for (var key in data.textures[i]) {
                                txCount++
                                addTexture(textureSettings, key, data.textures[i][key], textureReady)
                            }
                        }
                    };


                    materialList[data[i].id] = data[i];
                    createMaterial(data[i].id, data[i]);
                }
                console.log("Material List", data, materialList);
            };

            new PipelineObject("MATERIALS", "THREE", textureListLoaded);

        };


        ThreeMaterialMaker.createCanvasHudMaterial = function(texture) {
            var mat = new THREE.MeshBasicMaterial({ map: texture});
            mat.transparent = true;
            mat.blending = THREE["AdditiveBlending"];
            return mat;
        };

        ThreeMaterialMaker.createCanvasMaterial = function(texture) {
            var mat = new THREE.MeshBasicMaterial({ map: texture, blending:"AdditiveBlending"});
            return mat;
        };
        
        ThreeMaterialMaker.loadThreeModel = function(sx, sy, sz) {
            

        };


        return ThreeMaterialMaker;
    });