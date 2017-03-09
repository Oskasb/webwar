"use strict";

define([
        'ThreeAPI',
        'PipelineAPI',
        '../../PipelineObject',
    '3d/three/TerrainFunctions'

],
    function(
        ThreeAPI,
        PipelineAPI,
        PipelineObject,
        TerrainFunctions
    ) {

        var terrainList = {};
        var terrainIndex = {};

        var calcVec = new THREE.Vector3();
        var terrainFunctions;

        var ThreeTerrain = function() {

        };


        ThreeTerrain.loadData = function() {

            terrainFunctions = new TerrainFunctions();
            
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
            terrain.children[0].geometry.computeFaceNormals();
            terrain.children[0].geometry.computeVertexNormals();

            terrain.children[0].needsUpdate = true;
            terrain.children[0].position.x += applies.terrain_size*0.5;
            terrain.children[0].position.y -= applies.terrain_size*0.5;

            terrain.size = applies.terrain_size;
            terrain.segments = applies.terrain_segments;
            terrain.array1d = array1d;
            terrain.height = applies.max_height - applies.min_height;

            callback(terrain);
        };


        ThreeTerrain.addTerrainToIndex = function(terrainModel, parent) {
            console.log("Add to Terrain index:", terrainModel, parent );
            terrainIndex[terrainModel.uuid] = {model:terrainModel, parent:parent};

        };

        ThreeTerrain.loadTerrain = function(applies, array1d, rootObject, ThreeSetup, partsReady) {

            var setup = ThreeSetup;
            var modelId = applies.three_terrain;

            var attachMaterial = function(src, data) {


                var attachModel = function(model) {


                    setMaterialRepeat(src, model.children[0].material.map, modelId);

                    setup.addToScene(model);
                    rootObject.add(model);
                    ThreeTerrain.addTerrainToIndex(model, rootObject);
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


        ThreeTerrain.checkPositionWithin = function(pos, terrainModel, parentObj) {

            if (!parentObj.parent) return;

            var pPosx = parentObj.parent.position.x;
            var pPosz = parentObj.parent.position.z;
            var size = terrainModel.size;

            if (pPosx <= pos.x && pPosx + size > pos.x) {
                if (pPosz <= pos.z && pPosz + size > pos.z) {
                    return true;
                }
            }
            return false;
        };

        ThreeTerrain.getThreeTerrainByPosition = function(pos) {

            for (var key in terrainIndex) {
                if (ThreeTerrain.checkPositionWithin(pos, terrainIndex[key].model, terrainIndex[key].parent)) {
                    return terrainIndex[key];
                }
            }
        };


        ThreeTerrain.getThreeTerrainHeightAt = function(terrain, pos) {

            return terrainFunctions.getHeightAt(pos, terrain.array1d, terrain.size, terrain.segments)
        };



        ThreeTerrain.getThreeHeightAt = function(pos) {

            var terrainStore = ThreeTerrain.getThreeTerrainByPosition(pos);

            if (terrainStore) {
                calcVec.subVectors(pos, terrainStore.parent.parent.position);

                var height = ThreeTerrain.getThreeTerrainHeightAt(terrainStore.model, calcVec);

                return height;
            } else {
                return 5;
            }
            
        };

        return ThreeTerrain;
    });