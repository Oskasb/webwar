"use strict";

define([
        'ThreeAPI',
        'PipelineAPI',
        '3d/effects/vegetation/VegetationSystem'
        //   'EffectAPI'
    ],
    function(
        ThreeAPI,
        PipelineAPI,
        VegetationSystem
        //    EffectAPI
    ) {


        var EffectAPI;

        var ownPiece;
        var camera;

        var vegConf = [];


        var vegData = {};

        var Vegetation = function(FxAPI) {

            this.vegetationSystems = [];

            EffectAPI = FxAPI;

            var initiated = false;

            var initVeg = function() {
                if (!initiated) {
                    this.createVegetationSystems();
                }
            }.bind(this);


            var playerPiece = function(src, data) {
                ownPiece = data.ownPiece.piece;
                camera = ThreeAPI.getCamera();
                initVeg();
            };

            var getCamera = function(src, data) {
                camera = data;
            };

            var vegSysData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    vegData[data[i].id] = data[i].data;
                }
            };

            var vegMasterData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    vegConf[i] = data[i];
                }
                
            };

            PipelineAPI.subscribeToCategoryKey('VEGETATION', 'SYSTEMS', vegSysData);
            PipelineAPI.subscribeToCategoryKey('VEGETATION', 'MASTER_CONFIG', vegMasterData);

            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', playerPiece);
            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'CAMERA', getCamera);
        };


        Vegetation.prototype.createVegetationSystems = function() {
            for (var i = 0; i < vegConf.length; i++) {
                this.vegetationSystems.push(new VegetationSystem(i, EffectAPI, vegData, vegConf));
            }
        };

        Vegetation.prototype.updateVegetation = function(tpf) {
            for (var i = 0; i < this.vegetationSystems.length; i++) {
                this.vegetationSystems[i].updateVegetationSystem(tpf, ownPiece, camera);
            }
        };

        return Vegetation;

    });