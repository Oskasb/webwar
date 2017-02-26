"use strict";

define([
        'PipelineObject',
    'PipelineAPI'
    ],
    function(
        PipelineObject,
        PipelineAPI
    ) {

        var shaderDataIndex = {};
        var buildTimeout;
        
        var ShaderBuilder = function() {
            this.shaderChunks = {};
        };


        var buildStringChunks = function(src, data) {
            var chunks = {}
            for (var key in data) {
                chunks[key] = "\n" + data[key].join( "\n" );
                chunks[key]+="\n";
                PipelineAPI.setCategoryKeyValue(src, key, chunks[key]);
            }
            notifyShaderDataUpdate();
        //    console.log("CACHE STRING CHUNKS:", src, chunks);
        };

        var mapThreeShaderChunks = function() {
            var chunks = {}
            for (var key in THREE.ShaderChunk) {
                chunks[key] = THREE.ShaderChunk[key];
                PipelineAPI.setCategoryKeyValue("THREE_CHUNKS", key, "\n " + chunks[key] + " \n");
            }
        //    console.log("CACHE THREE CHUNKS:", chunks);
        };

        var combineProgramFromSources = function(sources) {
            var programString = '';
            for (var i = 0; i < sources.length; i++) {
                programString += PipelineAPI.readCachedConfigKey(sources[i].source, sources[i].chunk);
            }
            return programString;
        };

        var buildShaderPrograms = function(src, data) {

            var program = {};
            for (var key in data) {
                program[key] = combineProgramFromSources(data[key]);
            }
            PipelineAPI.setCategoryKeyValue("SHADERS", src, program);
            console.log("CACHED SHADER PROGRAMS:", src, PipelineAPI.getCachedConfigs());
        };

        var buildShadersFromIndex = function() {
            for (var key in shaderDataIndex) {
                buildShaderPrograms(key, shaderDataIndex[key]);
            }
        };

        var registerShaderProgram = function(src, data) {
            shaderDataIndex[src] = {};
            for (var key in data) {
                shaderDataIndex[src][key] = data[key];
            }
            console.log("SHADER DATA INDEX:", shaderDataIndex);
            notifyShaderDataUpdate();
        };

        var notifyShaderDataUpdate = function() {
            clearTimeout(buildTimeout, 1);
            buildTimeout = setTimeout(function() {
                buildShadersFromIndex();
            }, 10);
        };

        ShaderBuilder.prototype.loadShaderData = function() {

            mapThreeShaderChunks();
            new PipelineObject("SHADER_CHUNKS", "SPE_CHUNKS", buildStringChunks);
            new PipelineObject("SHADER_PROGRAMS", "SPE_PROGRAMS", buildStringChunks);
            new PipelineObject("SHADERS_THREE", "SPE_PARTICLE_SHADER", registerShaderProgram);
            new PipelineObject("SHADER_CHUNKS", "INSTANCING_CHUNKS", buildStringChunks);
            new PipelineObject("SHADER_PROGRAMS", "INSTANCING_PROGRAMS", buildStringChunks);
            new PipelineObject("SHADERS_THREE", "INSTANCING_SHADER", registerShaderProgram)

        };

        
        return ShaderBuilder;

    });