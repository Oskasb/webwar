"use strict";

define([
        'PipelineAPI',
        'PipelineObject'],
    function(
        PipelineAPI,
        PipelineObject
    ) {

        var textureImages = {};

        var textures = {};

        var ThreeTextureMaker = function() {

        };






        ThreeTextureMaker.loadTextures = function() {

            var textureListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){

                    for (var j = 0; j < data[i].textures.length; j++) {
                        for (var key in data[i].textures[j]) {
                            var textureStore = {url:data[i].textures[j][key], bufferData:null};
                            textureImages[data[i].textures[j][key]] = textureStore;


                            var loadImage = function(textureStore) {


                                var createBufferTexture = function(url) {

                                    var bufferUpdated = function(src, data) {
                                        console.log("Buffer Update", src, data);

                                        var loader = new THREE.TextureLoader();
                                        loader.load(src, function ( texture ) {

                                            texture.wrapS = THREE.RepeatWrapping;
                                            texture.wrapT = THREE.RepeatWrapping;

                                            textures[src] = texture;
                                            PipelineAPI.setCategoryKeyValue('THREE_TEXTURE', src, textures[src]);
                                        });
                                    };

                                    new PipelineObject('BUFFER_IMAGE', url, bufferUpdated)
                                };


                                var ok = function(src, data) {
                                    console.log("TextureCached", src, textureStore);
                                    textureStore.bufferData = data;
                                    //    setTimeout(function() {
                                    createBufferTexture(src);
                                    //    },1200);


                                    PipelineAPI.setCategoryKeyValue('BUFFER_IMAGE', textureStore.url, data);
                                };

                                var fail = function(src, data) {
                                    console.log("Texture Failed", src, data);
                                };


                                PipelineAPI.cacheImageFromUrl(textureStore.url, ok, fail)
                            };



                            loadImage(textureStore);
                        }
                    }
                }
                console.log("Texture List", textureImages);
            };

            new PipelineObject("MATERIALS", "THREE", textureListLoaded);
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