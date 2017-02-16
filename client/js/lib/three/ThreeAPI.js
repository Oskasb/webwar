"use strict";

define([
        'lib/three/functions/ThreeSetup',
        'lib/three/functions/ThreeModelLoader',
        'lib/three/functions/ThreeTextureMaker',
        'lib/three/functions/ThreeMaterialMaker',
        'lib/three/functions/ThreeFeedbackFunctions',
        'lib/three/functions/ThreeEnvironment'

],
    function(
        ThreeSetup,
        ThreeModelLoader,
        ThreeTextureMaker,
        ThreeMaterialMaker,
        ThreeFeedbackFunctions,
        ThreeEnvironment
        
    ) {


        var ThreeAPI = function() {

        };

        ThreeAPI.initThreeLoaders = function() {
            ThreeModelLoader.loadData();
            ThreeTextureMaker.loadTextures();
            ThreeMaterialMaker.loadMaterialist();
            ThreeEnvironment.loadEnvironmentData();
        };

        ThreeAPI.initThreeScene = function(containerElement, clientTickCallback, pxRatio, antialias) {
            var store = {}; 
            store = ThreeSetup.initThreeRenderer(pxRatio, antialias, containerElement, clientTickCallback, store);
            ThreeEnvironment.initEnvironment(store)
            
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
            ThreeAPI.transformModel(model, spatial.posX(), spatial.posY(), spatial.posZ(), spatial.pitch(), spatial.yaw(), spatial.roll())
        };

        ThreeAPI.transformModel = function(model, px, py, pz, rx, ry, rz) {
            model.position.x = px; model.position.y = py; model.position.z = pz; 
            model.rotation.x = rx; model.rotation.y = ry; model.rotation.x = rz;
        };

        ThreeAPI.createRootObject = function() {
            var object3d = ThreeModelLoader.createObject3D();
            ThreeSetup.addToScene(object3d);
            return object3d;
        };


        ThreeAPI.loadMeshModel = function(modelId, rootObject) {
            var model = ThreeModelLoader.loadThreeMeshModel(modelId, rootObject, ThreeSetup);
            ThreeSetup.addToScene(model);
            return model;
        };

        ThreeAPI.loadModel = function(sx, sy, sz) {
            var model = ThreeModelLoader.loadThreeModel(sx, sy, sz);
            ThreeSetup.addToScene(model);
            return model;
        };

        ThreeAPI.loadQuad = function(sx, sy) {
            var model = ThreeModelLoader.loadThreeQuad(sx, sy);
            return ThreeSetup.addToScene(model);
        };

        ThreeAPI.loadGround = function(modelId, rootObject) {
            var model = ThreeModelLoader.loadGroundMesh(modelId, rootObject, ThreeSetup);
            return ThreeSetup.addToScene(model);
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
        
        ThreeAPI.removeModel = function(model) {
            ThreeSetup.removeModelFromScene(model);
        };

        return ThreeAPI;
    });

