"use strict";

define([],
    function(

    ) {
        
        var ThreeModelLoader = function() {

        };

        ThreeModelLoader.loadThreeModel = function(data) {

            var geometry, material;
            
            geometry = new THREE.BoxGeometry( 2, 2, 2 );
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            
            return new THREE.Mesh( geometry, material );
            
        };
        

        return ThreeModelLoader;
    });