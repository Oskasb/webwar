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





        VegetationSystem.prototype.makePlants = function(tpf) {



            tempVec.x = ownPiece.spatial.posX() + Math.random()*100 - 50;
            tempVec.y = ownPiece.spatial.posY();
            tempVec.z = ownPiece.spatial.posZ() + Math.random()*100 - 50;;

            this.spawnVegetation(tempVec, plantData)

        };



        VegetationSystem.prototype.updateVegetationSystem = function(tpf) {

            if (!ownPiece) return;

            for (var i = 0; i < 3; i++) {
                this.makePlants()
            }


        };

        return VegetationSystem;

    });