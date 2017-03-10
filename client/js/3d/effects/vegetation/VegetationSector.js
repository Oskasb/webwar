"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {
        
        var calcVec = new THREE.Vector3();

        var VegetationSector = function(indexOffset, row, column, size) {

            this.size = size;
            this.indexOffset = indexOffset;
            this.isVisible = false;

            this.row = row;
            this.column = column;

            this.indexX = row;
            this.indexZ = column;

            this.posX = 0;
            this.posY = 0;
            this.posZ = 0;

            this.parentObject3d = ThreeAPI.createRootObject();
            this.addVegetationDebugBox(size)
        };
        

        VegetationSector.prototype.addVegetationDebugBox = function(size) {
            this.debugBox = ThreeAPI.loadDebugBox(size, size*0.5, size);
            ThreeAPI.addChildToObject3D(this.debugBox, this.parentObject3d);
        };


        VegetationSector.prototype.positionSectorAroundCenter = function(indexX, indexZ) {

            this.isVisible = false;

            this.indexX = indexX+this.row;
            this.indexZ = indexZ+this.column;
            this.setSectorPosition(this.indexX * this.size, this.indexZ * this.size);

        };
        
        VegetationSector.prototype.setSectorPosition = function(x, z) {

            this.posX = x;
            this.posZ = z;

            calcVec.x = this.posX;
            calcVec.y = 0;
            calcVec.z = this.posZ;

            this.posY = ThreeAPI.getTerrainHeightAt(calcVec);
            calcVec.y = this.posY;
            this.parentObject3d.position.copy(calcVec);
            
        };


        VegetationSector.prototype.checkForActivePatch = function(activePatches, patchPool) {

            for (var i = 0; i < activePatches.length; i++) {
                if (activePatches[i].posX == this.posX && activePatches[i].posZ == this.posZ) {
                    return activePatches[i];
                }
            }

        };

        VegetationSector.prototype.enableVegetationSector = function(activePatches, patchPool) {

            var activePatch = this.checkForActivePatch(activePatches);

            ThreeAPI.addToScene(this.parentObject3d);

            if (activePatch) {
                return;
            }

            var patch = patchPool.pop();

            if (!patch) {
                console.log("bad patch!", patchPool, this.indexX, this.indexZ)
                return;
            } else {
                console.log("ENABLE patch!", patchPool.length, this.indexX, this.indexZ);
            }

            activePatches.push(patch);

            patch.enablePatch(this.indexX, this.indexZ, this.posX, this.posZ, this.size);
            
        };

        VegetationSector.prototype.disableVegetationSector = function() {
            
            ThreeAPI.removeModel(this.parentObject3d);
        };

        VegetationSector.prototype.checkVisibility = function(activePatches, patchPool) {

            var visible = ThreeAPI.checkVolumeObjectVisible( this.posX, this.posY , this.posZ , this.size);

            if (visible && !this.isVisible) {
                this.enableVegetationSector(activePatches, patchPool);
            }

            if (!visible && this.isVisible) {
                this.disableVegetationSector();
            }

            this.isVisible = visible;

        };


        return VegetationSector;

    });