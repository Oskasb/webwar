"use strict";

define([
        '3d/effects/particles/SPEutils',
        'PipelineObject'
    ],
    function(
        SPEutils,
        PipelineObject
    ) {

        var utils = SPEutils();
        var types = utils.types;

        var configureTXSettings = function(txMatSettings, texture) {
            var options = utils.ensureTypedArg( txMatSettings, types.OBJECT, {} );
            var txSettings = {};
            txSettings.texture  =  utils.ensureInstanceOf( texture, THREE.Texture, null );
            txSettings.tiles_x = utils.ensureTypedArg( options.settings.tiles_x, types.NUMBER, 1 );
            txSettings.tiles_y = utils.ensureTypedArg( options.settings.tiles_y, types.NUMBER, 1 );

            txSettings.texture.flipY = options.settings.flip_y;

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

            console.log("OPTIONS BUILT", txSettings, options);



            var material = new THREE.RawShaderMaterial({
                uniforms: {
                    map:   {value:txSettings.texture},
                    tiles: {value:new THREE.Vector2(txSettings.tiles_x, txSettings.tiles_y)}
                },
                side: THREE.FrontSide,
                vertexShader: txSettings.shaders.vertex,
                fragmentShader: txSettings.shaders.fragment,
                depthTest: options.depthTest,
                depthWrite: options.depthWrite,
                blending: options.blending,
                transparent: options.transparent
            });

            return material;
        };


        var ParticleMaterial = function(systemOptions, txMatSettings, store, readyCallback) {

            var options = configureOptions(systemOptions);
            // Ensure we have a map of options to play with
            var txSettings;


            var createMaterial = function(opts, txSettings) {
                store.texture = txSettings.texture;
                store.vertexShader = txSettings.shaders.vertex;
                store.fragmentShader = txSettings.shaders.fragment;
                store.material = setupShaderMaterial(txSettings, opts);
            };


            var applyShaders = function(src, data) {
                txSettings.shaders = data;
                createMaterial(options, txSettings);
                readyCallback(txSettings)
            };

            var applyTexture = function(src, data) {
                txSettings = configureTXSettings(txMatSettings, data);
                this.shaderPipe = new PipelineObject("SHADERS", txMatSettings.shader, applyShaders);
            }.bind(this);

            this.txPipe = new PipelineObject("THREE_TEXTURE", "map_"+txMatSettings.map, applyTexture);
        };

        ParticleMaterial.prototype.dispose = function() {
            this.shaderPipe.removePipelineObject();
            this.txPipe.removePipelineObject();
            delete this;
        };

        return ParticleMaterial;

    });