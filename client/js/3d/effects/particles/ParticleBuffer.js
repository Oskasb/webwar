"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {

        var scaleUVCoords = function(uvs) {
            var buffer = new Float32Array( uvs );

            return buffer;

            for (var i = 0; i < uvs.length; i++) {
                buffer[i] = uvs[i] / txSettings.tiles_x;
                i++;
                buffer[i] = uvs[i] / txSettings.tiles_y;
            };

        };

        var ParticleBuffer = function(verts, uvs, indices) {
            var uvScaled = scaleUVCoords(uvs);
            this.buildGeometry(verts, uvScaled, indices);
        };

        ParticleBuffer.prototype.buildGeometry = function(verts, uvScaled, indices) {

            var geometry = new THREE.InstancedBufferGeometry();

            // per mesh data
            var vertices = new THREE.BufferAttribute( new Float32Array( verts ), 3 );
            geometry.addAttribute( 'vertexPosition', vertices );

            var uvs = new THREE.BufferAttribute(  uvScaled, 2 );

            geometry.addAttribute( 'uv', uvs );

            geometry.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );

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
            ThreeAPI.hideModel(this.mesh);
            this.geometry.dispose();
        };

        ParticleBuffer.prototype.removeFromScene = function() {
            ThreeAPI.hideModel(this.mesh);
        };

        ParticleBuffer.prototype.addToScene = function() {
            ThreeAPI.showModel(this.mesh);
        };

        return ParticleBuffer;

    });