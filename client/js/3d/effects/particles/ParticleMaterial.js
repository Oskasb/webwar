"use strict";

define([
        '3d/effects/particles/SPEutils',
        '3d/effects/particles/ShaderAttribute'
    ],
    function(
        SPEutils,
        ShaderAttribute
    ) {

        var utils = SPEutils();

        var ParticleMaterial = function(options) {

            // Ensure we have a map of options to play with
            options = utils.ensureTypedArg( options, types.OBJECT, {} );
            options.texture = utils.ensureTypedArg( options.texture, types.OBJECT, {} );

            // Assign a UUID to this instance
            this.uuid = THREE.Math.generateUUID();

            // If no `deltaTime` value is passed to the `SPE.Group.tick` function,
            // the value of this property will be used to advance the simulation.
            this.fixedTimeStep = utils.ensureTypedArg( options.fixedTimeStep, types.NUMBER, 0.016 );

            // Set properties used in the uniforms map, starting with the
            // texture stuff.
            this.texture = utils.ensureInstanceOf( options.texture.value, THREE.Texture, null );
            this.textureFrames = utils.ensureInstanceOf( options.texture.frames, THREE.Vector2, new THREE.Vector2( 1, 1 ) );
            this.textureFrameCount = utils.ensureTypedArg( options.texture.frameCount, types.NUMBER, this.textureFrames.x * this.textureFrames.y );
            this.textureLoop = utils.ensureTypedArg( options.texture.loop, types.NUMBER, 1 );
            this.textureFrames.max( new THREE.Vector2( 1, 1 ) );

            this.hasPerspective = utils.ensureTypedArg( options.hasPerspective, types.BOOLEAN, true );
            this.colorize = utils.ensureTypedArg( options.colorize, types.BOOLEAN, true );

            this.maxParticleCount = utils.ensureTypedArg( options.maxParticleCount, types.NUMBER, null );


            // Set properties used to define the ShaderMaterial's appearance.
            this.blending = utils.ensureTypedArg( options.blending, types.NUMBER, THREE.AdditiveBlending );
            this.transparent = utils.ensureTypedArg( options.transparent, types.BOOLEAN, true );
            this.alphaTest = parseFloat( utils.ensureTypedArg( options.alphaTest, types.NUMBER, 0.0 ) );
            this.depthWrite = utils.ensureTypedArg( options.depthWrite, types.BOOLEAN, false );
            this.depthTest = utils.ensureTypedArg( options.depthTest, types.BOOLEAN, true );
            this.fog = utils.ensureTypedArg( options.fog, types.BOOLEAN, true );
            this.scale = utils.ensureTypedArg( options.scale, types.NUMBER, 300 );

            // Where emitter's go to curl up in a warm blanket and live
            // out their days.
            this.emitters = [];
            this.emitterIDs = [];

            // Create properties for use by the emitter pooling functions.
            this._pool = [];
            this._poolCreationSettings = null;
            this._createNewWhenPoolEmpty = 0;

            // Whether all attributes should be forced to updated
            // their entire buffer contents on the next tick.
            //
            // Used when an emitter is removed.
            this._attributesNeedRefresh = false;
            this._attributesNeedDynamicReset = false;

            this.particleCount = 0;


            // Map of uniforms to be applied to the ShaderMaterial instance.
            this.uniforms = {
                texture: {
                    type: 't',
                    value: this.texture
                },
                textureAnimation: {
                    type: 'v4',
                    value: new THREE.Vector4(
                        this.textureFrames.x,
                        this.textureFrames.y,
                        this.textureFrameCount,
                        Math.max( Math.abs( this.textureLoop ), 1.0 )
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
                    value: this.scale
                }
            };


            var valueOverLifetimeLength = 4;

            // Add some defines into the mix...
            this.defines = {
                HAS_PERSPECTIVE: this.hasPerspective,
                COLORIZE: this.colorize,
                VALUE_OVER_LIFETIME_LENGTH: valueOverLifetimeLength,

                SHOULD_ROTATE_TEXTURE: false,
                SHOULD_ROTATE_PARTICLES: false,
                SHOULD_WIGGLE_PARTICLES: false,

                SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
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
                vertexShader: SPE.shaders.vertex,
                fragmentShader: SPE.shaders.fragment,
                blending: this.blending,
                transparent: this.transparent,
                alphaTest: this.alphaTest,
                depthWrite: this.depthWrite,
                depthTest: this.depthTest,
                defines: this.defines,
                fog: this.fog
            } );
            
        };

        ParticleMaterial.prototype.initParticleRenderer = function(effectData, pos, vel) {


        };

        ParticleMaterial.prototype.spawnParticleEffect = function(effectData, pos, vel) {


        };

        return ParticleMaterial;

    });