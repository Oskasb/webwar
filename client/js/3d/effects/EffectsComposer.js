"use strict";

define([
    'ThreeAPI'
],
    function(
        ThreeAPI,
        ShaderBuilder
    ) {


        var emitters = {};
        var groups = [];

        var EffectsComposer = function() {

        };




        EffectsComposer.attachEmitterCount = function(group, count) {
            
        };


        EffectsComposer.buildEmitter = function(group, count) {


        };


        EffectsComposer.buildEmitterGroup = function(group, count) {
            
        };


        EffectsComposer.initEffects = function() {
                        

        };

        EffectsComposer.fetchEmitter = function(effectData) {
            return groups[0];
        };


        EffectsComposer.tickGroups = function(tpf) {

            for (var i = 0; i < groups.length; i++) {
                groups[i].tick(tpf);
            }

        };

        return EffectsComposer;

    });