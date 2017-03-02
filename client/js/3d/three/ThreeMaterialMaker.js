"use strict";

define([
        'PipelineAPI',
        '../../PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var materialList = {};
        var materials = {};
        var loadedTextures = {};
        var requestedTextures = {};

        var materialPipeline = {};

        var ThreeMaterialMaker = function() {

        };

        var textureReady = function(matId, txSettings) {

            var data = materialList[matId];


            if (materials[matId]) return;

            var loaded = 0;
            for (var key in data.textures[0]) {

                if (!loadedTextures[key+'_'+data.textures[0][key]]) {
        //            console.log("Not Yet loaded:", [matId, key+'_'+data.textures[0][key], materialPipeline,  loadedTextures, data]);
                    setTimeout(function() {
                        textureReady(matId, txSettings);
                    }, 500);
                    return;
                }

                if (!loadedTextures[key+'_'+data.textures[0][key]][matId]) {
                    console.log("Not Yet loaded:", [matId, key+'_'+data.textures[0][key], materialPipeline,  loadedTextures, data]);
                    setTimeout(function() {
                        textureReady(matId, txSettings);
                    }, 500);
                    return;
                }
                loaded++
            }


            for (var key in data.textures[0]) {
                txSettings[key] = loadedTextures[key+'_'+data.textures[0][key]][matId];
            }

            if (!data.shader) {
                // just loading the texture...
                return;
            }

            materials[matId] = new THREE[data.shader](txSettings);
            PipelineAPI.setCategoryKeyValue('THREE_MATERIAL', matId, materials[matId]);
        //    console.log("Loaded all...", matId, loaded, data.textures[0]);
        };


        var addTexture = function(id, textureSettings, key, imageUrl, textureReady) {

            var attachPipeline = function(matId, txSettings, txType, imgUrl, onReadyCB) {
                var includeTexture = function(src, data) {
                    var tx = data.clone();
        //            console.log("Apply THREE_TEXTURE", matId, txType+'_'+imgUrl ,src, [tx]);
                    tx.needsUpdate = true;
                    if (!loadedTextures[txType+'_'+imgUrl] ) {
                        loadedTextures[txType+'_'+imgUrl] = {};
                    }
                    loadedTextures[txType+'_'+imgUrl][id] = data;

                    onReadyCB(matId, txSettings);
                };

                materialPipeline[id][key+'_'+imageUrl] = new PipelineObject("THREE_TEXTURE", key+'_'+imageUrl, includeTexture)
            };

            attachPipeline(id, textureSettings, key, imageUrl, textureReady)
        };
        

        var createMaterial = function(id, data) {

            var textureSettings = {};

            for (var key in data.settings) {
                textureSettings[key] = data.settings[key];
            };

            materialPipeline[id] = {};

            for (var i = 0; i < data.textures.length; i++) {
                for (var key in data.textures[i]) {
                    if (!materialPipeline[id][key+'_'+data.textures[i][key]] ) {
                        addTexture(id, textureSettings, key, data.textures[i][key], textureReady)
                    }
                }
            }
        };



        ThreeMaterialMaker.loadMaterialist = function() {
            
            var textureListLoaded = function(scr, data) {
                materials = {};
                for (var i = 0; i < data.length; i++){
                    materialList[data[i].id] = data[i];
                    createMaterial(data[i].id, data[i]);
                }
            //    console.log("Material List", [data, materialList]);
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