"use strict";


define([
    '3d/ThreeController',
    'ThreeAPI',
    'ui/GameScreen',
    
    '3d/GooController',
    '3d/effects/ParticlePlayer',
    '3d/effects/GooCameraEffects',
    '3d/effects/SpaceFX',
    '3d/effects/GroundFX',
    '3d/models/ModelLoader',
    'EnvironmentAPI',
    'Events'

], function(
    ThreeController,
    ThreeAPI,
    GameScreen,
    
    GooController,
    ParticlePlayer,
    GooCameraEffects,
    SpaceFX,
    GroundFX,
    ModelLoader,
    EnvironmentAPI,
    evt
) {
    
    var world;
    var gooController;
    var particlePlayer;
    var spaceFX;
    var groundFX;
    var modelLoader;


    
    var SceneController = function() {


        
    };



    

    SceneController.prototype.setup3dScene = function(clientTickCallback, ready) {
        ThreeController.setupThreeRenderer(clientTickCallback, ready);

    };

    
    return SceneController;

});