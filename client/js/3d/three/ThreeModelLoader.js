"use strict";

define([
    'PipelineAPI',
    'PipelineObject',
    '3d/three/ThreeInstanceBufferModel',
    '3d/three/ThreeTerrain'],
    function(
        PipelineAPI,
        PipelineObject,
        ThreeInstanceBufferModel,
        ThreeTerrain
    ) {

        var loadFBX = function(modelId) {

            var fbx;

            console.log("load fbx:", modelId,  modelList[modelId].url+'.FBX')

            var err = function(e, x) {
                console.log("FBX ERROR:", e, x);
            }

            var prog = function(p, x) {
                console.log("FBX PROGRESS:", p, x);
            }

            var loader = new THREE.FBXLoader();
         //   loader.options.convertUpAxis = true;
            loader.load( modelList[modelId].url+'.FBX', function ( model ) {
                console.log("FBX LOADED: ",model)
                fbx = model.scene;

                fbx.traverse( function ( child ) {

                    if ( child instanceof THREE.Mesh ) {
                        console.log(child)
                        child.rotation.x += Math.PI/2;
                        PipelineAPI.setCategoryKeyValue('THREE_MODEL', modelId, child);
                    }
                } );
            }, prog, err);
        };

        var loadCollada = function(modelId) {

            var dae;

            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.load( modelList[modelId].url+'.DAE', function ( collada ) {
                dae = collada.scene;

                dae.traverse( function ( child ) {

                    if ( child instanceof THREE.Mesh ) {
                        child.parent.remove(child);
                        console.log(child)
                        child.rotation.x = Math.PI;
                        child.needsUpdate = true;
                        PipelineAPI.setCategoryKeyValue('THREE_MODEL', modelId, child);
                    }
                } );
            });
        };

        var LoadObj = function(modelId) {
            var loader = new THREE.OBJLoader();


            var getMesh = function(object, id, cb) {
                object.traverse( function ( child ) {
                    object.remove(child);
                    if ( child instanceof THREE.Mesh ) {
                        var geom = child.geometry;
                        child.geometry = geom;
                        geom.uvsNeedUpdate = true;
                        console.log("Obj Mesh: ", child);
                        cb(child, id);

                    }

                });

            };


            var loadUrl = function(url, id, meshFound) {

                loader.load(url, function ( object ) {
                    //        console.log("THREE_MODEL OBJ", object);
                    getMesh(object, id, meshFound)

                });
            };


            var uv2Found = function(uv2mesh, mid) {
                var meshObj = PipelineAPI.readCachedConfigKey('THREE_MODEL', mid);

                console.log(meshObj, uv2mesh, uv2mesh.geometry.attributes.uv);
                meshObj.geometry.addAttribute('uv2',  uv2mesh.geometry.attributes.uv);
                uv2mesh.geometry.dispose();
                uv2mesh.material.dispose();
            };


            
            
            var modelFound = function(child, mid) {
                PipelineAPI.setCategoryKeyValue('THREE_MODEL', mid, child);
                
                if (modelList[modelId].urluv2) {
                    loadUrl(modelList[modelId].urluv2+'.obj', modelId, uv2Found)
                }
                
            };


            loadUrl(modelList[modelId].url+'.obj', modelId, modelFound)



        };
        
        var modelList = {};

        var ThreeModelLoader = function() {

        };


        ThreeModelLoader.createObject3D = function() {

            return new THREE.Object3D();
            
        };

        ThreeModelLoader.loadData = function(TAPI) {
            ThreeTerrain.loadData(TAPI);
            var modelListLoaded = function(scr, data) {
                for (var i = 0; i < data.length; i++){

                    modelList[data[i].id] = data[i];
                    
                    switch ( data[i].format )	{

                        case 'dae':
                            loadCollada(data[i].id);
                            break;

                        case 'fbx':
                            loadFBX(data[i].id);
                            break;

                        default:
                            LoadObj(data[i].id);
                            break;

                    }
                }
            };



            new PipelineObject("MODELS", "THREE", modelListLoaded);
            new PipelineObject("MODELS", "THREE_BUILDINGS", modelListLoaded);
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
            model.scale.x =    trf.scale[0];
            model.scale.y =    trf.scale[1];
            model.scale.z =    trf.scale[2];
            
            
            
        };

        var setup


        var attachAsynchModel = function(modelId, rootObject, partsReady) {

            var attachModel = function(src, cached) {

                var model = cached.clone();

                var attachMaterial = function(src, data) {
                    //    console.log("Attach MAterial to Model", data, model);

                    for (var i = 0; i < rootObject.children.length; i++) {
                        rootObject.remove(rootObject.children[i]);
                    }
                    
                    model.material = data;
                    setup.addToScene(model);
                    rootObject.add(model);
                    transformModel(modelList[modelId].transform, model);
                    partsReady();
                };

                new PipelineObject('THREE_MATERIAL', modelList[modelId].material, attachMaterial);
            };
            
            new PipelineObject('THREE_MODEL', modelId, attachModel);
        };


        ThreeModelLoader.loadThreeMeshModel = function(applies, rootObject, ThreeSetup, partsReady) {

            setup = ThreeSetup;
            
            attachAsynchModel(applies, rootObject, partsReady);
            

            return rootObject;
        };


        

        ThreeModelLoader.loadThreeDebugBox = function(sx, sy, sz) {

            var geometry, material;

        //    geometry = new THREE.SphereBufferGeometry( sx, 10, 10);

           geometry = new THREE.BoxBufferGeometry( sx || 1, sy || 1, sz || 1);
            material = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } );
            return new THREE.Mesh( geometry, material );
        };

        ThreeModelLoader.loadThreeModel = function(sx, sy, sz) {

            var geometry, material;

            geometry = new THREE.SphereBufferGeometry( sx, 10, 10);

        //    geometry = new THREE.BoxGeometry( sx || 1, sy || 1, sz || 1);
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
            return new THREE.Mesh( geometry, material );
        };

        ThreeModelLoader.loadThreeQuad = function(sx, sy) {

            var geometry, material;

            geometry = new THREE.PlaneBufferGeometry( sx || 1, sy || 1, 1 ,1);
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            return new THREE.Mesh( geometry, material );
        };
        
        ThreeModelLoader.loadGroundMesh = function(applies, array1d, rootObject, ThreeSetup, partsReady) {
            ThreeTerrain.loadTerrain(applies, array1d, rootObject, ThreeSetup, partsReady);
            return rootObject;
        };


        

        ThreeModelLoader.terrainVegetationAt = function(pos, nmStore) {
            return ThreeTerrain.terrainVegetationIdAt(pos, nmStore);
        };

        ThreeModelLoader.getHeightFromTerrainAt = function(pos) {
            return ThreeTerrain.getThreeHeightAt(pos);
        };        

        ThreeModelLoader.attachInstancedModelTo3DObject = function(modelId, rootObject, ThreeSetup) {

            

        };



        ThreeModelLoader.applyMaterialToMesh = function(material, model) {
            model.material = material;
        };


        return ThreeModelLoader;
    });