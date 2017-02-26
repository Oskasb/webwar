"use strict";

define([
    'PipelineObject',
    'PipelineAPI',
    'Events'
    ],
    function(
        PipelineObject,
        PipelineAPI,
        evt
    ) {

        var shaderDataIndex = {};
        var buildTimeout;

        var gl;


        function testShader( src, type ) {

            var types = {
                fragment:gl.FRAGMENT_SHADER,
                vertex:gl.VERTEX_SHADER
            };

            var shader = gl.createShader( types[type]);
            var line, lineNum, lineError, index = 0, indexEnd;

            gl.shaderSource( shader, [src] );
            gl.compileShader( shader );


            if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
                var error = gl.getShaderInfoLog( shader );

                console.error( error );
                evt.fire(evt.list().MESSAGE_UI, {channel:'receive_error', message:'Shader Compile Error'});

                while (index >= 0) {
                    index = error.indexOf("ERROR: 0:", index);
                    if (index < 0) { break; }
                    index += 9;
                    indexEnd = error.indexOf(':', index);
                    if (indexEnd > index) {
                        lineNum = parseInt(error.substring(index, indexEnd));
                        if ((!isNaN(lineNum)) && (lineNum > 0)) {
                            index = indexEnd + 1;
                            indexEnd = error.indexOf("ERROR: 0:", index);

                            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Bad Shade Line: '+lineNum});
                        }
                    }
                }
                return null;
            }

            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_status', message:'-> Shader Compiled OK <-'});
            return shader;
        }


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
            var cached = PipelineAPI.readCachedConfigKey("SHADERS", src);

            var diff = 2;

            for (var key in data) {
                program[key] = combineProgramFromSources(data[key]);

                if (cached) {
                    if (cached[key] != program[key]) {
                        if (!testShader(program[key], key)) {
                            console.log("Broke Good Shader", src, key, data);
                            return;
                        }
                    } else {
                        diff --;
                    }
                }

                if (!diff) {
                    console.log("Shader not changed", src, key);
                    return;
                }

                if (!testShader(program[key], key)) {
                    console.log("Bad Shader", key, data);
                    return;
                }

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

        ShaderBuilder.prototype.loadShaderData = function(glContext) {

            gl = glContext;

            mapThreeShaderChunks();
            new PipelineObject("SHADER_CHUNKS",   "SPE_CHUNKS", buildStringChunks);
            new PipelineObject("SHADER_PROGRAMS", "SPE_PROGRAMS", buildStringChunks);
            new PipelineObject("SHADERS_THREE",   "SPE_PARTICLE_SHADER", registerShaderProgram);
            new PipelineObject("SHADER_CHUNKS",   "INSTANCING_CHUNKS", buildStringChunks);
            new PipelineObject("SHADER_PROGRAMS", "INSTANCING_PROGRAMS", buildStringChunks);
            new PipelineObject("SHADERS_THREE",   "INSTANCING_RAW", registerShaderProgram);
            new PipelineObject("SHADERS_THREE",   "INSTANCING_COLOR", registerShaderProgram);
            new PipelineObject("SHADERS_THREE",   "INSTANCING_MIX", registerShaderProgram)

        };

        
        return ShaderBuilder;

    });