"use strict";


define([
    '3d/ThreeController',
    'EffectsAPI',
    '3d/effects/EffectListeners',

], function(
    ThreeController,
    EffectsAPI,
    EffectListeners
) {
    
    var SceneController = function() {

    };
    

    SceneController.prototype.setup3dScene = function(clientTickCallback, ready) {
        ThreeController.setupThreeRenderer(clientTickCallback, ready);
    };

    SceneController.prototype.setupEffectPlayers = function(onReady) {

        EffectsAPI.initEffects(onReady);
        EffectListeners.setupListeners();
    };
    
    return SceneController;

});