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
        var scene = ThreeController.setupThreeRenderer(clientTickCallback, ready);
        EffectsAPI.initEffects();
        EffectListeners.setupListeners();
    };

    
    return SceneController;

});