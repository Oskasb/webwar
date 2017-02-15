"use strict";


define([

], function(

) {


    var ThreeFeedbackFunctions = function() {

    };

    ThreeFeedbackFunctions.applyModelTextureTranslation = function(model, x, y) {

        model.children[0].material.map.offset.x += x;
        model.children[0].material.map.offset.y += y;

        console.log(model, x, y);

    };

    return ThreeFeedbackFunctions;

});