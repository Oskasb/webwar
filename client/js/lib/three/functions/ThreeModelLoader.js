"use strict";

define([],
    function(

    ) {
        
        var ThreeModelLoader = function() {

        };

        ThreeModelLoader.createObject3D = function() {
                       
            return new THREE.Object3D();
        };

        ThreeModelLoader.loadThreeModel = function(sx, sy, sz) {

            var geometry, material;

            geometry = new THREE.BoxGeometry( sx || 1, sy || 1, sz || 1);
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );


            return new THREE.Mesh( geometry, material );

        };


        return ThreeModelLoader;
    });