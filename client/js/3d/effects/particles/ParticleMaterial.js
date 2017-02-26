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

        var configureTXSettings = function(txMatSettings) {
            var options = utils.ensureTypedArg( txMatSettings, types.OBJECT, {} );

            var txSettings = {};
            var framesVec;

            if (options.default_frame_x && options.default_frame_y) {
                framesVec = new THREE.Vector2(options.default_frame_x, options.default_frame_y);
            }

            txSettings.texture           =  utils.ensureInstanceOf( options.texture, THREE.Texture, null );
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

        var ParticleMaterial = function(systemOptions, txMatSettings, readyCallback) {

            this.uuid = THREE.Math.generateUUID();

            var options = configureOptions(systemOptions);
            // Ensure we have a map of options to play with
            var txSettings;

            var _this = this;

            var applyTexture = function(src, data) {
                txSettings.texture = data;
                txSettings = configureTXSettings(txMatSettings);

                var applyShaders = function(src, data) {
                    txSettings.shaders = data;
                    _this.createMaterial(options, txSettings);
                };

                new PipelineObject("SHADERS", txMatSettings.shader, applyShaders);
            };

            new PipelineObject("THREE_TEXTURE", "map_"+txMatSettings.map, applyTexture);
        };


        ParticleMaterial.prototype.createMaterial = function(options, txSettings) {


            this.fixedTimeStep = 0.016;

            this.perspective = utils.ensureTypedArg( options.perspective, types.BOOLEAN, true );

            // Map of uniforms to be applied to the ShaderMaterial instance.
            this.uniforms = {
                texture: {
                    type: 't',
                    value: txSettings.texture
                },
                textureAnimation: {
                    type: 'v4',
                    value: new THREE.Vector4(
                        txSettings.textureFrames.x,
                        txSettings.textureFrames.y,
                        txSettings.textureFrameCount,
                        Math.max( Math.abs( txSettings.textureLoop ), 1.0 )
                    )
                },
                fogColor: {
                    type: 'c',
                    value: null
                },
                fogNear: {
                    type: 'f',
                    value: 10
                },
                fogFar: {
                    type: 'f',
                    value: 200
                },
                fogDensity: {
                    type: 'f',
                    value: 0.5
                },
                deltaTime: {
                    type: 'f',
                    value: 0
                },
                runTime: {
                    type: 'f',
                    value: 0
                },
                scale: {
                    type: 'f',
                    value: options.scale
                }
            };

            var valueOverLifetimeLength = 4;

            // Add some defines into the mix...
            this.defines = {
                HAS_PERSPECTIVE: options.perspective,
                COLORIZE: options.colorize,
                VALUE_OVER_LIFETIME_LENGTH: valueOverLifetimeLength,
                SHOULD_ROTATE_TEXTURE: txSettings.rotate,
                SHOULD_ROTATE_PARTICLES: options.rotate,
                SHOULD_WIGGLE_PARTICLES: options.wiggle,
                SHOULD_CALCULATE_SPRITE: txSettings.textureFrames.x > 1 || txSettings.textureFrames.y > 1
            };

            // Map of all attributes to be applied to the particles.
            //
            // See SPE.ShaderAttribute for a bit more info on this bit.
            this.attributes = {
                position: new ShaderAttribute( 'v3', true ),
                acceleration: new ShaderAttribute( 'v4', true ), // w component is drag
                velocity: new ShaderAttribute( 'v3', true ),
                rotation: new ShaderAttribute( 'v4', true ),
                rotationCenter: new ShaderAttribute( 'v3', true ),
                params: new ShaderAttribute( 'v4', true ), // Holds (alive, age, delay, wiggle)
                size: new ShaderAttribute( 'v4', true ),
                angle: new ShaderAttribute( 'v4', true ),
                color: new ShaderAttribute( 'v4', true ),
                opacity: new ShaderAttribute( 'v4', true )
            };

            this.attributeKeys = Object.keys( this.attributes );
            this.attributeCount = this.attributeKeys.length;

            // Create the ShaderMaterial instance that'll help render the
            // particles.
            this.material = new THREE.ShaderMaterial( {
                uniforms: this.uniforms,
                defines: this.defines,
                vertexShader: txSettings.shaders.vertex,
                fragmentShader: txSettings.shaders.fragment,
                blending: options.blending,
                transparent: options.transparent,
                alphaTest: options.alphaTest,
                depthWrite: options.depthWrite,
                depthTest: options.depthTest,
                fog: options.fog
            } );

        };

        
        ParticleMaterial.prototype.spawnParticleEffect = function(effectData, pos, vel) {


        };

        return ParticleMaterial;

    });