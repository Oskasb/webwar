

"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {

        var ParticleBuffer = function() {
            this.buildGeometry();
        };

        ParticleBuffer.prototype.buildGeometry = function() {

            var geometry = new THREE.InstancedBufferGeometry();
            geometry.copy(new THREE.PlaneBufferGeometry(1, 1, 1, 1));

            this.geometry = geometry;

            var mesh = new THREE.Mesh(geometry);
            mesh.frustumCulled = false;
        //    mesh.scale.set(1, 1, 1);
            this.applyMesh(mesh);

        };

        ParticleBuffer.prototype.applyMesh = function(mesh) {
            this.mesh = mesh;
        };

        ParticleBuffer.prototype.dispose = function() {
            ThreeAPI.removeModel(this.mesh);
            this.geometry.dispose();
        };
        
        ParticleBuffer.prototype.addToScene = function() {
            ThreeAPI.addToScene(this.mesh);
        };

        return ParticleBuffer;
        
    });