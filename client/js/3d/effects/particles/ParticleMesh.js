

"use strict";

define([],
    function() {

        var boxVerts = [
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

        var ParticleMesh = function() {

        };

        ParticleMesh.boxVerts = function() {
            return boxVerts;
        };

        ParticleMesh.boxUvs = function() {
            return boxUvs;
        };

        ParticleMesh.boxIndices = function() {
            return boxIndices;
        };
        
        return ParticleMesh;

    });