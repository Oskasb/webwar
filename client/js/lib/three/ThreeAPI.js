"use strict";

define([
        'lib/three/functions/ThreeSetup',
        'lib/three/functions/ThreeModelLoader',
        'lib/three/functions/ThreeTextureMaker',
        'lib/three/functions/ThreeMaterialMaker'

],
    function(
        ThreeSetup,
        ThreeModelLoader,
        ThreeTextureMaker,
        ThreeMaterialMaker
        
    ) {


        var ThreeAPI = function() {

        };

        ThreeAPI.initThreeScene = function(containerElement, clientTickCallback) {
            ThreeSetup.initThreeRenderer(containerElement, clientTickCallback);
            ThreeAPI.addAmbientLight();
        };

        ThreeAPI.updateWindowParameters = function(width, height, aspect, downscale) {
            ThreeSetup.setRenderParams(width, height, aspect, downscale);
        };

        ThreeAPI.registerUpdateCallback = function(callback) {
            ThreeSetup.attachPrerenderCallback(callback);
        };

        ThreeAPI.sampleFrustum = function(store) {
            ThreeSetup.sampleCameraFrustum(store);
        };

        ThreeAPI.addAmbientLight = function() {
            ThreeSetup.addToScene(new THREE.AmbientLight(0xff0066, 12));
        };
        
        ThreeAPI.setCameraPos = function(x, y, z) {
            ThreeSetup.setCameraPosition(x, y, z);
        };

        ThreeAPI.cameraLookAt = function(x, y, z) {
            ThreeSetup.setCameraLookAt(x, y, z);
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
        
        ThreeAPI.loadModel = function(sx, sy, sz) {
            var model = ThreeModelLoader.loadThreeModel(sx, sy, sz);
            ThreeSetup.addToScene(model);
            return model;
        };

        ThreeAPI.loadQuad = function(sx, sy) {
            var model = ThreeModelLoader.loadThreeQuad(sx, sy);
            ThreeSetup.addToScene(model);
            return model;
        };

        ThreeAPI.addChildToObject3D = function(child, parent) {
            ThreeSetup.addChildToParent(child, parent);
        };

        
        ThreeAPI.setObjectVisibility = function(object3d, bool) {
            object3d.visible = bool;
        };
        
        ThreeAPI.removeModel = function(model) {
            ThreeSetup.removeModelFromScene(model);
        };

        return ThreeAPI;
    });