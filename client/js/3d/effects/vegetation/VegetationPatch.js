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
        var tempVec3 = new THREE.Vector3();

        var debug = false;

        var plantData = {
            "id":"test_plant"
        };


        var VegetationPatch = function(sysIndex, config, FxAPI, vegData) {

            this.skipCount = 0;

            this.config = config;
            this.enabled = false;
            this.systemIndex = sysIndex;

            this.vegData = vegData;

            this.plantWeights = [];

            this.indexX = 'none';
            this.indexZ = 'none';

            this.spawnedPlants = [];

            EffectAPI = FxAPI;
            this.parentObject3d = ThreeAPI.createRootObject();

            if (debug) {
                this.addVegetationDebugBox()
            }
         //
        };


        VegetationPatch.prototype.size = function() {
            return this.conf().vegetationSectorSize;
        };

        VegetationPatch.prototype.conf = function() {
            return this.config[this.systemIndex]
        };

        VegetationPatch.prototype.addVegetationDebugBox = function() {
            this.debugBoll = ThreeAPI.loadModel(1.5);
            ThreeAPI.addChildToObject3D(this.debugBoll, this.parentObject3d);
        };

        VegetationPatch.prototype.enablePatch = function(ix, iz, x, z) {

            if (this.enabled) {
                console.log("PATCH ALREADY TAKEN!");
                return;
            }

            this.enabled = true;

            if (debug) {
                ThreeAPI.addToScene(this.parentObject3d);
            }
        //

            this.indexX = ix;
            this.indexZ = iz;

            this.posX = x;
            this.posZ = z;


            this.parentObject3d.position.x = this.posX + Math.random()*4;
            this.parentObject3d.position.y = 0;
            this.parentObject3d.position.z = this.posZ+ Math.random()*4;
            ThreeAPI.setYbyTerrainHeightAt(this.parentObject3d.position);
        };

        VegetationPatch.prototype.despawnVegetation = function(count) {

            for (var i = 0; i < count; i++) {
                if (this.spawnedPlants.length) {
                    EffectAPI.returnPassiveEffect(this.spawnedPlants.pop());
                } else {
                    return;
                }
            }
        };

        VegetationPatch.prototype.getFramePlantCount = function() {
            return (this.conf().plantCount - this.skipCount) / this.conf().spawnFrames;
        };

        VegetationPatch.prototype.disablePatch = function(activePatches, patchPool) {

            if (this.spawnedPlants.length) {
                this.despawnVegetation(this.getFramePlantCount())
            } else {
                this.skipCount = 0;
                var patch = activePatches.splice(activePatches.indexOf(this), 1)[0];
                patchPool.push(patch);

                if (!this.enabled) {
                    console.log("Already disabled...");
                    return;
                }

                this.enabled = false;
                this.indexX = 'none';
                this.indexZ = 'none';

            };

            if (debug) {
                ThreeAPI.removeModel(this.parentObject3d);
            }
        //
        };


        VegetationPatch.prototype.getPlants = function(sysId) {
            return this.vegData[sysId][this.systemIndex].vegetation_effects;
        };



        VegetationPatch.prototype.plantIdBySystemAndNormal = function(sysId, normal) {

            var plants = this.getPlants(sysId);

            var totalWeight = 0;

            for (var i = 0; i < plants.length; i++) {
                if (plants[i].slope.min <= 1 - normal.y && plants[i].slope.max > 1 - normal.y) {
                    this.plantWeights[i] = 1;
                    totalWeight++
                } else {
                    this.plantWeights[i] = 0;
                }
            }

            if (!totalWeight) return null;

            var seed = totalWeight * Math.random();

            for (i = 0; i < plants.length; i++) {
                if (this.plantWeights[i] * (i+1) > seed) {
                    return plants[i].id
                }
            }
            console.log("Bad plant by normal lookup");

        };

        VegetationPatch.prototype.spawnVegetation = function(pos) {

            tempVec2.x = 0;
            tempVec2.y = 0;
            tempVec2.z = 0;

            if (!pos.x) return;

            
            
            var vegSysId = ThreeAPI.plantVegetationAt(pos, tempVec3);

            if (!vegSysId) {
                this.skipCount ++;
                console.log("No vegSysId for position, is outside world");
                return;
            }

            var plantId = this.plantIdBySystemAndNormal(vegSysId, tempVec3);

            if (!plantId) {
                this.skipCount ++;
                console.log("No plant found for system");
                return;
            }

            this.spawnedPlants.push(EffectAPI.requestPassiveEffect(plantId, pos, tempVec2));
        };


        VegetationPatch.prototype.doPlants = function(count) {


            for (var i = 0; i < count; i++) {

                tempVec.x = this.posX + this.size() * Math.random() - 0.5;
                tempVec.y = 0;
                tempVec.z = this.posZ + this.size() * Math.random() - 0.5;
                this.spawnVegetation(tempVec, plantData)
            }
        };


        VegetationPatch.prototype.checkSectorVisibility = function(sectorPool, activePatches, patchPool) {

            for (var i = 0; i < sectorPool.length; i++) {
                if (sectorPool[i].indexX == this.indexX && sectorPool[i].indexZ == this.indexZ) {
                    if (this.spawnedPlants.length < this.conf().plantCount) {
                        this.doPlants(this.getFramePlantCount());
                    }
                    return                     
                }
            }



            this.disablePatch(activePatches, patchPool);
        };

        return VegetationPatch;

    });