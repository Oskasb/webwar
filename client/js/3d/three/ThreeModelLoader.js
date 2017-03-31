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


        var modelPool = {};


        var poolMesh = function(id, mesh, count) {
            var poolCount = count || 20;
            mesh.poolId = id;
            modelPool[id] = [];

            for (var i = 0; i < poolCount; i++) {
                var clone = mesh.clone();
                clone.poolId = id;
                clone.frustumCulled = false;
                modelPool[id].push(clone);
            }

        };

        var cacheMesh = function(id, mesh, pool) {

            PipelineAPI.setCategoryKeyValue('THREE_MODEL', id, mesh);
            poolMesh(id, mesh, pool)
        };

        var loadFBX = function(modelId, pool) {

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
                        cacheMesh(modelId, child, pool);

                    }
                } );
            }, prog, err);
        };

        var loadCollada = function(modelId, pool) {

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
                        cacheMesh(modelId, child, pool);
                    }
                } );
            });
        };

        var getMesh = function(object, id, cb) {

            object.traverse( function ( child ) {
                object.remove(child);

                if ( child instanceof THREE.Mesh ) {
                //    var geom = child.geometry;
                //    child.geometry = geom;
                //    geom.uvsNeedUpdate = true;
                //    console.log("Obj Mesh: ", child);
                    cb(child, id);
                }
            });
        };

        var LoadObj = function(modelId, pool) {

            var loader = new THREE.OBJLoader();

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
                cacheMesh(mid, meshObj, pool);
            };

            var modelFound = function(child, mid) {
                PipelineAPI.setCategoryKeyValue('THREE_MODEL', mid, child);

                if (modelList[modelId].urluv2) {
                    loadUrl(modelList[modelId].urluv2+'.obj', modelId, uv2Found)
                } else {
                    cacheMesh(mid, child, pool);
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
                            loadCollada(data[i].id, data[i].pool);
                            break;

                        case 'fbx':
                            loadFBX(data[i].id, data[i].pool);
                            break;

                        default:
                            LoadObj(data[i].id, data[i].pool);
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

        var setup;

        var attachAsynchModel = function(modelId, rootObject, partsReady) {

            var attachModel = function(model) {

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

            ThreeModelLoader.fetchPooledMeshModel(modelId, attachModel);
        };


        ThreeModelLoader.loadThreeMeshModel = function(applies, rootObject, ThreeSetup, partsReady) {

            setup = ThreeSetup;
            attachAsynchModel(applies, rootObject, partsReady);
            return rootObject;
        };


        ThreeModelLoader.fetchPooledMeshModel = function(id, cb) {

            if (!modelPool[id].length) {

                console.log("Model Pool Exhausted!");
                var modelData = function(src, cached) {
                    var clone = cached.clone();
                    clone.poolId = cached.poolId;
                    cb(clone)
                };

                new PipelineObject('THREE_MODEL', id, modelData);
            } else {
                cb(modelPool[id].pop())
            }
        };

        ThreeModelLoader.returnModelToPool = function(model) {

            var meshFound = function(mesh) {

                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
                if (!mesh.poolId) {
                    console.log("Missing Pool ID on Mesh", mesh);
                    return;
                }
                modelPool[mesh.poolId].push(mesh);
            };

            if (!model.poolId) {
        //        console.log("Shave scrap objects from mesh before returning it...");
                getMesh(model, null, meshFound)
            } else {
                meshFound(model);
            }
        };

        ThreeModelLoader.disposeHierarchy = function(model) {

            var meshFound = function(mesh) {
                mesh.geometry.dispose();
            };

            if (!model.geometry) {
                getMesh(model, null, meshFound)
            } else {
                meshFound(model);
            }
        };

        var material1 = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true, fog:false } );
        var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, fog:false } );

        ThreeModelLoader.loadThreeDebugBox = function(sx, sy, sz) {

            var geometry;

            geometry = new THREE.BoxBufferGeometry( sx || 1, sy || 1, sz || 1);

            return new THREE.Mesh( geometry, material1 );
        };

        ThreeModelLoader.loadThreeModel = function(sx, sy, sz) {

            var geometry;

            geometry = new THREE.SphereBufferGeometry( sx, 10, 10);

            return new THREE.Mesh( geometry, material2 );
        };

        ThreeModelLoader.loadThreeQuad = function(sx, sy) {

            var geometry;

            geometry = new THREE.PlaneBufferGeometry( sx || 1, sy || 1, 1 ,1);
            material2 = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            return new THREE.Mesh( geometry, material2 );
        };

        ThreeModelLoader.loadGroundMesh = function(applies, array1d, rootObject, ThreeSetup, partsReady) {
            ThreeTerrain.loadTerrain(applies, array1d, rootObject, ThreeSetup, partsReady);
            return rootObject;
        };

        ThreeModelLoader.terrainVegetationAt = function(pos, nmStore) {
            return ThreeTerrain.terrainVegetationIdAt(pos, nmStore);
        };

        ThreeModelLoader.getHeightFromTerrainAt = function(pos, normalStore) {
            return ThreeTerrain.getThreeHeightAt(pos, normalStore);
        };

        ThreeModelLoader.attachInstancedModelTo3DObject = function(modelId, rootObject, ThreeSetup) {

        };

        ThreeModelLoader.applyMaterialToMesh = function(material, model) {
            model.material = material;
        };

        ThreeModelLoader.getPooledModelCount = function() {
            var pool = 0;
            for (var key in modelPool) {
                pool += modelPool[key].length;
            }
            return pool;
        };

        return ThreeModelLoader;
    });