"use strict";

define([
        'PipelineAPI',
        '../../PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var textureImages = {};
        var textures = {};

        var ThreeTextureMaker = function() {

        };

        var createBufferTexture = function(url, txType) {


            var bufferUpdated = function(src, data) {

                    var onLoad = function(tx) {
                        if (txType == 'envMap' || txType == 'data_texture' || txType == 'particle_texture') {
                            tx.combine = THREE.AddOperation;
                            tx.generateMipmaps = false;
                            tx.magFilter = THREE.LinearFilter;
                            tx.minFilter = THREE.LinearFilter;
                            //            console.log("Set as Reflection", src, tx);
                        } else {
                            tx.wrapS = THREE.RepeatWrapping;
                            tx.wrapT = THREE.RepeatWrapping;
                        }
                        textures[txType][src] = tx;
                        //        console.log("Store THREE_TEXTURE:",txType+'_'+src)
                        PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', txType+'_'+src, tx);
                    };

                new THREE.TextureLoader().load(src, onLoad);

            };

            new PipelineObject('BUFFER_IMAGE', url, bufferUpdated)
        };


        var loadImage = function(textureStore) {


            var ok = function(src, data) {
                //    console.log("TextureCached", src, textureStore);
                textureStore.bufferData = data;
                if (!textures[textureStore.txType]) {

                    textures[textureStore.txType] = {};
                } else {
                    if (textures[textureStore.txType].src == src) {
                        console.log("Texture already loaded", textureStore, src, textures);
                        return;
                    }
                }

                //    setTimeout(function() {
                createBufferTexture(textureStore.url, textureStore.txType, src);
                //    },1200);
                PipelineAPI.setCategoryKeyValue('BUFFER_IMAGE', textureStore.url, data);
            };

            var fail = function(src, data) {
                console.log("Texture Failed", src, data);
            };


            PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)
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