"use strict";

define([
    'ThreeAPI',
    'PipelineAPI',
    'PipelineObject'],
    function(
        ThreeAPI,
        PipelineAPI,
        PipelineObject
    ) {

        var loadCollada = function(modelId) {

            var dae;

            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.load( modelList[modelId].url+'.DAE', function ( collada ) {
                dae = collada.scene;

                dae.traverse( function ( child ) {

                    if ( child instanceof THREE.Mesh ) {
                        PipelineAPI.setCategoryKeyValue('THREE_MODEL', modelId, child.parent);
                    }
                } );
            });
        };

        var LoadObj = function(modelId) {
            var loader = new THREE.OBJLoader();
            loader.load(modelList[modelId].url+'.obj', function ( object ) {
            //        console.log("THREE_MODEL OBJ", object);
                object.traverse( function ( child ) {

                    if ( child instanceof THREE.Mesh ) {

                        var geom = new THREE.Geometry().fromBufferGeometry( child.geometry );
                        child.geometry = geom;
                        geom.uvsNeedUpdate = true;
                        
                        PipelineAPI.setCategoryKeyValue('THREE_MODEL', modelId, child);
                    }
                } );
            });
        };



        var modelList = {};
        var terrainList = {};

        var ThreeModelLoader = function() {

        };


        ThreeModelLoader.createObject3D = function() {

            return new THREE.Object3D();


        };

        ThreeModelLoader.loadData = function() {
            var modelListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){
                    modelList[data[i].id] = data[i]
                    LoadObj(data[i].id);
                }
            };

            new PipelineObject("MODELS", "THREE", modelListLoaded);

            var terrainListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){
                    terrainList[data[i].id] = data[i]
                }
            };

            new PipelineObject("TERRAINS", "THREE", terrainListLoaded);
        };


        ThreeModelLoader.createObject3D = function() {
            return new THREE.Object3D();
        };


        var transformModel = function(trf, model) {
            model.position.x = trf.pos[0];
            model.position.y = trf.pos[1];
            model.position.z = trf.pos[2];
            model.rotation.x = trf.rot[0]*Math.PI;
            model.rotation.y = trf.rot[1]*Math.PI;
            model.rotation.z = trf.rot[2]*Math.PI;
        };

        ThreeModelLoader.loadThreeMeshModel = function(modelId, rootObject, ThreeSetup) {

            var setup = ThreeSetup;
            
            var attachModel = function(src, model) {

                var attachMaterial = function(src, data) {
                //    console.log("Attach MAterial to Model", data, model);
                    model.material = data;
                    setup.addToScene(model);
                    rootObject.add(model);
                };

                new PipelineObject('THREE_MATERIAL', modelList[modelId].material, attachMaterial);

                transformModel(modelList[modelId].transform, model);

            };

            new PipelineObject('THREE_MODEL', modelId, attachModel);
            return rootObject;
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

        ThreeModelLoader.loadGroundMesh = function(modelId, rootObject, ThreeSetup) {

            var setup = ThreeSetup;
            
            var attachModel = function(model) {

                var attachMaterial = function(src, data) {
                    model.material = data;

                    model.material.map.repeat.x = terrainList[modelId].repeat[0];
                    model.material.map.repeat.y = terrainList[modelId].repeat[1];
                    //    model.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

                    setup.addToScene(model);
                    rootObject.add(model);
                };

                new PipelineObject('THREE_MATERIAL', terrainList[modelId].material, attachMaterial);
                transformModel(terrainList[modelId].transform, model);
            };
            
            attachModel(new THREE.Mesh(new THREE.PlaneGeometry( terrainList[modelId].transform.scale[0],  terrainList[modelId].transform.scale[2], 10 ,10)));
            return rootObject;
        };


        ThreeModelLoader.applyMaterialToMesh = function(material, model) {
            model.material = material;
        };


        return ThreeModelLoader;
    });