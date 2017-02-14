"use strict";


define([
    '3d/ThreeController'

], function(
    ThreeController
) {
    
    var SceneController = function() {

    };
    

    SceneController.prototype.setup3dScene = function(clientTickCallback, ready) {
        ThreeController.setupThreeRenderer(clientTickCallback, ready);

    };

    
    return SceneController;

});