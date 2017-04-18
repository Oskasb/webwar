"use strict";

define([
        'PipelineAPI',
        '../../PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var textureImages = {};
        var images = {};
        var textures = {};

        var meta = {
            textures:{},
            images:{}
        };

        var contentUrl = function(url) {
            return 'content'+url.slice(1);
        };

        var saveJsonUrl = function(json, url) {
            var shiftUrl = url.slice(1);
            PipelineAPI.saveJsonFileOnServer(json, shiftUrl)
        };

        var ThreeTextureMaker = function() {

        };

        var createBufferTexture = function(url, txType) {

            textures[txType][url] = true;

            var registerTexture = function(tx) {

                if (typeof(textures[txType][url]) == 'Texture') {

                    textures[txType][url].image = tx.image;
                    textures[txType][url].needsUpdate = true;

                } else {
                    if (txType == 'envMap' || txType == 'data_texture' || txType == 'particle_texture') {
                        tx.combine = THREE.AddOperation;
                        tx.generateMipmaps = false;
                        tx.magFilter = THREE.LinearFilter;
                        tx.minFilter = THREE.LinearFilter;

                        if (txType == 'envMap') {
                            tx.mapping = THREE.SphericalReflectionMapping;
                        }

                    } else {
                        tx.wrapS = THREE.RepeatWrapping;
                        tx.wrapT = THREE.RepeatWrapping;
                    }

                    textures[txType][url] = tx;
                    PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', txType+'_'+url, tx);
                }

            };

            var jsonImageLoaded = function(src, data) {
                new THREE.TextureLoader().load(data.url, registerTexture);
            };

            var originalImageUpdated = function(src, data) {

            //    console.log("Buffer Data Updated:  ", url, txType, src, [data]);
                var onLoad = function(tx) {
                    if (PipelineAPI.readCachedConfigKey('STATUS', "PIPELINE")) {
                        var imgId = tx.toJSON(meta).image;
                        delete meta.images[imgId].uuid;
                        var json = JSON.stringify(meta.images[imgId]);
                        //      var json = meta.images[imgId].url;
            //            console.log("JSON Image:", imgId, [json]);
                        saveJsonUrl(json, url);
                    }
                };

                new THREE.TextureLoader().load(url, onLoad);
            };

            if (PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled) {
                new PipelineObject('BUFFER_IMAGE', url, originalImageUpdated)
            }

            new PipelineObject('JSON_IMAGE', url, jsonImageLoaded)
        };

        var createTexture = function(textureStore) {

            if (!textures[textureStore.txType]) {
                textures[textureStore.txType] = {};
            } else {

                if (textures[textureStore.txType][textureStore.url]) {
            //        console.log("Tx url already loaded...", [textureStore.txType], [textureStore.url]);
                    return;
                }

                if (textures[textureStore.txType].src == textureStore.url) {
            //        console.log("Texture already loaded", textureStore, textureStore.url, textures);
                    return;
                }
            }

            createBufferTexture(textureStore.url, textureStore.txType);
        };

        var loadImage = function(textureStore) {

            var jsonImage = function(src, json) {
                PipelineAPI.setCategoryKeyValue('JSON_IMAGE', textureStore.url, json);
            };

            var ok = function(src, data) {
                images[textureStore.url] = data;
        //        console.log("TextureCached", src, textureStore);
                textureStore.bufferData = data;
                PipelineAPI.setCategoryKeyValue('BUFFER_IMAGE', textureStore.url, data);
            };

            var fail = function(src, data) {
                console.log("Texture Failed", src, data);
            };

            if (!images[textureStore.url]) {
                images[textureStore.url] = {};

                if (PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled) {
            //        console.log("PipelineState:",PipelineAPI.readCachedConfigKey('STATUS', 'PIPELINE'))
                    PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)
                } else {
                    console.log("Load TX Production Mode")
                }
                PipelineAPI.subscribeToConfigUrl(contentUrl(textureStore.url), jsonImage, fail);
            }

            createTexture(textureStore);
        };



        ThreeTextureMaker.loadTextures = function() {

            var textureListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){

                    for (var j = 0; j < data[i].textures.length; j++) {
                        for (var key in data[i].textures[j]) {
                            var textureStore = {txType:key, url:data[i].textures[j][key], bufferData:null};
                            textureImages[data[i].textures[j][key]] = textureStore;

                            loadImage(textureStore);
                        }
                    }
                }
                //    console.log("Texture List", textureImages);
            };

            var loadParticleTexture = function(src, data) {

                for (var i = 0; i < data.length; i++){
                    var textureStore = {txType:'particle_texture',url:data[i].particle_texture, bufferData:null};
                    textureImages[data[i].particle_texture] = textureStore;
                    loadImage(textureStore);
                }


            };

            new PipelineObject("MATERIALS", "THREE", textureListLoaded);
            new PipelineObject("PARTICLE_MATERIALS", "THREE", loadParticleTexture);
        };


        ThreeTextureMaker.createImageTexture = function(srcUrl) {



            var texture = new THREE.Texture(canvas);

            return texture;
        };

        ThreeTextureMaker.createCanvasTexture = function(canvas) {

            var texture = new THREE.Texture(canvas);

            return texture;
        };




        return ThreeTextureMaker;
    });