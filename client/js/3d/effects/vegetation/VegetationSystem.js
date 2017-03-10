"use strict";

define([
        'ThreeAPI',
        'PipelineAPI',
    '3d/effects/vegetation/VegetationSector',
        '3d/effects/vegetation/VegetationPatch'
 //   'EffectAPI'
    ],
    function(
        ThreeAPI,
        PipelineAPI,
        VegetationSector,
        VegetationPatch
    //    EffectAPI
    ) {


        var EffectAPI;
        var camera;
        var tempVec = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var vegetationSectorSize = 40;
        var rowsNColumns = 5;


        var sectorPool = [];

        var patchGrid = [];
        var patchPool = [];
        var activePatches = [];
        
        var ownPiece;
        var plants = {};

        var plantData = {
              "id":"test_plant"
        };
        
        var VegetationSystem = function(FxAPI) {

            EffectAPI = FxAPI;

            var playerPiece = function(src, data) {
                ownPiece = data.ownPiece.piece;
                camera = ThreeAPI.getCamera();
            };

            var getCamera = function(src, data) {
                camera = data;
            };

            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', playerPiece);
            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'CAMERA', getCamera);

            this.centerSector;

            this.lastX = -100000;
            this.lastZ = -100000;

            this.lastChecked = 0;

            this.indexOffset;

            this.generateVegetationGrid()
        };


        VegetationSystem.prototype.generateVegetationGrid = function() {

            this.indexOffset = Math.floor(rowsNColumns*0.5);
            
            for (var i = 0; i < rowsNColumns; i++) {
                patchGrid[i] = [];
                for (var j = 0; j < rowsNColumns; j++) {
                    patchGrid[i][j] = null;
                    patchPool.push(new VegetationPatch(vegetationSectorSize, EffectAPI));
                    patchPool.push(new VegetationPatch(vegetationSectorSize, EffectAPI));
                    var patch = new VegetationSector(this.indexOffset, i, j, vegetationSectorSize);
                    sectorPool.push(patch);
                }
            }
        };

        

        VegetationSystem.prototype.updateSectorPositions = function() {
            for (var i = 0; i < sectorPool.length; i++) {
                sectorPool[i].positionSectorAroundCenter(this.lastX - this.indexOffset, this.lastZ - this.indexOffset)
                sectorPool[i].checkVisibility(activePatches, patchPool);
            }
        };

        VegetationSystem.prototype.positionBeneathCamera = function() {

            tempVec.x = ownPiece.spatial.posX();
            tempVec.y = 0;
            tempVec.z = ownPiece.spatial.posZ();

            tempVec2.subVectors(tempVec, camera.position);
            tempVec2.multiplyScalar(2);
            tempVec.addVectors(tempVec, tempVec2);

            var posX = Math.floor(tempVec.x / vegetationSectorSize);
            var posZ = Math.floor(tempVec.z / vegetationSectorSize);
            
            if (this.lastX != posX || this.lastZ != posZ) {
                this.lastX = posX;
                this.lastZ = posZ;
                this.updateSectorPositions();
            }
        };
        
        
        
        VegetationSystem.prototype.updateVegetationSystem = function(tpf) {

            if (!camera) return;
            
            this.positionBeneathCamera();


        //    for (var i = 0; i < sectorPool.length; i++) {
    //    //        sectorPool[i].checkVisibility(activePatches, patchPool);
        //    }

            sectorPool[this.lastChecked % sectorPool.length].checkVisibility(activePatches, patchPool);

            this.lastChecked++;

            for (var i = 0; i < activePatches.length; i++) {
                activePatches[i].checkSectorVisibility(sectorPool, activePatches, patchPool);
            }

        };

        return VegetationSystem;

    });