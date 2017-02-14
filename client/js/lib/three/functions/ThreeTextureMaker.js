"use strict";

define([],
    function(

    ) {

        var ThreeTextureMaker = function() {

        };

        ThreeTextureMaker.createCanvasTexture = function(canvas) {

            var texture = new THREE.Texture(canvas);
            
            return texture;
        };

        ThreeTextureMaker.loadThreeModel = function(sx, sy, sz) {
            
        };


        return ThreeTextureMaker;
    });