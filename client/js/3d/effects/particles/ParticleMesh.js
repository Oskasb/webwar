

"use strict";

define([],
    function() {

        var stampVerts = [
            -1,  0,  1,
            1,   0,  1,
            -1,  0, -1,
            1,   0, -1
        ];
      
        var quadVerts = [
            -1,  1, 0,
            1,   1, 0,
            -1, -1, 0,
            1,  -1, 0
        ];


        var quadUvs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        var quadInds =[
            0, 1, 2,
            2, 1, 3
        ];

        var plantUvs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            1, 1,
            0, 1
        ];

        var plantInds =[
            0, 1, 2,
            2, 1, 3,
            4, 5, 6,
            6, 5, 7
        ];


        var plantVerts = [
            // Front
            -1, -0.2, 0,
            1,  -0.2, 0,
            -1,  1.8, 0,
            1,   1.8, 0,

            // Left
            0, -0.2, -1,
            0, -0.2,  1,
            0,  1.8, -1,
            0,  1.8,  1

        ];


        var cross3Verts = [
            // Front
            -1,  1, 0,
            1,   1, 0,
            -1, -1, 0,
            1,  -1, 0,
            // Back
            1,  1,  0,
            -1,  1, 0,
            1, -1,  0,
            -1, -1, 0,
            // Left
            0,  1, -1,
            0,  1,  1,
            0, -1, -1,
            0, -1,  1,
            // Right
            0,  1,  1,
            0,  1, -1,
            0, -1,  1,
            0, -1, -1,
            // Top
            -1, 0,  1,
            1,  0,  1,
            -1, 0, -1,
            1,  0, -1,
            // Bottom
            1,  0,  1,
            -1, 0,  1,
            1,  0, -1,
            -1, 0, -1
        ];



        var boxVerts = [
            // Front
            -1,  1, 1,
             1,  1, 1,
            -1, -1, 1,
             1, -1, 1,
            // Back
             1,  1, -1,
            -1,  1, -1,
             1, -1, -1,
            -1, -1, -1,
            // Left
            -1,  1, -1,
            -1,  1,  1,
            -1, -1, -1,
            -1, -1,  1,
            // Right
            1,  1,  1,
            1,  1, -1,
            1, -1,  1,
            1, -1, -1,
            // Top
            -1, 1,  1,
             1, 1,  1,
            -1, 1, -1,
             1, 1, -1,
            // Bottom
             1, -1,  1,
            -1, -1,  1,
             1, -1, -1,
            -1, -1, -1
        ];

        var boxUvs = [
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
        ];

        var boxIndices = [
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


        var trailGeometry = new THREE.PlaneBufferGeometry(2, 2, 5, 1);


        var ParticleMesh = function() {2

        };

        ParticleMesh.plant3d = function() {
            return {verts:plantVerts, indices:plantInds, uvs:plantUvs};
        };

        ParticleMesh.cross3d = function() {
            return {verts:cross3Verts, indices:boxIndices, uvs:boxUvs};
        };

        ParticleMesh.quad = function() {
            return {verts:quadVerts, indices:quadInds, uvs:quadUvs};
        };

        ParticleMesh.trail5 = function() {

            var verts = trailGeometry.attributes.position.array;
            var uv =    trailGeometry.attributes.uv.array;
            var ind =   trailGeometry.index.array;

            return {verts:verts, indices:ind, uvs:uv};
        };


        ParticleMesh.stamp = function() {
            return {verts:stampVerts, indices:quadInds, uvs:quadUvs};
        };
        
        ParticleMesh.box3d = function() {
            return {verts:boxVerts, indices:boxIndices, uvs:boxUvs};
        };


        return ParticleMesh;

    });