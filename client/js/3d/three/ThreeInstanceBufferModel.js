"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {


        var ThreeInstanceBufferModel = function(txSettings, verts, uvs, indices) {
            var uvBuffer = new Float32Array( uvs );
            var vertexBuffer = new Float32Array( verts );
            var indexBuffer = new Uint16Array( indices );
            this.buildGeometry(vertexBuffer, uvBuffer, indexBuffer);
        };

        ThreeInstanceBufferModel.prototype.buildGeometry = function(vertexBuffer, uvBuffer, indexBuffer) {

            var geometry = new THREE.InstancedBufferGeometry();

            // per mesh data
            var vertices = new THREE.BufferAttribute(vertexBuffer, 3 );
            geometry.addAttribute( 'vertexPosition', vertices );

            var uvs = new THREE.BufferAttribute(  uvScaled, 2 );

            geometry.addAttribute( 'uv', uvs );

            geometry.setIndex( new THREE.BufferAttribute(indexBuffer, 1 ) );

            this.geometry = geometry;

            var mesh = new THREE.Mesh(geometry);
            mesh.frustumCulled = false;
            //    mesh.scale.set(1, 1, 1);
            this.applyMesh(mesh);

        };

        ThreeInstanceBufferModel.prototype.applyMesh = function(mesh) {
            this.mesh = mesh;
        };

        ThreeInstanceBufferModel.prototype.dispose = function() {
            ThreeAPI.disposeModel(this.mesh);
        };

        ThreeInstanceBufferModel.prototype.addToScene = function() {
            ThreeAPI.addToScene(this.mesh);
        };

        return ThreeInstanceBufferModel;

    });