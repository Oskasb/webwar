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

        var gridSectionSize = 30;
        var gridSectionsXZ = 5;

        var ownPiece;
        var plants = {};

        var plantData = {
            "id":"test_plant"
        };


        var VegetationPatch = function(size, FxAPI) {

            this.size = size;
            this.enabled = false;
            
            this.indexX = 'none';
            this.indexZ = 'none';

            EffectAPI = FxAPI;
            this.parentObject3d = ThreeAPI.createRootObject();
            this.addVegetationDebugBox(size)
        };




        VegetationPatch.prototype.addVegetationDebugBox = function(size) {
            this.debugBoll = ThreeAPI.loadModel(1.5);
            ThreeAPI.addChildToObject3D(this.debugBoll, this.parentObject3d);
        };

        VegetationPatch.prototype.enablePatch = function(ix, iz, x, z, size) {

            if (this.enabled) {
                console.log("PATCH ALREADY TAKEN!");
                return;
            }

            this.enabled = true;

            ThreeAPI.addToScene(this.parentObject3d);

            this.indexX = ix;
            this.indexZ = iz;

            this.size = size;
            this.posX = x;
            this.posZ = z;


            this.parentObject3d.position.x = this.posX + Math.random()*4;
            this.parentObject3d.position.y = 0;
            this.parentObject3d.position.z = this.posZ+ Math.random()*4;
            this.parentObject3d.position.y = ThreeAPI.getTerrainHeightAt(this.parentObject3d.position);
        };

        VegetationPatch.prototype.disablePatch = function() {

            if (!this.enabled) {
                console.log("Already disabled...");
                return;
            };


            this.enabled = false;
            this.indexX = 'none';
            this.indexZ = 'none';
            this.posX = 'none';
            this.posZ = 'none';

            ThreeAPI.removeModel(this.parentObject3d);
        };


        VegetationPatch.prototype.spawnVegetation = function(pos, plantData) {

            tempVec2.x = 0;
            tempVec2.y = 0;
            tempVec2.z = 0;

            if (!pos.x) return;

            pos.y = ThreeAPI.getTerrainHeightAt(pos);
            EffectAPI.requestParticleEffect(plantData.id, pos, tempVec2);
        };


        VegetationPatch.prototype.doPlants = function() {

            tempVec.x = this.posX + this.size * Math.random() - 0.5;
            tempVec.y = 0;
            tempVec.z = this.posZ + this.size * Math.random() - 0.5;

            for (var i = 0; i < 1; i++) {
                this.spawnVegetation(tempVec, plantData)
            }
        };


        VegetationPatch.prototype.checkSectorVisibility = function(sectorPool, activePatches, patchPool) {

            for (var i = 0; i < sectorPool.length; i++) {
                if (sectorPool[i].indexX == this.indexX && sectorPool[i].indexZ == this.indexZ) {
                    if (Math.random() < 0.1) {
                        this.doPlants();
                    }
                    return                     
                }
            }

            var patch = activePatches.splice(activePatches.indexOf(this), 1)[0];

            patchPool.push(patch);

            this.disablePatch(patchPool);
        };

        return VegetationPatch;

    });