"use strict";

define([

    ],
    function(
    ) {

        var dataCurves = {
            rainbow:32,
            warmToCold:31,
            hotFire:30,
            fire:29,
            warmFire:28,
            hotToCool:27,
            orangeFire:26,
            smoke:25,
            dirt:24,
            brightMix:23,
            nearWhite:22,
            darkSmoke:21,
            redFlat:20,
            greenFlat:17,
            transparent:14,
            halfQuickIn:13,
            halfFadeIn:12,
            smooth:11,
            slowFadeOut:10,
            dampen:9,
            noiseFadeOut:8,
            quickFadeOut:7,
            quickIn:6,
            quickInSlowOut:5,
            zeroOneZero:4,
            oneZeroOne:3,
            zeroToOne:2,
            oneToZero:1
        };

        var ParamValue = function(param) {
            this.param = param;
            this.value = {min:0, max:0}
        };

        ParamValue.prototype.setValues = function(min, max) {
            this.value.min = min || this.value.min;
            this.value.max = max || this.value.max;
        };


        var ParamVec2 = function(param) {
            this.param = param;
            this.vec2 = {x:0, y:0, z:0, w:0, spread:{min:0, max:0}}
        };

        ParamVec2.prototype.setValues = function(x, y, min, max) {
            this.vec2.x = x || this.vec2.x;
            this.vec2.y = y || this.vec2.y;
            this.vec2.spread.min = min || this.vec2.spread.min;
            this.vec2.spread.max = max || this.vec2.spread.max;
        };


        var ParamVec4 = function(param) {
            this.param = param;
            this.vec4 = {x:0, y:0, z:0, w:0, spread:{min:0, max:0}}
        };

        ParamVec4.prototype.setValues = function(x, y, z, w, min, max) {
            this.vec4.x = x || this.vec4.x;
            this.vec4.y = y || this.vec4.y;
            this.vec4.z = z || this.vec4.z;
            this.vec4.w = w || this.vec4.w; 
            this.vec4.spread.min = min || this.vec4.spread.min;
            this.vec4.spread.max = max || this.vec4.spread.max;
        };
        
        var ConfiguredGpuEffect = function() {
            this.age           = new ParamValue("age");
            this.lifeTime      = new ParamValue("lifeTime");
            this.tiles         = new ParamVec2("tiles");
            this.position      = new ParamVec4("position");
            this.acceleration  = new ParamVec4("acceleration");
            this.velocity      = new ParamVec4("velocity");
            this.texelRowSelect= new ParamVec4("texelRowSelect");
            this.diffusors     = new ParamVec4("diffusors");
            this.init_params   = [
                {param:"gpu_sim", flag:true},
                this.age,
                this.lifeTime,
                this.tiles,
                this.position,
                this.acceleration,
                this.velocity,
                this.texelRowSelect,
                this.diffusors
            ];
            this.setDefaults();
        };

        ConfiguredGpuEffect.prototype.setDefaults = function() {
            this.age.setValues(0, 0.02);
            this.lifeTime.setValues(1, 2);
            this.tiles.setValues(0, 0, 0, 0);
            this.position.setValues(0, 0, 0, 8, 0, 0);
            this.acceleration.setValues(1, -9.81, 1, 1, 0, 0);
            this.velocity.setValues(0, 0, 0, 1, 0, 0);
            this.texelRowSelect.setValues(32, 1, 2, 1, 0, 0);
            this.diffusors.setValues(0.5, 0.3, 1, 1, 0, 0);
        };

        var effect = new ConfiguredGpuEffect();

        var EffectDataTranslator = function() {

        };


        EffectDataTranslator.interpretCustomEffectData = function(effectData, pCfg, customEffectData) {
            effect.setDefaults();          
            
            effect.lifeTime.setValues(pCfg.lifeTime.min, pCfg.lifeTime.max);
            effect.acceleration.setValues(pCfg.acceleration, pCfg.gravity, pCfg.acceleration, pCfg.spinAcceleration);
            effect.texelRowSelect.setValues(dataCurves[pCfg.colorCurve], dataCurves[pCfg.diffusionCurve], dataCurves[pCfg.scaleCurve], dataCurves[pCfg.alphaCurve]);
    //     console.log(dataCurves[pCfg.colorCurve], dataCurves[pCfg.diffusionCurve], dataCurves[pCfg.scaleCurve], dataCurves[pCfg.dragCurve])
            effect.diffusors.setValues(pCfg.velocityDiffusion, pCfg.accelerationDiffusion, pCfg.velocityFactor, pCfg.colorDiffusion);
            if (pCfg.spin) effect.velocity.setValues(null, null, null, pCfg.spin.value, pCfg.spin.min, pCfg.spin.max);
            if (pCfg.size) effect.position.setValues(null, null, null, pCfg.size.value, pCfg.size.min, pCfg.size.max);
            if (pCfg.velocitySpread) effect.velocity.setValues(null, null, null, null, pCfg.velocitySpread.min, pCfg.velocitySpread.max);
            
            effectData.gpuEffect = effect;
        };

        EffectDataTranslator.requestParticleEffect = function() {

        };



        return EffectDataTranslator;

    });