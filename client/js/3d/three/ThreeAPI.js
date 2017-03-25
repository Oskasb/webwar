"use strict";

define([
        '3d/three/ThreeSetup',
        '3d/three/ThreeShaderBuilder',
        '3d/three/ThreeModelLoader',
        '3d/three/ThreeTextureMaker',
        '3d/three/ThreeMaterialMaker',
        '3d/three/ThreeFeedbackFunctions',
        '3d/three/ThreeEnvironment'

],
    function(
        ThreeSetup,
        ThreeShaderBuilder,
        ThreeModelLoader,
        ThreeTextureMaker,
        ThreeMaterialMaker,
        ThreeFeedbackFunctions,
        ThreeEnvironment
        
    ) {

        var shaderBuilder;
        var glContext;
        var renderer;
        var camera;
        var scene;
        
        var ThreeAPI = function() {

        };

        ThreeAPI.initThreeLoaders = function(TAPI) {
            shaderBuilder = new ThreeShaderBuilder();
            ThreeModelLoader.loadData(TAPI);
            ThreeTextureMaker.loadTextures();
            ThreeMaterialMaker.loadMaterialist();
            ThreeEnvironment.loadEnvironmentData();
            
        };

        ThreeAPI.initThreeScene = function(containerElement, clientTickCallback, pxRatio, antialias) {
            var store = {}; 
            store = ThreeSetup.initThreeRenderer(pxRatio, antialias, containerElement, clientTickCallback, store);
            ThreeEnvironment.initEnvironment(store);
            glContext = store.renderer.context;
            scene = store.scene;
            camera = store.camera;
            renderer = store.renderer;
            shaderBuilder.loadShaderData(glContext);
        };

        ThreeAPI.getContext = function() {
            return glContext;
        };

        ThreeAPI.readEnvironmentUniform = function(worldProperty, key) {
            return ThreeEnvironment.readDynamicValue(worldProperty, key);
        };

        ThreeAPI.getCamera = function() {
            return camera;
        };
        ThreeAPI.getScene = function() {
            return scene;
        };

        ThreeAPI.getRenderer = function() {
            return renderer;
        };

        

        ThreeAPI.plantVegetationAt = function(pos, normalStore) {
            return ThreeModelLoader.terrainVegetationAt(pos, normalStore);
        };
        
        ThreeAPI.setYbyTerrainHeightAt = function(pos) {
            return ThreeModelLoader.getHeightFromTerrainAt(pos);
        };
        
        ThreeAPI.updateWindowParameters = function(width, height, aspect, pxRatio) {
            ThreeSetup.setRenderParams(width, height, aspect, pxRatio);
        };

        ThreeAPI.registerUpdateCallback = function(callback) {
            ThreeSetup.attachPrerenderCallback(callback);
        };

        ThreeAPI.sampleFrustum = function(store) {
            ThreeSetup.sampleCameraFrustum(store);
        };

        ThreeAPI.addAmbientLight = function() {
           
        };
        
        ThreeAPI.setCameraPos = function(x, y, z) {
            ThreeSetup.setCameraPosition(x, y, z);
        };

        ThreeAPI.cameraLookAt = function(x, y, z) {
            ThreeSetup.setCameraLookAt(x, y, z);
        };

        ThreeAPI.toScreenPosition = function(x, y, z, store) {
            ThreeSetup.toScreenPosition(x, y, z, store);
        };

        ThreeAPI.checkVolumeObjectVisible = function(x, y, z, radius) {
            return ThreeSetup.cameraTestXYZRadius(x, y, z, radius);
        };


        ThreeAPI.distanceToCamera = function(x, y, z) {
            return ThreeSetup.calcDistanceToCamera(x, y, z);
        };        
        
        ThreeAPI.newCanvasTexture = function(canvas) {
            return ThreeTextureMaker.createCanvasTexture(canvas);
        };

        ThreeAPI.buildCanvasHudMaterial = function(canvasTexture) {
            return ThreeMaterialMaker.createCanvasHudMaterial(canvasTexture);
        };

        ThreeAPI.buildCanvasMaterial = function(canvasTexture) {
            return ThreeMaterialMaker.createCanvasMaterial(canvasTexture);
        };
        
        ThreeAPI.buildCanvasObject = function(model, canvas, store) {
            var tx = ThreeAPI.newCanvasTexture(canvas);
            var mat = ThreeMaterialMaker.createCanvasHudMaterial(tx);
            ThreeModelLoader.applyMaterialToMesh(mat, model);
            store.texture = tx;
            store.materia = mat;
            return store;
        };

        ThreeAPI.attachObjectToCamera = function(object) {
            ThreeSetup.addToScene(ThreeSetup.getCamera());
            ThreeSetup.addChildToParent(object, ThreeSetup.getCamera());
        };

        ThreeAPI.applySpatialToModel = function(spatial, model) {
            if (!model) return;
            ThreeAPI.transformModel(model, spatial.posX(), spatial.posY(), spatial.posZ(), spatial.pitch(), spatial.yaw(), spatial.roll())
        };



        ThreeAPI.transformModel = function(model, px, py, pz, rx, ry, rz) {
            model.position.set(px, py, pz);
            model.rotation.set(rx, ry, rz, 'ZYX');
        };

        ThreeAPI.addToScene = function(threeObject) {
            ThreeSetup.addToScene(threeObject);
        };

        ThreeAPI.createRootObject = function() {
            return ThreeModelLoader.createObject3D();
        };

        ThreeAPI.loadMeshModel = function(modelId, rootObject, partsReady) {
            return ThreeModelLoader.loadThreeMeshModel(modelId, rootObject, ThreeSetup, partsReady);
        };

        ThreeAPI.attachInstancedModel = function(modelId, rootObject) {
            return ThreeModelLoader.attachInstancedModelTo3DObject(modelId, rootObject, ThreeSetup);
        };


        ThreeAPI.loadModel = function(sx, sy, sz, partsReady) {
            return ThreeModelLoader.loadThreeModel(sx, sy, sz, partsReady);
        };

        ThreeAPI.loadDebugBox = function(sx, sy, sz) {
            return ThreeModelLoader.loadThreeDebugBox(sx, sy, sz);
        };
        
        ThreeAPI.loadQuad = function(sx, sy) {
            var model = ThreeModelLoader.loadThreeQuad(sx, sy);
            return ThreeSetup.addToScene(model);
        };

        ThreeAPI.loadGround = function(applies, array1d, rootObject, partsReady) {
            return ThreeModelLoader.loadGroundMesh(applies, array1d, rootObject, ThreeSetup, partsReady);
        };
        

        ThreeAPI.addChildToObject3D = function(child, parent) {
            ThreeSetup.addChildToParent(child, parent);
        };

        ThreeAPI.animateModelTexture = function(model, z, y) {
            ThreeFeedbackFunctions.applyModelTextureTranslation(model, z, y)
        };
        
        ThreeAPI.setObjectVisibility = function(object3d, bool) {
            object3d.visible = bool;
        };

        ThreeAPI.showModel = function(obj3d) {
            ThreeSetup.addToScene(obj3d);
        };

        ThreeAPI.hideModel = function(obj3d) {
            ThreeSetup.removeModelFromScene(obj3d);
        };
        
        ThreeAPI.removeModel = function(model) {

//            ThreeSetup.removeModelFromScene(model);
            ThreeModelLoader.returnModelToPool(model);
        };

        ThreeAPI.disposeModel = function(model) {
            ThreeSetup.removeModelFromScene(model);
            ThreeModelLoader.disposeHierarchy(model);
        };
        
        ThreeAPI.countAddedSceneModels = function() {
            return ThreeSetup.getSceneChildrenCount();
        };

        ThreeAPI.sampleRenderInfo = function(source, key) {
            return ThreeSetup.getInfoFromRenderer(source, key);
        };

        ThreeAPI.countPooledModels = function() {
            return ThreeModelLoader.getPooledModelCount();
        };

        return ThreeAPI;
    });

