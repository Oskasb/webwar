"use strict";

define([
        'lib/three/functions/ThreeSetup',
        'lib/three/functions/ThreeModelLoader'
    
],
    function(
        ThreeSetup,
        ThreeModelLoader
    ) {


        var ThreeAPI = function() {

        };

        ThreeAPI.initThreeScene = function(containerElement, clientTickCallback) {
            ThreeSetup.initThreeRenderer(containerElement, clientTickCallback);
        };

        ThreeAPI.updateWindowParameters = function(width, height, aspect, downscale) {
            ThreeSetup.setRenderParams(width, height, aspect, downscale);
        };

        ThreeAPI.registerUpdateCallback = function(callback) {
            ThreeSetup.attachPrerenderCallback(callback);
        };

        ThreeAPI.setCameraPos = function(x, y, z) {
            ThreeSetup.setCameraPosition(x, y, z);
        };

        ThreeAPI.cameraLookAt = function(x, y, z) {
            ThreeSetup.setCameraLookAt(x, y, z);
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
            ThreeSetup.addModelToScene(object3d);
            return object3d;
        };
        
        ThreeAPI.loadModel = function(sx, sy, sz) {
            var model = ThreeModelLoader.loadThreeModel(sx, sy, sz);
            ThreeSetup.addModelToScene(model);
            return model;
        };

        ThreeAPI.addChildToObject3D = function(child, parent) {
            ThreeSetup.addChildToParent(child, parent);
        };
        
        ThreeAPI.removeModel = function(model) {
            ThreeSetup.removeModelFromScene(model);
        };

        return ThreeAPI;
    });