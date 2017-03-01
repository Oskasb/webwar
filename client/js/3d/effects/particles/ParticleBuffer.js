

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

            var verts = [
                // Front
                -1, 1, 1,
                1, 1, 1,
                -1, -1, 1,
                1, -1, 1,
                // Back
                1, 1, -1,
                -1, 1, -1,
                1, -1, -1,
                -1, -1, -1,
                // Left
                -1, 1, -1,
                -1, 1, 1,
                -1, -1, -1,
                -1, -1, 1,
                // Right
                1, 1, 1,
                1, 1, -1,
                1, -1, 1,
                1, -1, -1,
                // Top
                -1, 1, 1,
                1, 1, 1,
                -1, 1, -1,
                1, 1, -1,
                // Bottom
                1, -1, 1,
                -1, -1, 1,
                1, -1, -1,
                -1, -1, -1
            ];

            verts.reverse();

            // per mesh data
            var vertices = new THREE.BufferAttribute( new Float32Array( verts ), 3 );
            geometry.addAttribute( 'vertexPosition', vertices );

            var uvs = new THREE.BufferAttribute( new Float32Array( [
                //x	y	z
                // Front
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                // Back
                1, 0,
                0, 0,
                1, 1,
                0, 1,
                // Left
                1, 1,
                1, 0,
                0, 1,
                0, 0,
                // Right
                1, 0,
                1, 1,
                0, 0,
                0, 1,
                // Top
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                // Bottom
                1, 0,
                0, 0,
                1, 1,
                0, 1
            ] ), 2 );

            geometry.addAttribute( 'uv', uvs );

            var inds = [
                0, 1, 2,
                2, 1, 3,
                4, 5, 6,
                6, 5, 7,
                8, 9, 10,
                10, 9, 11,
                12, 13, 14,
                14, 13, 15,
                16, 17, 18,
                18, 17, 19,
                20, 21, 22,
                22, 21, 23
            ];

            inds.reverse();
            var indices = new Uint16Array( inds );

            geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );



         //   geometry.copy(new THREE.PlaneBufferGeometry(1, 1, 1, 1));

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