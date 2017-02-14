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

        ThreeModelLoader.loadThreeQuad = function(sx, sy) {

            var geometry, material;

            geometry = new THREE.PlaneGeometry( sx || 1, sy || 1, 1 ,1);
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            return new THREE.Mesh( geometry, material );
        };

        ThreeModelLoader.applyMaterialToMesh = function(material, model) {

            model.material = material;

        };


        return ThreeModelLoader;
    });