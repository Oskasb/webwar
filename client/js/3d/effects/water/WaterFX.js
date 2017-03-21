"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {

        var effectFXAA;
        var bloomPass;
        var composer;
        var renderScene;

        var container, stats;
        var camera, scene, renderer;
        var sphere;
        var parameters = {
            width: 2000,
            height: 2000,
            widthSegments: 250,
            heightSegments: 250,
            depth: 1500,
            param: 4,
            filterparam: 1
        };
        var waterNormals;
        var water = {};

        var WaterFX = function() {

        };

        WaterFX.prototype.initWaterEffect = function() {
            
            waterNormals = new THREE.TextureLoader().load( './client/assets/images/effects/watertile.png' );
            waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

            var material = new THREE.MeshStandardMaterial( { map:waterNormals, color: 0xffffff, wireframe: false, fog:false } );

            var mirrorMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( parameters.width * 50000, parameters.height * 50000, 100, 100 ),
                material
            );



        //    mirrorMesh.add( water );
            mirrorMesh.rotation.x = -Math.PI * 0.5;
            ThreeAPI.addToScene( mirrorMesh );

        };

        return WaterFX;

    });