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

        var ThreeTextureMaker = function() {

        };

        var createBufferTexture = function(url, txType) {
            console.log("Create Buffer Texture:  ", url, txType);

            textures[txType][url] = {};

            var bufferUpdated = function(src, data) {

                console.log("Buffer Data Updated:  ", url, txType, src, [data]);

                    var onLoad = function(tx) {
                        if (txType == 'envMap' || txType == 'data_texture' || txType == 'particle_texture') {
                            tx.combine = THREE.AddOperation;
                            tx.generateMipmaps = false;
                            tx.magFilter = THREE.LinearFilter;
                            tx.minFilter = THREE.LinearFilter;
                            //            console.log("Set as Reflection", src, tx);

                            if (txType == 'envMap') {
                                tx.mapping = THREE.SphericalReflectionMapping;
                            }

                        } else {
                            tx.wrapS = THREE.RepeatWrapping;
                            tx.wrapT = THREE.RepeatWrapping;
                        }
                        textures[txType][src] = tx;
                    //    tx.flipY = false;
                    //    tx.flipY = false;
                        //        console.log("Store THREE_TEXTURE:",txType+'_'+src)

                        /*
                        if (PipelineAPI.readCachedConfigKey('STATUS', "PIPELINE")) {
                            var json = JSON.stringify(tx.toJSON(meta));
                            console.log("JSON TX:", txType, [json], meta);
                            PipelineAPI.saveJsonFileOnServer(json, src)
                        }
                        */
                        PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', txType+'_'+src, tx);

                    };

                new THREE.TextureLoader().load(src, onLoad);
            };

            new PipelineObject('BUFFER_IMAGE', url, bufferUpdated)
        };


        var createTexture = function(textureStore) {

            if (!textures[textureStore.txType]) {

                textures[textureStore.txType] = {};
            } else {

                if (textures[textureStore.txType][textureStore.url]) {
                    console.log("Tx url already loaded...", [textureStore.txType], [textureStore.url]);
                    return;
                }

                if (textures[textureStore.txType].src == textureStore.url) {
                    console.log("Texture already loaded", textureStore, textureStore.url, textures);
                    return;
                }
            }

            createBufferTexture(textureStore.url, textureStore.txType);
        };

        var loadImage = function(textureStore) {
            console.log("loadImage", textureStore.url);

            var ok = function(src, data) {
                images[textureStore.url] = data;
                console.log("TextureCached", src, textureStore);
                textureStore.bufferData = data;
                PipelineAPI.setCategoryKeyValue('BUFFER_IMAGE', textureStore.url, data);
            };

            var fail = function(src, data) {
                console.log("Texture Failed", src, data);
            };

            if (!images[textureStore.url]) {
                images[textureStore.url] = {};
                PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)
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