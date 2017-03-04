"use strict";


define([

], function(

) {




    var ThreeFeedbackFunctions = function() {

    };

    var applyToTextures = function(material, x, y) {
        material.map.offset.x += x;
        material.map.offset.y += y;
        material.needsUpdate = true;
    };


    ThreeFeedbackFunctions.applyModelTextureTranslation = function(model, x, y) {
        applyToTextures(model.children[0].material, x, y);
    };

    return ThreeFeedbackFunctions;

});