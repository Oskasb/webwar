"use strict";

define([
        'ThreeAPI',
        '3d/effects/particles/ParticleRenderer',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        ParticleRenderer,
        PipelineObject
    ) {

        var renderers = {};

        var ParticleSpawner = function() {

        };

        ParticleSpawner.prototype.initParticleSpawner = function() {

            this.setupParticleRenderers();


        };

        ParticleSpawner.prototype.setupParticleRenderers = function() {
                        
            var renderersData = function(src, data) {
                for (var i = 0; i < data.length; i++) {
                    renderers[data[i].id] = new ParticleRenderer(data[i]);
                }
            };
            
            new PipelineObject("PARTICLE_SYSTEMS", "RENDERERS", renderersData);
        };


        ParticleSpawner.prototype.spawnParticleEffect = function() {

            // this.setupParticleRenderers();


        };

        return ParticleSpawner;

    });