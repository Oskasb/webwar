"use strict";

define([
    'ThreeAPI',
        '3d/effects/particles/ParticleDataTexture',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        ParticleDataTexture,
        PipelineObject
    ) {


        var dataTextures = {};
        var mapTextures = {};



        var configureTXSettings = function(txSettings, options) {

            txSettings.data_texture = dataTextures[options.data_texture];
            if (options.data_texture) {
                txSettings.data_rows = options.settings.data_rows;
            }

            if (options.global_uniforms) {
                txSettings.global_uniforms = options.global_uniforms;
            }


            txSettings.texture =  mapTextures[options.particle_texture];
            txSettings.tiles_x =  options.settings.tiles_x;
            txSettings.tiles_y =  options.settings.tiles_y;

            txSettings.texture.flipY = options.settings.flip_y;

        };

        var configureOptions = function(opts, options) {

            // Set properties used to define the ShaderMaterial's appearance.
            opts.blending       = THREE[options.blending];
            opts.transparent    = options.transparent;
            opts.alphaTest      = parseFloat( options.alphaTest);
            opts.depthWrite     = options.depthWrite    ;
            opts.depthTest      = options.depthTest     ;
            opts.fog            = options.fog           ;

        };

        var matCount = 0;

        var ParticleMaterial = function(systemOptions, txMatSettings, readyCallback) {

            matCount++;

    //        console.log("new ParticleMaterial, count:", matCount);

            this.txSettings = {};
            this.opts = {};

            this.txMatSettings = txMatSettings;

            this.onReady = readyCallback;

            configureOptions(this.opts, systemOptions);

            this.setupDataTexture()

        };


        ParticleMaterial.prototype.setupMaterial = function() {


    //        console.log("OPTIONS BUILT", this.txSettings, this.opts);

            var uniforms = {
                systemTime: {value:0},
                alphaTest:  {value:this.opts.alphaTest},
                map:        {value:this.txSettings.texture},
                tiles:      {value:new THREE.Vector2(this.txSettings.tiles_x, this.txSettings.tiles_y)}
            };

            if (this.txSettings.data_texture) {
                //    txSettings.data_texture.generateMipmaps = false;
                uniforms.data_texture =  {value:this.txSettings.data_texture};
                uniforms.data_rows    =  {value:this.txSettings.data_rows}
            }

            if (this.txSettings.global_uniforms) {

                var addUniforms = {};

                for (var key in this.txSettings.global_uniforms) {
                    addUniforms[key] = this.txSettings.global_uniforms[key];
                }

            //    uniforms.fogColor = addUniforms.fogColor;

                for (var key in addUniforms) {
                    uniforms[key] = addUniforms[key];
                }
    //            console.log("GLOBAL UNIFORMS: ", uniforms, addUniforms);

            }
            
            
            this.material = new THREE.RawShaderMaterial({
                uniforms: uniforms,
                side: THREE.DoubleSide,
                vertexShader: this.txSettings.shaders.vertex,
                fragmentShader: this.txSettings.shaders.fragment,
                depthTest: this.opts.depthTest,
                depthWrite: this.opts.depthWrite,
                blending: this.opts.blending,
                transparent: this.opts.transparent
            });

            this.onReady(this.material);
        };


        ParticleMaterial.prototype.configureTxSettings = function() {
            configureTXSettings(this.txSettings, this.txMatSettings);

        };


        ParticleMaterial.prototype.setupShaders = function() {

            var _this = this;

            var applyShaders = function(src, data) {

                if (_this.txSettings.shaders != data) {
                    _this.txSettings.shaders = data;
                    _this.configureTxSettings();
                    _this.setupMaterial();
                }
            };

            this.shaderPipe = new PipelineObject("SHADERS", this.txMatSettings.shader, applyShaders);
        };
        

        ParticleMaterial.prototype.setupMapTexture = function() {

            var _this = this;

            var applyTexture = function(src, data) {
                mapTextures[_this.txMatSettings.particle_texture] = data;
                _this.setupShaders();
            };

            this.txPipe = new PipelineObject("THREE_TEXTURE", "particle_texture_"+this.txMatSettings.particle_texture, applyTexture);
        };


        ParticleMaterial.prototype.setupDataTexture = function() {

            var bindDataTexture = function(texture) {
                dataTextures[this.txMatSettings.data_texture] = texture;
                this.setupMapTexture();
            }.bind(this);

            if (this.txMatSettings.data_texture) {
                new ParticleDataTexture(this.txMatSettings.data_texture, bindDataTexture);
            } else {
                this.setupMapTexture();
            }
        };



        ParticleMaterial.prototype.dispose = function() {
            this.shaderPipe.removePipelineObject();
            this.txPipe.removePipelineObject();
            delete this;
        };

        return ParticleMaterial;

    });