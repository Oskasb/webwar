"use strict";

define([
        'ThreeAPI',
        'PipelineAPI',
        '../../PipelineObject'],
    function(
        ThreeAPI,
        PipelineAPI,
        PipelineObject
    ) {

        var terrainList = {};

        var ThreeTerrain = function() {

        };


        ThreeTerrain.loadData = function() {

            var terrainListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){
                    terrainList[data[i].id] = data[i]
                }
            };
            new PipelineObject("TERRAINS", "THREE", terrainListLoaded);
        };

        var transformModel = function(trf, model) {
            model.position.x = trf.pos[0];
            model.position.y = trf.pos[1];
            model.position.z = trf.pos[2];
            model.rotation.x = trf.rot[0]*Math.PI;
            model.rotation.y = trf.rot[1]*Math.PI;
            model.rotation.z = trf.rot[2]*Math.PI;
            model.scale.x =    trf.scale[0];
            model.scale.y =    trf.scale[1];
            model.scale.z =    trf.scale[2];

        };

        var setMaterialRepeat = function(materialId, txMap, modelId) {

            var materials = terrainList[modelId].materials

            for (var i = 0; i < materials.length; i++) {

                if (materials[i].id === materialId) {
                    txMap.repeat.x = materials[i].repeat[0];
                    txMap.repeat.y = materials[i].repeat[1];
                }
            }
        };
        
        var createTerrain = function(callback, applies, array1d, material) {

            var opts = {
                after: null,
                easing: THREE.Terrain.EaseInOut,
                heightmap: THREE.Terrain.DiamondSquare,
                material: material,
                maxHeight: applies.max_height,
                minHeight: applies.min_height,
                optimization: THREE.Terrain.NONE,
                frequency: applies.frequency,
                steps: applies.steps,
                stretch: true,
                turbulent: false,
                useBufferGeometry: false,
                xSegments: applies.terrain_segments,
                xSize: applies.terrain_size,
                ySegments: applies.terrain_segments,
                ySize: applies.terrain_size
            };
            

            var terrain = new THREE.Terrain(opts);
        //    terrain;
            
            THREE.Terrain.fromArray1D(terrain.children[0].geometry.vertices, array1d);
            terrain.children[0].needsUpdate = true;
            terrain.children[0].position.x += applies.terrain_size*0.5;
            terrain.children[0].position.y -= applies.terrain_size*0.5;

            callback(terrain);
        };


        ThreeTerrain.loadTerrain = function(applies, array1d, rootObject, ThreeSetup, partsReady) {

            var setup = ThreeSetup;
            var modelId = applies.three_terrain;

            var attachMaterial = function(src, data) {


                var attachModel = function(model) {


                    setMaterialRepeat(src, model.children[0].material.map, modelId);

                    setup.addToScene(model);
                    rootObject.add(model);
                    transformModel(terrainList[modelId].transform, model);
                    partsReady();
                };


                //    model.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
                createTerrain(attachModel, applies, array1d, data);

            };

            var materials = terrainList[modelId].materials;

            for (var i = 0; i < materials.length; i++) {
                new PipelineObject('THREE_MATERIAL', materials[i].id, attachMaterial);
            }



            //    attachModel(new THREE.Mesh(new THREE.PlaneGeometry( 200,  200, 10 ,10)));
            return rootObject;
        };



        return ThreeTerrain;
    });