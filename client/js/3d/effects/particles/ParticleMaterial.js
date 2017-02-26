"use strict";

define([
        '3d/effects/particles/SPEutils',
        '3d/effects/particles/ShaderAttribute',
        'PipelineObject'
    ],
    function(
        SPEutils,
        ShaderAttribute,
        PipelineObject
    ) {

        var utils = SPEutils();
        var types = utils.types;

        var configureTXSettings = function(txMatSettings, texture) {
            var options = utils.ensureTypedArg( txMatSettings, types.OBJECT, {} );

            var txSettings = {};
            var framesVec;

            if (options.default_frame_x && options.default_frame_y) {
                framesVec = new THREE.Vector2(options.default_frame_x, options.default_frame_y);
            }

            txSettings.texture           =  utils.ensureInstanceOf( texture, THREE.Texture, null );
            txSettings.textureFrames     =  utils.ensureInstanceOf(framesVec, THREE.Vector2, new THREE.Vector2( 1, 1 ) );
            txSettings.textureFrameCount =  utils.ensureTypedArg( options.tiles_x * options.tiles_y, types.NUMBER, 1);
            txSettings.textureLoop       =  utils.ensureTypedArg( options.loop, types.NUMBER, 1 );
            txSettings.rotate            = utils.ensureTypedArg( options.rotate, types.BOOLEAN, false );

            txSettings.textureFrames.max(new THREE.Vector2(1, 1));

            return txSettings;
        };

        var configureOptions = function(systemOptions) {

            var options = utils.ensureTypedArg( systemOptions, types.OBJECT, {} );

            var opts = {};
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

            return opts;
        };


        var setupShaderMaterial = function(txSettings, options) {

            console.log("OPTIONS BUILT", options);

            var material = new THREE.RawShaderMaterial({
                uniforms: {
                    map: {value:txSettings.texture},
                //    color: { value: new THREE.Color( 0xffffff ) },
                    time: {value: 0.0}
                },
                vertexShader: txSettings.shaders.vertex,
                fragmentShader: txSettings.shaders.fragment,
                depthTest: options.depthTest,
                depthWrite: options.depthWrite,
                blending: options.blending

            });
      

            return material;
        };
        


        var ParticleMaterial = function(systemOptions, txMatSettings, readyCallback) {

            this.uuid = THREE.Math.generateUUID();

            var options = configureOptions(systemOptions);
            // Ensure we have a map of options to play with
            var txSettings;

            var _this = this;

            this.attributes = {}  // setupAttributes();
            

            var createMaterial = function(opts, txSettings, readyCallback) {
                _this.texture = txSettings.texture;
                _this.vertexShader = txSettings.shaders.vertex;
                _this.fragmentShader = txSettings.shaders.fragment;
                _this.material = setupShaderMaterial(txSettings, opts);
                readyCallback(_this);
            };



            var applyTexture = function(src, data) {
                txSettings = configureTXSettings(txMatSettings, data);
                var applyShaders = function(src, data) {
                    txSettings.shaders = data;
                    createMaterial(options, txSettings, readyCallback);
                };

                new PipelineObject("SHADERS", txMatSettings.shader, applyShaders);
            };

            new PipelineObject("THREE_TEXTURE", "map_"+txMatSettings.map, applyTexture);
        };


        ParticleMaterial.prototype.spawnParticleEffect = function(effectData, pos, vel) {


        };

        return ParticleMaterial;

    });