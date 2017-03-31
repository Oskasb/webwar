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

        var okCount = 0;


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

                console.error( [shader],error );
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

            okCount++;
            console.log("Shader OK:", okCount);
            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_status', message:'-> Shader ('+okCount+') Compiled OK <- '});
            return shader;
        }


        var ShaderBuilder = function() {
            this.shaderChunks = {};
        };


        var buildStringChunks = function(src, data) {
            var chunks = {}
            for (var key in data) {
                chunks[key] = data[key].join( "\n" );
                PipelineAPI.setCategoryKeyValue(src, key, chunks[key]+"\n");
            }
            notifyShaderDataUpdate();
        //    console.log("CACHE STRING CHUNKS:", src, chunks);
        };

        var mapThreeShaderChunks = function() {
            var chunks = {}
            for (var key in THREE.ShaderChunk) {
                chunks[key] = THREE.ShaderChunk[key];
                PipelineAPI.setCategoryKeyValue("THREE_CHUNKS", key, "\n" + chunks[key] + "\n");
            }
        //    console.log("CACHE THREE CHUNKS:", chunks);
        };

        var combineProgramFromSources = function(sources) {
            var programString = '';
            for (var i = 0; i < sources.length; i++) {
                programString += PipelineAPI.readCachedConfigKey(sources[i].source, sources[i].chunk) + "\n";
            }
            return programString;
        };


        var buildShaderPrograms = function(src, data) {

            var program = {};
            var cached = PipelineAPI.readCachedConfigKey("SHADERS", src);

            var diff = 2;

            for (var key in data) {
                program[key] = combineProgramFromSources(data[key]);

                if (!diff) {
                    console.log("Shader not changed", src, key);
                    return;
                }

                if (!testShader(program[key], key)) {
                    console.log("Bad Shader", key, data);

                    if (cached[key] != program[key]) {
                        console.log("Broke Good Shader", src, key, [PipelineAPI.getCachedConfigs()], data);
                        return;
                    }

                    return;
                } else {
                    console.log("Shader Test success: ", src, key)
                }

                if (cached) {
                    if (cached[key] == program[key]) {
                        diff --;
                    }
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

        var loadChunkIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADER_CHUNKS",   data[i], buildStringChunks)
            }
        };

        var loadProgramIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADER_PROGRAMS",   data[i], buildStringChunks)
            }
        };

        var loadShaderIndex = function(src, data) {
            for (var i = 0; i < data.length; i++) {
                new PipelineObject("SHADERS_THREE",   data[i], registerShaderProgram)
            }
        };

        ShaderBuilder.prototype.loadShaderData = function(glContext) {

            gl = glContext;

            mapThreeShaderChunks();

            new PipelineObject("SHADER_CHUNKS",   "LOAD_CHUNK_INDEX", loadChunkIndex);
            new PipelineObject("SHADER_PROGRAMS", "LOAD_PROGRAM_INDEX", loadProgramIndex);
            new PipelineObject("SHADERS_THREE",   "LOAD_SHADER_INDEX", loadShaderIndex);

        };

        
        return ShaderBuilder;

    });