"use strict";

define([],
    function(

    ) {

        var ThreeMaterialMaker = function() {

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