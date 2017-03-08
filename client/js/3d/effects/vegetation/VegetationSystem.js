"use strict";

define([
        'ThreeAPI',
        'PipelineAPI'
 //   'EffectAPI'
    ],
    function(
        ThreeAPI,
        PipelineAPI
    //    EffectAPI
    ) {


        var EffectAPI;
        var tempVec = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var ownPiece;
        var plants = {};

        var plantData = {
              "id":"test_plant"
        };


        var VegetationSystem = function(FxAPI) {

            EffectAPI = FxAPI;

            var playerPiece = function(src, data) {
                ownPiece = data.ownPiece.piece;
            };

            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', playerPiece);

        };
        

        VegetationSystem.prototype.spawnVegetation = function(pos, plantData) {

            tempVec2.x = 0;
            tempVec2.y = 0;
            tempVec2.z = 0;

            EffectAPI.requestParticleEffect(plantData.id, pos, tempVec2);
            
        };

        VegetationSystem.prototype.updateVegetationSystem = function(tpf) {

            if (!ownPiece) return;

            tempVec.x = ownPiece.spatial.posX() + Math.random()*10 - 5;
            tempVec.y = ownPiece.spatial.posY();
            tempVec.z = ownPiece.spatial.posZ() + Math.random()*10 - 5;;

            this.spawnVegetation(tempVec, plantData)

        };





        return VegetationSystem;

    });