"use strict";

define([
    'ThreeAPI',
        '3d/effects/particles/SPEutils',
        '3d/effects/particles/ParticleDataTexture',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        SPEutils,
        ParticleDataTexture,
        PipelineObject
    ) {


        var dataTextures = {};
        var mapTextures = {};


        var utils = SPEutils();
        var types = utils.types;

        var configureTXSettings = function(txSettings, txMatSettings) {
            var options = utils.ensureTypedArg( txMatSettings, types.OBJECT, {} );

            txSettings.data_texture = utils.ensureInstanceOf( dataTextures[txMatSettings.data_texture], THREE.Texture, null );
            if (txMatSettings.data_texture) {
                txSettings.data_rows = utils.ensureTypedArg( options.settings.data_rows, types.NUMBER, null );
            }

            if (txMatSettings.global_uniforms) {
                txSettings.global_uniforms = txMatSettings.global_uniforms;
            }


            txSettings.texture = utils.ensureInstanceOf( mapTextures[txMatSettings.particle_texture], THREE.Texture, null );
            txSettings.tiles_x = utils.ensureTypedArg( options.settings.tiles_x, types.NUMBER, 1 );
            txSettings.tiles_y = utils.ensureTypedArg( options.settings.tiles_y, types.NUMBER, 1 );

            txSettings.texture.flipY = options.settings.flip_y;

        };

        var configureOptions = function(opts, systemOptions) {

            var options = utils.ensureTypedArg( systemOptions, types.OBJECT, {} );

            // Set properties used to define the ShaderMaterial's appearance.
            opts.blending       = utils.ensureTypedArg( THREE[options.blending], types.NUMBER, THREE.AdditiveBlending );
            opts.transparent    = utils.ensureTypedArg( options.transparent,     types.BOOLEAN, true );
            opts.alphaTest      = parseFloat(utils.ensureTypedArg( options.alphaTest, types.NUMBER, 0.0 ) );
            opts.depthWrite     = utils.ensureTypedArg( options.depthWrite, types.BOOLEAN, false );
            opts.depthTest      = utils.ensureTypedArg( options.depthTest, types.BOOLEAN, true );
            opts.fog            = utils.ensureTypedArg( options.fog, types.BOOLEAN, true );
            opts.scale          = utils.ensureTypedArg( options.scale, types.NUMBER, 300 );
            opts.colorize       = utils.ensureTypedArg( options.colorize, types.BOOLEAN, true );
            opts.perspective    = utils.ensureTypedArg( options.hasPerspective, types.BOOLEAN, true );
            opts.rotate         = utils.ensureTypedArg( options.rotate, types.BOOLEAN, false );
            opts.wiggle         = utils.ensureTypedArg( options.wiggle, types.BOOLEAN, false );

        };


        var matCount = 0;

        var ParticleMaterial = function(systemOptions, txMatSettings, readyCallback) {

            matCount++;

            console.log("new ParticleMaterial, count:", matCount);

            this.txSettings = {};
            this.opts = {};

            this.txMatSettings = txMatSettings;

            this.onReady = readyCallback;

            configureOptions(this.opts, systemOptions);

            this.setupDataTexture()

        };


        ParticleMaterial.prototype.setupMaterial = function() {


            console.log("OPTIONS BUILT", this.txSettings, this.opts);

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
                console.log("GLOBAL UNIFORMS: ", uniforms, addUniforms);

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

            var applyShaders = function(src, data) {
                this.txSettings.shaders = data;
                this.configureTxSettings()
                this.setupMaterial();
            }.bind(this);

            this.shaderPipe = new PipelineObject("SHADERS", this.txMatSettings.shader, applyShaders);
        };
        

        ParticleMaterial.prototype.setupMapTexture = function() {

            var applyTexture = function(src, data) {
                mapTextures[this.txMatSettings.particle_texture] = data;
                this.setupShaders();
            }.bind(this);

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