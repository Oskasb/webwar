"use strict";

define([
        'ThreeAPI',
        '3d/effects/water/WaterMaterial',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        WaterMaterial,
        PipelineObject
    ) {

        var waterList = {};
        var terrainIndex = {};
        var terrainMaterial;

        var oceanId = 'main_ocean';

        var calcVec = new THREE.Vector3();

        var parameters = {
            width: 10000,
            height: 10000,
            widthSegments: 32,
            heightSegments: 32,
            depth: 1500,
            param: 4,
            filterparam: 1
        };
        var waterNormals;
        var water = {};

        var waterMaterial;

        var WaterFX = function() {
            waterMaterial = new WaterMaterial(ThreeAPI);

            
            this.loadData();
        };


        WaterFX.prototype.loadData = function() {


            var oceansLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){
                    waterList[data[i].id] = data[i];
                    waterMaterial.addWaterMaterial(data[i].id, data[i].textures, data[i].shader);
                }
            };
            new PipelineObject("OCEANS", "THREE", oceansLoaded);
        };

        WaterFX.prototype.initWaterEffect = function() {
            
            var material = waterMaterial.getMaterialById(oceanId);

            var waterMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( parameters.width, parameters.height, 64, 64 ),
                material
            );

            waterMesh.rotation.x = -Math.PI * 0.5;
            ThreeAPI.addToScene( waterMesh );

        };

        return WaterFX;

    });